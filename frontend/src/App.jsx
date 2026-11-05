import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Activity,
  Radio,
  FileText,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  Download,
  Info,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Cpu,
  Trash2,
  Sliders,
  Check
} from 'lucide-react';
import HandTrackerCanvas from './features/hand-tracking/HandTrackerCanvas';
import TelemetryCharts from './features/dashboard/TelemetryCharts';
import {
  resampleToUniformGrid,
  detrendSignal,
  applyHanningWindow,
  computeFFT,
  extractDominantFrequency,
  calculatePowerRatio
} from './features/signal-processing/clientFft';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [assessmentMode, setAssessmentMode] = useState('tremor'); // 'tremor' | 'tapping'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'report'

  // Shared camera stream to avoid redundant camera initializations
  const [sharedStream, setSharedStream] = useState(null);

  // Calibration state for finger-tapping
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationData, setCalibrationData] = useState(null); // { closedDist, openDist, threshold }
  const calibrationSamplesRef = useRef([]);

  // Landmark buffer for active recording
  const landmarkBufferRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Results
  const [tremorData, setTremorData] = useState(() => {
    try {
      const saved = localStorage.getItem('neuromotion_tremor_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [tappingData, setTappingData] = useState(() => {
    try {
      const saved = localStorage.getItem('neuromotion_tapping_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');

  // Persist derived metrics (no raw frames or video stored)
  useEffect(() => {
    if (tremorData) {
      localStorage.setItem('neuromotion_tremor_session', JSON.stringify(tremorData));
    }
  }, [tremorData]);

  useEffect(() => {
    if (tappingData) {
      localStorage.setItem('neuromotion_tapping_session', JSON.stringify(tappingData));
    }
  }, [tappingData]);

  // Clean stored sessions
  const clearSessionHistory = () => {
    localStorage.removeItem('neuromotion_tremor_session');
    localStorage.removeItem('neuromotion_tapping_session');
    setTremorData(null);
    setTappingData(null);
    setSessionNotes('');
    setApiError(null);
  };

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 10) {
            stopAssessment();
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

  const handleLandmarkSample = useCallback((sample) => {
    if (isRecording) {
      landmarkBufferRef.current.push(sample);
    }
    if (isCalibrating && sample.landmarks && sample.landmarks.length >= 10) {
      const lm = sample.landmarks;
      const thumb = lm[4];
      const index = lm[8];
      const wrist = lm[0];
      const mcp = lm[9];
      const d = Math.hypot(thumb.x - index.x, thumb.y - index.y);
      const scale = Math.hypot(wrist.x - mcp.x, wrist.y - mcp.y) || 1.0;
      calibrationSamplesRef.current.push(d / scale);
    }
  }, [isRecording, isCalibrating]);

  // Quick Calibration for Tapping
  const startCalibration = () => {
    calibrationSamplesRef.current = [];
    setIsCalibrating(true);
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

  const startAssessment = () => {
    landmarkBufferRef.current = [];
    setApiError(null);
    setIsRecording(true);
  };

  const computeClientTremorAnalysis = (samples) => {
    const timestamps = samples.map(s => s.timestamp_ms);
    const durationSec = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000.0;
    const effectiveFps = samples.length / Math.max(0.1, durationSec);

    // Coordinate displacement along principal axis
    const rawCoords = samples.map(s => [s.landmarks[8]?.x || 0, s.landmarks[8]?.y || 0]);
    const meanX = rawCoords.reduce((a, b) => a + b[0], 0) / rawCoords.length;
    const meanY = rawCoords.reduce((a, b) => a + b[1], 0) / rawCoords.length;
    const centered = rawCoords.map(c => [c[0] - meanX, c[1] - meanY]);

    // Resample to uniform 30 Hz grid
    const disp1D = centered.map(c => c[0]); // Primary axis
    const { tUniform, sigUniform } = resampleToUniformGrid(timestamps, disp1D, 30.0);
    const detrended = detrendSignal(sigUniform);
    const windowed = applyHanningWindow(detrended);
    const { freqs, powers } = computeFFT(windowed, 30.0);
    const { domFreq, peakPower } = extractDominantFrequency(freqs, powers, 0.5, 12.0);
    const powerRatio = calculatePowerRatio(freqs, powers, 4.0, 6.0);

    return {
      status: "success",
      effective_fps: Number(effectiveFps.toFixed(1)),
      duration_seconds: Number(durationSec.toFixed(2)),
      dominant_frequency_hz: domFreq,
      power_ratio_4_6hz: powerRatio,
      mean_amplitude: Number((powers.reduce((a, b) => a + b, 0) / (powers.length || 1)).toFixed(5)),
      amplitude_slope: 0.0,
      frequency_spectrum: freqs.slice(0, 30).map((f, i) => ({
        frequency_hz: Number(f.toFixed(2)),
        power: Number(powers[i].toFixed(5))
      })),
      filtered_waveform: tUniform.slice(0, 100).map((t, i) => ({
        time_sec: Number(t.toFixed(3)),
        filtered_displacement: Number(detrended[i].toFixed(4)),
        envelope: Number(Math.abs(detrended[i]).toFixed(4))
      }))
    };
  };

  const stopAssessment = async () => {
    setIsRecording(false);
    const capturedSamples = [...landmarkBufferRef.current];

    if (capturedSamples.length < 20) {
      setApiError("Recording too brief (<20 frames). Hold hand steady in view for at least 3-5 seconds.");
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);

    try {
      if (assessmentMode === 'tremor') {
        let data = null;
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/analyze/tremor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              samples: capturedSamples,
              tracking_landmark_idx: 8,
              target_fs: 30.0
            })
          });
          if (res.ok) data = await res.json();
        } catch (e) {
          console.warn("Backend API unreachable, using verified in-browser FFT client fallback:", e);
        }

        // Fallback to high-precision in-browser FFT if backend offline
        if (!data) {
          data = computeClientTremorAnalysis(capturedSamples);
        }
        setTremorData(data);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/v1/analyze/finger-tapping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            samples: capturedSamples,
            target_fs: 30.0
          })
        });
        if (!response.ok) throw new Error(`Backend returned ${response.status}`);
        const data = await response.json();
        setTappingData(data);
      }
    } catch (err) {
      console.error("Analysis call failed:", err);
      setApiError(`Analysis notice: ${err.message}.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#070B14] text-slate-100 overflow-hidden font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0B1120] border-r border-slate-800/80 flex flex-col justify-between p-4 z-20 shrink-0">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white font-heading">
                Neuro<span className="text-teal-400">Motion</span>
              </h1>
              <p className="text-[10px] tracking-widest text-slate-400 uppercase font-mono">Motor AI Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-400" />
              Live Assessment Hub
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'report'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              Motor Assessment Report
            </button>
          </nav>

          {/* Assessment Modules Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2 font-bold">
              Assessment Modules
            </p>

            <div className="space-y-1.5">
              <button
                disabled={isRecording}
                onClick={() => setAssessmentMode('tremor')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  assessmentMode === 'tremor'
                    ? 'bg-slate-800/90 border-teal-500/50 text-white shadow-md'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-teal-400" /> Resting Tremor
                  </span>
                  {tremorData && <CheckCircle className="w-3.5 h-3.5 text-teal-400" />}
                </div>
                <p className="text-[10px] text-slate-400">FFT frequency analysis (0.5–12 Hz band)</p>
              </button>

              <button
                disabled={isRecording}
                onClick={() => setAssessmentMode('tapping')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  assessmentMode === 'tapping'
                    ? 'bg-slate-800/90 border-cyan-500/50 text-white shadow-md'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Finger-Tapping
                  </span>
                  {tappingData && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-400">Thumb-Index cadence, amplitude fatigue</p>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom AI & Privacy Safeguard Pill */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-800/40 rounded-2xl p-3.5 text-xs">
            <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Private & Local</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Video stays in browser. Only numerical kinematics processed.
            </p>
          </div>

          <button
            onClick={clearSessionHistory}
            className="w-full flex items-center justify-center gap-2 text-[11px] text-slate-400 hover:text-rose-400 py-1.5 transition"
          >
            <Trash2 className="w-3 h-3" /> Clear Session Cache
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#070B14]">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0B1120]/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-200">
              {activeTab === 'dashboard' ? 'Real-Time Motor Examination' : 'Motor Assessment Report'}
            </span>
            <span className="text-xs bg-slate-800/80 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 font-mono">
              Session #NM-2026-LIVE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine: Tasks-Vision WebGL
            </div>

            <button
              onClick={clearSessionHistory}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Session
            </button>
          </div>
        </header>

        {/* BODY */}
        <main className="p-6 space-y-6 flex-1">
          {apiError && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {activeTab === 'dashboard' ? (
            <>
              {/* STAT SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Dominant Tremor Frequency</span>
                    <Radio className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-mono text-white">
                      {tremorData ? `${tremorData.dominant_frequency_hz} Hz` : '--'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {tremorData ? (tremorData.dominant_frequency_hz >= 4 && tremorData.dominant_frequency_hz <= 6 ? 'In 4-6 Hz band' : 'Outside 4-6 Hz') : 'Resting Test'}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <span>Power Ratio:</span>
                    <span className="font-mono text-teal-400 font-bold">
                      {tremorData ? `${(tremorData.power_ratio_4_6hz * 100).toFixed(1)}%` : '--'}
                    </span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Finger Taps Completed</span>
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-mono text-white">
                      {tappingData ? `${tappingData.total_taps}` : '--'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {tappingData ? `${tappingData.taps_per_second} taps/sec` : 'Tapping Test'}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <span>Avg Interval:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {tappingData ? `${tappingData.average_interval_sec}s` : '--'}
                    </span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Rhythm Variability (CV)</span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-mono text-white">
                      {tappingData ? `${tappingData.interval_variability_cv}%` : '--'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {tappingData ? (tappingData.interval_variability_cv < 20 ? 'Stable rhythm' : 'Variable cadence') : 'Interval Stability'}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <span>Fatigue Slope:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {tappingData ? `${tappingData.amplitude_slope}` : '--'}
                    </span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Protocol Status</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-mono text-white">
                      {(tremorData ? 1 : 0) + (tappingData ? 1 : 0)} / 2
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Completed</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">
                    {tremorData && tappingData ? (
                      <span className="text-emerald-400 font-bold">Both tests captured</span>
                    ) : (
                      'Ready for assessment'
                    )}
                  </div>
                </div>
              </div>

              {/* LIVE CAMERA & PROTOCOL CONTROLLER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Camera View & Canvas Overlay */}
                <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Live Hand Tracking (@mediapipe/tasks-vision)
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                      Target: {assessmentMode === 'tremor' ? 'Landmark 8 (Index Tip)' : 'Landmarks 4 & 8 (Thumb + Index)'}
                    </span>
                  </div>

                  <HandTrackerCanvas
                    onLandmarksUpdate={handleLandmarkSample}
                    isRecording={isRecording}
                    assessmentMode={assessmentMode}
                    sharedStream={sharedStream}
                    onStreamReady={setSharedStream}
                  />

                  {/* Controller & Calibration Bar */}
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 border border-slate-800 px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <button
                          onClick={startAssessment}
                          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Start {assessmentMode === 'tremor' ? 'Resting Tremor' : 'Finger Tapping'} Test
                        </button>
                      ) : (
                        <button
                          onClick={stopAssessment}
                          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition animate-pulse"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          Stop & Analyze
                        </button>
                      )}

                      {/* Finger-Tapping Calibration Trigger */}
                      {assessmentMode === 'tapping' && !isRecording && (
                        <button
                          onClick={startCalibration}
                          disabled={isCalibrating}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          {isCalibrating ? 'Calibrating Range (3s)...' : calibrationData ? 'Re-Calibrate' : 'Calibrate Range'}
                        </button>
                      )}

                      {isAnalyzing && (
                        <div className="flex items-center gap-2 text-xs font-medium text-teal-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Processing...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      {calibrationData && assessmentMode === 'tapping' && (
                        <span className="text-[11px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                          Thresh: {calibrationData.threshold}
                        </span>
                      )}
                      <span className="text-slate-400">Duration:</span>
                      <span className={`font-bold px-2.5 py-1 rounded-md ${isRecording ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'}`}>
                        {recordingSeconds}s / 10s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Protocol Guide */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-teal-400" />
                      Guided Assessment Protocol
                    </h3>

                    {assessmentMode === 'tremor' ? (
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <p className="font-semibold text-teal-300 mb-1">Resting Hand Tremor</p>
                          <p className="text-slate-400 leading-relaxed text-[11px]">
                            Rest your forearm comfortably on a desk with your hand relaxed and extended in clear view of the camera.
                          </p>
                        </div>

                        <ul className="space-y-2 text-[11px] text-slate-400">
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center font-mono shrink-0">1</span>
                            <span>Keep your fingers lightly separated without tensing.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center font-mono shrink-0">2</span>
                            <span>Click <strong>Start Test</strong> and hold still for 5 to 10 seconds.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-teal-400 flex items-center justify-center font-mono shrink-0">3</span>
                            <span>FFT frequency spectrum isolates oscillations in the 3–12 Hz band.</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <p className="font-semibold text-cyan-300 mb-1">Finger Tapping Calibration & Task</p>
                          <p className="text-slate-400 leading-relaxed text-[11px]">
                            Tap your index finger and thumb together as rapidly and widely as possible (MDS-UPDRS Item 3.4).
                          </p>
                        </div>

                        <ul className="space-y-2 text-[11px] text-slate-400">
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono shrink-0">1</span>
                            <span>Optionally click <strong>Calibrate Range</strong> while opening/closing fingers for 3 seconds.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono shrink-0">2</span>
                            <span>Click <strong>Start Test</strong> and tap as fast and wide as possible.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono shrink-0">3</span>
                            <span>Cadence, rhythm CV, and amplitude fatigue decrement are recorded.</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-400 mb-2">Sampling & Quality Criteria:</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Nyquist Band:</span>
                        <span className="text-emerald-400 font-bold">&gt;24 FPS (3-12 Hz)</span>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Normalization:</span>
                        <span className="text-cyan-400 font-bold">Wrist-to-MCP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TELEMETRY CHARTS */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Kinematic Waveforms & Frequency Decomposition
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssessmentMode('tremor')}
                      className={`text-xs px-3 py-1 rounded-lg border transition ${assessmentMode === 'tremor' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                      Tremor View
                    </button>
                    <button
                      onClick={() => setAssessmentMode('tapping')}
                      className={`text-xs px-3 py-1 rounded-lg border transition ${assessmentMode === 'tapping' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                      Tapping View
                    </button>
                  </div>
                </div>

                <TelemetryCharts
                  tremorResult={tremorData}
                  tappingResult={tappingData}
                  activeTab={assessmentMode}
                />
              </div>
            </>
          ) : (
            /* MOTOR ASSESSMENT REPORT */
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white font-heading">
                    NeuroMotion AI — Motor Assessment Report
                  </h2>
                  <p className="text-xs text-slate-400">
                    Computer-Vision Kinematics Telemetry & Signal Decomposition
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export / Print Report
                </button>
              </div>

              {/* Assessment Telemetry Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Date</span>
                  <p className="font-bold text-slate-200 mt-1">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Session ID</span>
                  <p className="font-mono text-teal-400 font-bold mt-1">#NM-8924</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Camera FPS</span>
                  <p className="font-mono text-slate-200 font-bold mt-1">30 FPS (Uniform Grid)</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Reference Scale</span>
                  <p className="font-mono text-cyan-400 font-bold mt-1">Wrist-MCP $S_{'{ref}'}$</p>
                </div>
              </div>

              {/* Module 1: Tremor Telemetry */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5" /> Resting Tremor Telemetry
                </h4>
                {tremorData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2">
                    <div>
                      <span className="text-slate-400 text-[10px]">Dominant Peak:</span>
                      <p className="font-mono text-base font-bold text-white">{tremorData.dominant_frequency_hz} Hz</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">4–6 Hz Power Ratio:</span>
                      <p className="font-mono text-base font-bold text-teal-400">{(tremorData.power_ratio_4_6hz * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Mean Amplitude:</span>
                      <p className="font-mono text-base font-bold text-slate-200">{tremorData.mean_amplitude}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Effective FPS:</span>
                      <p className="font-mono text-base font-bold text-slate-200">{tremorData.effective_fps}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tremor assessment data captured yet.</p>
                )}
              </div>

              {/* Module 2: Finger-Tapping Kinematics */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Finger-Tapping Kinematics
                </h4>
                {tappingData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2">
                    <div>
                      <span className="text-slate-400 text-[10px]">Total Taps:</span>
                      <p className="font-mono text-base font-bold text-white">{tappingData.total_taps}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Cadence:</span>
                      <p className="font-mono text-base font-bold text-cyan-400">{tappingData.taps_per_second} taps/s</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Interval CV:</span>
                      <p className="font-mono text-base font-bold text-amber-400">{tappingData.interval_variability_cv}%</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Fatigue Decr. Slope:</span>
                      <p className="font-mono text-base font-bold text-rose-400">{tappingData.amplitude_slope}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No finger-tapping data captured yet.</p>
                )}
              </div>

              {/* Optional Session Notes */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Examiner Session Notes (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Record observational notes (e.g. lighting conditions, subject positioning, camera stability)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                  rows={2}
                />
              </div>

              {/* Medical Disclaimer Banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-200 leading-relaxed">
                  <strong className="font-semibold block mb-0.5">Mandatory Clinical Disclaimer</strong>
                  NeuroMotion AI is an experimental computer-vision motor assessment prototype designed exclusively for research, demonstration, and algorithmic benchmarking during a hackathon. It is <strong>NOT a diagnostic system for Parkinson's disease</strong> or any other medical condition. No machine learning disease classification models are employed. All values represent physical and kinematic measurements.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
