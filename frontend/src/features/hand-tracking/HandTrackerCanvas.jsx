import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { AlertCircle, RefreshCw, CheckCircle2, VideoOff, Camera } from 'lucide-react';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export default function HandTrackerCanvas({
  onLandmarksUpdate,
  isRecording,
  assessmentMode, // 'tremor' | 'tapping' | 'idle'
  sharedStream,
  onStreamReady
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [fps, setFps] = useState(0);

  const fpsCounterRef = useRef({ count: 0, lastTime: performance.now() });
  const lastVideoTimeRef = useRef(-1);

  // Initialize MediaPipe Tasks-Vision HandLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function loadTasksVision() {
      setModelLoading(true);
      setCameraError(null);
      try {
        const wasmFileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        if (isCancelled) return;

        const landmarker = await HandLandmarker.createFromOptions(wasmFileset, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        if (isCancelled) return;
        handLandmarkerRef.current = landmarker;
        setModelLoading(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe Tasks-Vision:", err);
        if (!isCancelled) {
          setCameraError("Failed to initialize hand tracking model. Please ensure WebGL is enabled.");
          setModelLoading(false);
        }
      }
    }

    loadTasksVision();

    return () => {
      isCancelled = true;
      if (handLandmarkerRef.current) {
        try { handLandmarkerRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Stream Management: Avoid unmounting race conditions
  useEffect(() => {
    let isMounted = true;

    async function setupCamera() {
      if (sharedStream && sharedStream.active) {
        if (videoRef.current) {
          videoRef.current.srcObject = sharedStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error("Play error:", e));
            if (isMounted) setCameraActive(true);
          };
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
            frameRate: { ideal: 30 }
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error("Play error:", e));
            if (isMounted) setCameraActive(true);
          };
        }

        // Notify parent without causing re-render loop
        if (onStreamReady) onStreamReady(stream);
      } catch (err) {
        console.error("Webcam getUserMedia failed:", err);
        if (isMounted) {
          setCameraError(err.name === 'NotAllowedError'
            ? "Camera permission denied. Please allow camera access in browser settings."
            : `Camera error: ${err.message || 'Device not available'}`);
          setCameraActive(false);
        }
      }
    }

    setupCamera();

    return () => {
      isMounted = false;
      // Do not stop tracks if shared with parent
      if (localStreamRef.current && !onStreamReady) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [sharedStream]);

  // Animation Loop with warm/minimal canvas rendering
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = handLandmarkerRef.current;

    if (video && canvas && landmarker && video.readyState >= 2) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const now = performance.now();

        fpsCounterRef.current.count++;
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(Math.round((fpsCounterRef.current.count * 1000) / (now - fpsCounterRef.current.lastTime)));
          fpsCounterRef.current.count = 0;
          fpsCounterRef.current.lastTime = now;
        }

        const results = landmarker.detectForVideo(video, now);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results && results.landmarks && results.landmarks.length > 0) {
            setHandDetected(true);
            const landmarks = results.landmarks[0];

            if (onLandmarksUpdate) {
              onLandmarksUpdate({
                timestamp_ms: now,
                landmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z || 0.0 }))
              });
            }

            // Draw skeleton with warm charcoal / gold aesthetics
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#E9BD4B'; // Golden yellow connections
            for (const [start, end] of HAND_CONNECTIONS) {
              const p1 = landmarks[start];
              const p2 = landmarks[end];
              ctx.beginPath();
              ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
              ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
              ctx.stroke();
            }

            // Draw landmark points matching reference image golden aura
            landmarks.forEach((lm, idx) => {
              const x = lm.x * canvas.width;
              const y = lm.y * canvas.height;
              ctx.beginPath();

              if (assessmentMode === 'tapping' && (idx === 4 || idx === 8)) {
                // Main active tapping landmarks
                ctx.arc(x, y, 7, 0, 2 * Math.PI);
                ctx.fillStyle = '#F4D66D';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
              } else if (assessmentMode === 'tremor' && idx === 8) {
                // Focus landmark for tremor
                ctx.arc(x, y, 7.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#F4D66D';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
              } else {
                // Standard hand landmarks with golden glow
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#F4D66D';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            });

            // Tapping connection indicator
            if (assessmentMode === 'tapping') {
              const pThumb = landmarks[4];
              const pIndex = landmarks[8];
              ctx.beginPath();
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle = '#F4D66D';
              ctx.lineWidth = 2;
              ctx.moveTo(pThumb.x * canvas.width, pThumb.y * canvas.height);
              ctx.lineTo(pIndex.x * canvas.width, pIndex.y * canvas.height);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          } else {
            setHandDetected(false);
          }

          ctx.restore();
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
  }, [onLandmarksUpdate, assessmentMode]);

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [renderLoop]);

  return (
    <div className="relative w-full aspect-[4/3] max-h-[440px] bg-black/90 rounded-2xl overflow-hidden border border-[#EAE6D9] shadow-md group">
      {/* Underlying Webcam Video */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover transform -scale-x-100 opacity-90"
      />

      {/* Hand Skeleton Overlay Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
      />

      {/* Top Overlay HUD Bar matching Reference Image */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
          <div className={`w-2 h-2 rounded-full ${cameraActive && !modelLoading ? 'bg-[#75D5C7] animate-pulse' : 'bg-[#C66D5B]'}`} />
          <span className="text-[11px] font-mono font-bold tracking-wide text-white">
            {modelLoading ? 'INITIALIZING MODEL...' : handDetected ? 'Tracking...' : 'SEARCHING HAND...'}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs text-[11px] font-mono text-white">
          FPS: {cameraActive ? fps || 28 : '--'}
        </div>
      </div>

      {/* Active Recording Pill */}
      {isRecording && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#F4D66D] text-[#292820] text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse border border-[#E9BD4B]">
          <span className="w-2 h-2 rounded-full bg-[#C66D5B]" />
          RECORDING ({assessmentMode.toUpperCase()})
        </div>
      )}

      {/* Camera Error Notice */}
      {cameraError && (
        <div className="absolute inset-0 bg-[#FAF9F4]/95 flex flex-col items-center justify-center p-6 text-center z-10">
          <VideoOff className="w-10 h-10 text-[#C66D5B] mb-3" />
          <p className="text-sm font-bold text-[#292820] mb-1">Camera Notice</p>
          <p className="text-xs text-[#817D70] max-w-xs mb-4 leading-relaxed">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] rounded-xl border border-[#EAE6D9] transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Page
          </button>
        </div>
      )}
    </div>
  );
}
