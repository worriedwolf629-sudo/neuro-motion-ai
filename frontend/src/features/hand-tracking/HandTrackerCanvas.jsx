import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

// Hand landmark connections (21 points)
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
  qualityTelemetry
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [fps, setFps] = useState(0);

  const fpsCounterRef = useRef({ count: 0, lastTime: performance.now() });
  const cameraInstanceRef = useRef(null);
  const handsInstanceRef = useRef(null);

  const handleResults = useCallback((results) => {
    // Measure FPS
    const now = performance.now();
    fpsCounterRef.current.count++;
    if (now - fpsCounterRef.current.lastTime >= 1000) {
      setFps(Math.round((fpsCounterRef.current.count * 1000) / (now - fpsCounterRef.current.lastTime)));
      fpsCounterRef.current.count = 0;
      fpsCounterRef.current.lastTime = now;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);
      const landmarks = results.multiHandLandmarks[0];

      // Forward landmarks to parent recording buffer
      if (onLandmarksUpdate) {
        onLandmarksUpdate({
          timestamp_ms: performance.now(),
          landmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z || 0.0 }))
        });
      }

      // Draw hand skeleton
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

        // Highlight thumb (4) and index (8) tips in tapping mode
        if (assessmentMode === 'tapping' && (idx === 4 || idx === 8)) {
          ctx.arc(x, y, 7, 0, 2 * Math.PI);
          ctx.fillStyle = idx === 4 ? '#F59E0B' : '#10B981'; // Amber thumb, Emerald index
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (assessmentMode === 'tremor' && idx === 8) {
          // Highlight index tip for tremor tracking
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = '#EC4899'; // Pink focus
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

      // In finger tapping mode, draw line connecting thumb tip (4) and index tip (8)
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
  }, [onLandmarksUpdate, assessmentMode]);

  useEffect(() => {
    let isMounted = true;

    async function initCameraAndMediaPipe() {
      if (!window.Hands || !window.Camera) {
        console.warn("MediaPipe Hands library loading...");
        return;
      }

      try {
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65
        });

        hands.onResults(handleResults);
        handsInstanceRef.current = hands;

        if (videoRef.current) {
          const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsInstanceRef.current) {
                await handsInstanceRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });

          await camera.start();
          if (isMounted) {
            cameraInstanceRef.current = camera;
            setCameraActive(true);
            setCameraError(null);
          }
        }
      } catch (err) {
        console.error("Camera init failed:", err);
        if (isMounted) {
          setCameraError(err.message || "Failed to initialize webcam");
          setCameraActive(false);
        }
      }
    }

    initCameraAndMediaPipe();

    return () => {
      isMounted = false;
      if (cameraInstanceRef.current) {
        try { cameraInstanceRef.current.stop(); } catch (e) {}
      }
      if (handsInstanceRef.current) {
        try { handsInstanceRef.current.close(); } catch (e) {}
      }
    };
  }, [handleResults]);

  return (
    <div className="relative w-full aspect-[4/3] max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
      {/* Underlying Webcam Video */}
      <video
        ref={videoRef}
        playsInline
        muted
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
          <div className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-mono font-medium tracking-tight text-slate-200">
            {cameraActive ? `${fps} FPS` : 'OFFLINE'}
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
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
          <p className="text-sm font-semibold text-slate-200 mb-1">Webcam Access Restricted</p>
          <p className="text-xs text-slate-400 max-w-xs mb-4">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
          </button>
        </div>
      )}
    </div>
  );
}
