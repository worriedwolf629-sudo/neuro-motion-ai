import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  Radio,
  Activity,
  RotateCcw,
  Pause
} from 'lucide-react';
import HandTrackerCanvas from '../features/hand-tracking/HandTrackerCanvas';
import { analyzeTremorKinematics, analyzeFingerTappingKinematics } from '../features/analysis/kinematicsEngine';
import FlowingRibbon from '../components/FlowingRibbon';

export default function LiveAssessment({
  mode, // 'tremor' | 'tapping'
  sharedStream,
  onStreamReady,
  onAssessmentCompleted,
  setActivePage
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationData, setCalibrationData] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tremorPhase, setTremorPhase] = useState('rest');
  const [restingTremor, setRestingTremor] = useState(null);
  const [liveTelemetry, setLiveTelemetry] = useState(null);

  const landmarkBufferRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const calibrationSamplesRef = useRef([]);
  const lastTelemetryUpdateRef = useRef(0);

  // Auto-stop recording at 10s
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 10) {
            stopTest();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleLandmarkSample = (sample) => {
    if (isRecording) {
      landmarkBufferRef.current.push(sample);
      // Refresh the descriptive live readout at 2 Hz to keep camera rendering smooth.
      if (sample.timestamp_ms - lastTelemetryUpdateRef.current >= 500) {
        lastTelemetryUpdateRef.current = sample.timestamp_ms;
        const captured = landmarkBufferRef.current;
        const results = mode === 'tremor'
          ? analyzeTremorKinematics(captured, 30.0)
          : analyzeFingerTappingKinematics(captured, calibrationData?.threshold, 30.0);
        setLiveTelemetry({ ...results, sample_count: captured.length });
      }
    }
    if (isCalibrating && sample.landmarks && sample.landmarks.length >= 10) {
      const lm = sample.landmarks;
      const d = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
      const scale = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y) || 1.0;
      calibrationSamplesRef.current.push(d / scale);
    }
  };

  const startCalibration = () => {
    calibrationSamplesRef.current = [];
    setIsCalibrating(true);
    setNotice(null);
    setTimeout(() => {
      setIsCalibrating(false);
      const samples = calibrationSamplesRef.current;
      if (samples.length > 10) {
        samples.sort((a, b) => a - b);
        const minVal = samples[Math.floor(samples.length * 0.1)];
        const maxVal = samples[Math.floor(samples.length * 0.9)];
        setCalibrationData({
          closedDist: Number(minVal.toFixed(3)),
          openDist: Number(maxVal.toFixed(3)),
          threshold: Number(((minVal + maxVal) / 2).toFixed(3))
        });
      }
    }, 3000);
  };

  const startTest = () => {
    landmarkBufferRef.current = [];
    lastTelemetryUpdateRef.current = 0;
    setLiveTelemetry(null);
    setNotice(null);
    setIsRecording(true);
  };

  const stopTest = () => {
    setIsRecording(false);
    const captured = [...landmarkBufferRef.current];

    if (captured.length < 20) {
      setNotice("Recording duration was too short (<20 frames). Please keep hand in frame for at least 3-5 seconds.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        if (mode === 'tremor') {
          const results = analyzeTremorKinematics(captured, 30.0);
          if (!restingTremor) {
            setRestingTremor(results);
            setTremorPhase('cognitive');
            setNotice('Rest phase saved. For the second phase, keep your hand relaxed and perform a simple mental task, such as counting backward.');
            setIsProcessing(false);
            return;
          }

          const amplification = restingTremor.rms_amplitude > 0
            ? Number((results.rms_amplitude / restingTremor.rms_amplitude).toFixed(2))
            : null;
          onAssessmentCompleted('tremor', {
            ...restingTremor,
            phase1: restingTremor,
            phase2: results,
            cognitive_amplification: amplification
          });
        } else {
          const results = analyzeFingerTappingKinematics(captured, calibrationData?.threshold, 30.0);
          onAssessmentCompleted('tapping', results);
        }
        setIsProcessing(false);
        setActivePage('results');
      } catch (err) {
        console.error(err);
        setNotice(`Processing error: ${err.message}`);
        setIsProcessing(false);
      }
    }, 300);
  };

  const resetTest = () => {
    setIsRecording(false);
    landmarkBufferRef.current = [];
    setRecordingSeconds(0);
    setLiveTelemetry(null);
    setRestingTremor(null);
    setTremorPhase('rest');
    setNotice(null);
  };

  const timerPercent = Math.min(100, (recordingSeconds / 10) * 100);
  const remainingSeconds = 10 - recordingSeconds;

  return (
    <div className="relative p-6 sm:p-8 space-y-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background Flowing Ribbon layer */}
      <FlowingRibbon position="full" opacity={0.75} className="absolute inset-0 pointer-events-none" />

      {/* Header section matching Reference Image */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#817D70] mb-1">
            <span onClick={() => setActivePage('assessments')} className="cursor-pointer hover:text-[#292820] transition">Assessments</span>
            <span>&gt;</span>
            <span className="font-bold text-[#292820]">
              {mode === 'tremor' ? 'Resting Tremor' : 'Finger Tapping'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-heading text-[#292820] tracking-tight">
            {mode === 'tremor' ? 'Resting Tremor Assessment' : 'Rapid Finger-Tapping Assessment'}
          </h2>
          <p className="text-xs text-[#817D70] mt-0.5">
            {mode === 'tremor'
              ? 'Measure hand movement characteristics during a resting pose.'
              : 'Quantify repetitive thumb-index tapping frequency and fatigue rate.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#EAE6D9] text-xs font-mono font-bold text-[#292820] shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#E9BD4B]" />
            ~10 seconds phase
          </span>
          <button
            onClick={() => setActivePage('assessments')}
            className="text-xs font-semibold text-[#817D70] hover:text-[#292820] px-4 py-1.5 rounded-full border border-[#EAE6D9] bg-white transition shadow-xs"
          >
            Change Protocol
          </button>
        </div>
      </div>

      {notice && (
        <div className="relative z-10 bg-[#FAF9F4] border border-[#D99A38] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#292820] shadow-xs">
          <AlertTriangle className="w-4 h-4 text-[#D99A38] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {mode === 'tremor' && (
        <div className="relative z-10 flex items-center gap-2 text-xs text-[#817D70]">
          <span className="font-mono font-bold text-[#292820] px-2.5 py-0.5 rounded-full bg-white border border-[#EAE6D9]">
            {tremorPhase === 'rest' ? 'PHASE 1 OF 2' : 'PHASE 2 OF 2'}
          </span>
          <span className="font-semibold text-[#292820]">
            {tremorPhase === 'rest' ? 'Resting Hand Baseline' : 'Cognitive Distraction Load'}
          </span>
        </div>
      )}

      {/* Main Grid: Camera Viewport (Left) & Instructions Card (Right) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Webcam Card & Bottom Controls */}
        <div className="lg:col-span-8 space-y-4">
          {/* Central Camera Card */}
          <div className="card-flowing rounded-3xl p-4 bg-white/95 overflow-hidden">
            <HandTrackerCanvas
              onLandmarksUpdate={handleLandmarkSample}
              isRecording={isRecording}
              assessmentMode={mode}
              sharedStream={sharedStream}
              onStreamReady={onStreamReady}
            />
          </div>

          {/* Bottom Action Controls matching Reference Screenshot */}
          <div className="card-flowing rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4 bg-white/95">
            <button
              onClick={resetTest}
              disabled={isRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F5F1E9] text-[#292820] text-xs font-semibold border border-[#EAE6D9] shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#817D70]" />
              Retake
            </button>

            {!isRecording ? (
              <button
                onClick={startTest}
                disabled={isProcessing}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-sm rounded-full border border-[#E9BD4B] shadow-md hover:shadow-lg transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                {mode === 'tremor' && restingTremor ? 'Start Cognitive Phase' : 'Start Test'}
              </button>
            ) : (
              <button
                onClick={stopTest}
                className="flex items-center gap-2 px-8 py-3 bg-[#C66D5B] hover:bg-[#B55C4A] text-white font-bold text-sm rounded-full shadow-md transition animate-pulse active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop & Compute
              </button>
            )}

            <button
              onClick={() => setIsRecording(false)}
              disabled={!isRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F5F1E9] text-[#292820] text-xs font-semibold border border-[#EAE6D9] shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Pause className="w-3.5 h-3.5 text-[#817D70]" />
              Pause
            </button>

            {mode === 'tapping' && !isRecording && (
              <button
                onClick={startCalibration}
                disabled={isCalibrating}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#FAF9F4] hover:bg-[#F5F1E9] text-[#292820] border border-[#EAE6D9] transition"
              >
                <Sliders className="w-3.5 h-3.5 text-[#E9BD4B]" />
                {isCalibrating ? 'Calibrating (3s)...' : calibrationData ? 'Re-Calibrate' : 'Calibrate Range'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Instructions & Circular Progress Timer */}
        <div className="lg:col-span-4 card-flowing rounded-3xl p-6 bg-white/95 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#292820] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E9BD4B]" />
              Instructions
            </h3>

            <div className="space-y-3 text-xs text-[#817D70]">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] text-[#292820] font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="leading-snug">
                  {mode === 'tremor' ? 'Keep your hand relaxed and still' : 'Hold hand upright facing webcam'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] text-[#292820] font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="leading-snug">Ensure good lighting</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] text-[#292820] font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <p className="leading-snug">
                  {mode === 'tremor' ? 'Avoid large movements' : 'Tap thumb and index as wide as possible'}
                </p>
              </div>
            </div>
          </div>

          {/* Circular Countdown Progress Ring matching Reference Image */}
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Background ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#FAF9F4"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#EAE6D9"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#F4D66D"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * timerPercent) / 100}
                  className="transition-all duration-500 ease-linear"
                />
              </svg>

              {/* Center Countdown Digit */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-mono text-[#292820]">
                  {isRecording ? remainingSeconds : '10'}
                </span>
              </div>
            </div>

            <p className="text-xs font-semibold text-[#817D70]">
              {isRecording ? 'Recording in progress...' : 'Get ready...'}
            </p>
          </div>

          <div className="pt-3 border-t border-[#EAE6D9] text-[10px] text-[#817D70] space-y-1">
            <p className="font-semibold text-[#292820]">Target Sampling Quality:</p>
            <p>Uniform 30 Hz grid • Nyquist criterion &gt;24 FPS enforced.</p>
          </div>
        </div>
      </div>

      {/* Live Movement Profile Section */}
      <section className="relative z-10 card-flowing rounded-3xl p-6 bg-white/95" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#292820]">Live Movement Profile</h3>
            <p className="mt-0.5 text-[11px] text-[#817D70]">Measured from tracked hand landmarks during this recording. Non-diagnostic kinematics.</p>
          </div>
          <span className={`rounded-full border px-3.5 py-1 text-[10px] font-bold ${!liveTelemetry ? 'border-[#EAE6D9] bg-[#FAF9F4] text-[#817D70]' : liveTelemetry.quality === 'Good' ? 'border-[#B7D7C0] bg-[#EFF7F0] text-[#39734A]' : 'border-[#E9BD4B] bg-[#FFF8DF] text-[#8B6810]'}`}>
            {isRecording ? `RECORDING · ${liveTelemetry?.quality || 'Collecting telemetry'}` : liveTelemetry ? `LAST SAMPLE · ${liveTelemetry.quality}` : 'AWAITING RECORDING'}
          </span>
        </div>

        {mode === 'tremor' ? (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <LiveMetric label="Movement amplitude (RMS)" value={liveTelemetry ? `${liveTelemetry.rms_amplitude} a.u.` : '—'} />
            <LiveMetric label="4–6 Hz band power" value={liveTelemetry ? `${(liveTelemetry.power_ratio_4_6hz * 100).toFixed(1)}%` : '—'} />
            <LiveMetric label="Dominant frequency" value={liveTelemetry?.duration_seconds >= 3 && liveTelemetry?.effective_fps >= 24 ? `${liveTelemetry.dominant_frequency_hz} Hz` : 'Need 3s & ≥24 FPS'} />
            <LiveMetric label="Effective sampling" value={liveTelemetry ? `${liveTelemetry.effective_fps} FPS` : '—'} />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <LiveMetric label="Detected tap cycles" value={liveTelemetry?.total_taps ?? '—'} />
            <LiveMetric label="Tapping rate" value={liveTelemetry ? `${liveTelemetry.taps_per_second} taps/s` : '—'} />
            <LiveMetric label="Mean normalized amplitude" value={liveTelemetry ? `${liveTelemetry.average_amplitude}` : '—'} />
            <LiveMetric label="Effective sampling" value={liveTelemetry ? `${liveTelemetry.effective_fps} FPS` : '—'} />
          </div>
        )}

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#FAF9F4] border border-[#EAE6D9]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] transition-[width] duration-300"
            style={{ width: `${mode === 'tremor' ? Math.min(100, Math.max(0, (liveTelemetry?.power_ratio_4_6hz || 0) * 100)) : Math.min(100, Math.max(0, (liveTelemetry?.average_amplitude || 0) * 100))}%` }}
          />
        </div>
      </section>
    </div>
  );
}

function LiveMetric({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#EAE6D9] bg-[#FAF9F4] p-3.5 space-y-1">
      <div className="text-[10px] font-semibold text-[#817D70]">{label}</div>
      <div className="truncate font-mono text-lg font-extrabold text-[#292820]">{value}</div>
    </div>
  );
}