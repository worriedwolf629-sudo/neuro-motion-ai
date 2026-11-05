import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Camera, AlertCircle, RefreshCw, CheckCircle2, VideoOff } from 'lucide-react';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm base
];

export default function HandTrackerCanvas({
  onLandmarksUpdate,
  isRecording,
  assessmentMode, // 'tremor' | 'tapping' | 'idle'
  sharedStream,   // Optional parent shared MediaStream
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

  // Initialize HandLandmarker from @mediapipe/tasks-vision
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

        // Try local model first, fallback to Google CDN
        const landmarker = await HandLandmarker.createFromOptions(wasmFileset, {
          baseOptions: {
            modelAssetPath: "/models/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        }).catch(async (e) => {
          console.warn("Local model load failed, falling back to Google Cloud CDN:", e);
          return await HandLandmarker.createFromOptions(wasmFileset, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.6,
            minHandPresenceConfidence: 0.6,
            minTrackingConfidence: 0.6
          });
        });

        if (isCancelled) return;
        handLandmarkerRef.current = landmarker;
        setModelLoading(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe Tasks-Vision:", err);
        if (!isCancelled) {
          setCameraError("Failed to load computer vision model. Please check network/GPU support.");
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

  // Initialize Camera Stream (Shared or Local)
  useEffect(() => {
    let isMounted = true;

    async function setupCamera() {
      if (sharedStream) {
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
        if (onStreamReady) onStreamReady(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error("Play error:", e));
            if (isMounted) setCameraActive(true);
          };
        }
      } catch (err) {
        console.error("Webcam getUserMedia failed:", err);
        if (isMounted) {
          setCameraError(err.name === 'NotAllowedError'
            ? "Camera permission denied. Please allow camera access in your browser settings."
            : `Camera error: ${err.message || 'Device not available'}`);
          setCameraActive(false);
        }
      }
    }

    setupCamera();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [sharedStream, onStreamReady]);

  // Frame processing loop using requestAnimationFrame
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = handLandmarkerRef.current;

    if (video && canvas && landmarker && video.readyState >= 2) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const now = performance.now();

        // FPS Calculation
        fpsCounterRef.current.count++;
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(Math.round((fpsCounterRef.current.count * 1000) / (now - fpsCounterRef.current.lastTime)));
          fpsCounterRef.current.count = 0;
          fpsCounterRef.current.lastTime = now;
        }

        // Run detection with exact timestamp
        const results = landmarker.detectForVideo(video, now);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results && results.landmarks && results.landmarks.length > 0) {
            setHandDetected(true);
            const landmarks = results.landmarks[0];

            // Send coordinates to active recording listener
            if (onLandmarksUpdate) {
              onLandmarksUpdate({
                timestamp_ms: now,
                landmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z || 0.0 }))
              });
            }

            // Draw skeleton connections
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#06B6D4'; // Vibrant Cyan
            for (const [start, end] of HAND_CONNECTIONS) {
              const p1 = landmarks[start];
              const p2 = landmarks[end];
              ctx.beginPath();
              ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
              ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
              ctx.stroke();
            }

            // Draw landmark points
            landmarks.forEach((lm, idx) => {
              const x = lm.x * canvas.width;
              const y = lm.y * canvas.height;
              ctx.beginPath();

              if (assessmentMode === 'tapping' && (idx === 4 || idx === 8)) {
                // Focus: Thumb tip (4) & Index tip (8)
                ctx.arc(x, y, 7, 0, 2 * Math.PI);
                ctx.fillStyle = idx === 4 ? '#F59E0B' : '#10B981';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
              } else if (assessmentMode === 'tremor' && idx === 8) {
                // Focus: Index tip (8)
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = '#EC4899';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
              } else {
                ctx.arc(x, y, idx === 0 ? 5 : 3.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#38BDF8';
                ctx.fill();
              }
            });

            // In finger-tapping mode, draw connection line
            if (assessmentMode === 'tapping') {
              const pThumb = landmarks[4];
              const pIndex = landmarks[8];
              ctx.beginPath();
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle = '#FCD34D';
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
    <div className="relative w-full aspect-[4/3] max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
      {/* Underlying Webcam Video */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover transform -scale-x-100"
      />

      {/* Hand Skeleton Overlay Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
      />

      {/* Top Overlay HUD Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow">
          <div className={`w-2.5 h-2.5 rounded-full ${cameraActive && !modelLoading ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-mono font-medium tracking-tight text-slate-200">
            {modelLoading ? 'MODEL INIT...' : cameraActive ? `${fps} FPS` : 'OFFLINE'}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow">
          {handDetected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-semibold text-teal-300">HAND IN FRAME</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span className="text-xs font-medium text-amber-300">POSITION HAND</span>
            </>
          )}
        </div>
      </div>

      {/* Active Recording Pill */}
      {isRecording && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-rose-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-white" />
          RECORDING ACTIVE ({assessmentMode.toUpperCase()})
        </div>
      )}

      {/* Camera Error Modal */}
      {cameraError && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10">
          <VideoOff className="w-10 h-10 text-rose-500 mb-3" />
          <p className="text-sm font-semibold text-slate-200 mb-1">Camera Notice</p>
          <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Page
          </button>
        </div>
      )}
    </div>
  );
}
