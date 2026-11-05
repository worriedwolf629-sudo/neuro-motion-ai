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
  Activity
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

  return (
    <div className="relative p-8 space-y-6 max-w-6xl mx-auto overflow-hidden">
      {/* Subtle non-intrusive background accent */}
      <FlowingRibbon variant="subtle" className="opacity-20" />
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E9BD4B]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#817D70]">
              Active Protocol: {mode === 'tremor' ? 'Resting-Hand Tremor' : 'Rapid Finger-Tapping'}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-[#292820]">
            Live Movement Examination
          </h2>
        </div>

        <button
          onClick={() => setActivePage('assessments')}
          className="text-xs font-semibold text-[#817D70] hover:text-[#292820] px-3 py-1.5 rounded-xl border border-[#EAE6D9] bg-[#FFFFFF] transition"
        >
          Change Protocol
        </button>
      </div>

      {notice && (
        <div className="bg-[#FAF9F4] border border-[#D99A38] rounded-xl p-4 flex items-center gap-3 text-xs text-[#292820]">
          <AlertTriangle className="w-4 h-4 text-[#D99A38] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {mode === 'tremor' && (
        <div className="flex items-center gap-2 text-xs text-[#817D70]" aria-live="polite">
          <span className="font-mono font-bold text-[#292820]">{tremorPhase === 'rest' ? 'PHASE 1 OF 2' : 'PHASE 2 OF 2'}</span>
          <span>{tremorPhase === 'rest' ? 'Resting hand' : 'Cognitive load'}</span>
        </div>
      )}

      <section className="rounded-2xl border border-[#EAE6D9] bg-[#FFFFFF] p-5 shadow-sm" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#292820]">Live movement profile</h3>
            <p className="mt-1 text-[11px] text-[#817D70]">Measured from tracked hand landmarks during this recording. Not a disease probability.</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${!liveTelemetry ? 'border-[#EAE6D9] bg-[#FAF9F4] text-[#817D70]' : liveTelemetry.quality === 'Good' ? 'border-[#B7D7C0] bg-[#EFF7F0] text-[#39734A]' : liveTelemetry.quality === 'Acceptable' ? 'border-[#E9BD4B] bg-[#FFF8DF] text-[#8B6810]' : 'border-[#E9BD4B] bg-[#FAF9F4] text-[#817D70]'}`}>
            {isRecording ? `RECORDING · ${liveTelemetry?.quality || 'Collecting data'}` : liveTelemetry ? `LAST SAMPLE · ${liveTelemetry.quality}` : 'AWAITING RECORDING'}
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
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F5F1E6]" role="img" aria-label={liveTelemetry ? mode === 'tremor' ? `Measured 4 to 6 hertz band power ${Math.round(liveTelemetry.power_ratio_4_6hz * 100)} percent` : `Measured normalized tapping amplitude ${liveTelemetry.average_amplitude}` : 'No signal measurement yet'}>
          <div className="h-full rounded-full bg-[#E9BD4B] transition-[width] duration-300" style={{ width: `${mode === 'tremor' ? Math.min(100, Math.max(0, (liveTelemetry?.power_ratio_4_6hz || 0) * 100)) : Math.min(100, Math.max(0, (liveTelemetry?.average_amplitude || 0) * 100))}%` }} />
        </div>
        <p className="mt-2 text-[10px] text-[#817D70]">{mode === 'tremor' ? 'Bar shows measured share of signal power in the 4–6 Hz band; it is not a risk score.' : 'Bar visualizes the measured normalized tapping amplitude.'} {liveTelemetry?.duration_seconds < 3 && mode === 'tremor' ? 'Frequency estimate is withheld until at least 3 seconds are available.' : ''}</p>
      </section>

      {/* Main Grid: Camera & Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Viewport */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-5 shadow-sm space-y-4">
          <HandTrackerCanvas
            onLandmarksUpdate={handleLandmarkSample}
            isRecording={isRecording}
            assessmentMode={mode}
            sharedStream={sharedStream}
            onStreamReady={onStreamReady}
          />

          {/* Test Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF9F4] border border-[#EAE6D9] px-4 py-3 rounded-xl">
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startTest}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {mode === 'tremor' && restingTremor ? 'Start 10s Cognitive Load Phase' : 'Start 10s Assessment'}
                </button>
              ) : (
                <button
                  onClick={stopTest}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#C66D5B] hover:bg-[#B55C4A] text-[#FFFFFF] font-bold text-xs rounded-xl shadow-sm transition animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop & Compute
                </button>
              )}

              {mode === 'tapping' && !isRecording && (
                <button
                  onClick={startCalibration}
                  disabled={isCalibrating}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F1E6] text-[#292820] border border-[#EAE6D9] transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#E9BD4B]" />
                  {isCalibrating ? 'Calibrating (3s)...' : calibrationData ? 'Re-Calibrate' : 'Calibrate Range'}
                </button>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#817D70]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E9BD4B]" />
                  Computing kinematics...
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              {calibrationData && mode === 'tapping' && (
                <span className="text-[11px] text-[#292820] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#EAE6D9]">
                  Thresh: {calibrationData.threshold}
                </span>
              )}
              <span className="text-[#817D70]">Duration:</span>
              <span className={`font-bold px-2.5 py-1 rounded-md ${isRecording ? 'bg-[#F4D66D] text-[#292820] border border-[#E9BD4B]' : 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9]'}`}>
                {recordingSeconds}s / 10s
              </span>
            </div>
          </div>
        </div>

        {/* Right: Instructions & Positioning Protocol */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-[#817D70] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#E9BD4B]" />
              Standardized Procedure
            </h3>

            {mode === 'tremor' ? (
              <div className="space-y-3 text-xs text-[#817D70]">
                <div className="p-3.5 bg-[#FAF9F4] rounded-xl border border-[#EAE6D9]">
                  <p className="font-bold text-[#292820] mb-1">Resting Hand Observation</p>
                  <p className="leading-relaxed">
                    Rest your forearm fully supported on a desk with your hand relaxed and fingers gently separated.
                  </p>
                </div>

                <ul className="space-y-2.5 pt-2">
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#F5F1E6] text-[#292820] font-mono font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Ensure lighting is even and your hand is within the frame.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#F5F1E6] text-[#292820] font-mono font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Click <strong>Start 10s Assessment</strong> and remain relaxed.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#F5F1E6] text-[#292820] font-mono font-bold flex items-center justify-center shrink-0">3</span>
                    <span>After rest, record a second phase while doing a simple mental task. The report compares both measured signals.</span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-[#817D70]">
                <div className="p-3.5 bg-[#FAF9F4] rounded-xl border border-[#EAE6D9]">
                  <p className="font-bold text-[#292820] mb-1">MDS-UPDRS Finger Tapping</p>
                  <p className="leading-relaxed">
                    Tap the tip of your index finger against your thumb as rapidly and with as wide an amplitude as possible.
                  </p>
                </div>

                <ul className="space-y-2.5 pt-2">
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#F5F1E6] text-[#292820] font-mono font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Hold your hand upright with palm facing the webcam.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#F5F1E6] text-[#292820] font-mono font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Open as wide as possible on every tap cycle.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#F5F1E6] text-[#292820] font-mono font-bold flex items-center justify-center shrink-0">3</span>
                    <span>The engine detects opening peaks, cadence, and progressive amplitude decay.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Quality Criteria Notice */}
          <div className="pt-4 border-t border-[#EAE6D9] text-[11px] text-[#817D70] space-y-1">
            <p className="font-bold text-[#292820]">Target Sampling Quality:</p>
            <p>Uniform 30 Hz grid • Nyquist criterion &gt;24 FPS enforced.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveMetric({ label, value }) {
  return <div className="min-w-0 rounded-xl border border-[#EAE6D9] bg-[#FAF9F4] p-3">
    <div className="text-[10px] font-semibold text-[#817D70]">{label}</div>
    <div className="mt-1 truncate font-mono text-lg font-bold text-[#292820]">{value}</div>
  </div>;
}

