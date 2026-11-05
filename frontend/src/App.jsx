import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Radio,
  FileText,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HeartPulse,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Info,
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import HandTrackerCanvas from './features/hand-tracking/HandTrackerCanvas';
import TelemetryCharts from './features/dashboard/TelemetryCharts';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [assessmentMode, setAssessmentMode] = useState('tremor'); // 'tremor' | 'tapping'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'report'

  // Landmark buffer
  const landmarkBufferRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Results
  const [tremorData, setTremorData] = useState(null);
  const [tappingData, setTappingData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          // Auto-stop after 10 seconds for standardized test window
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

  const handleLandmarkSample = (sample) => {
    if (isRecording) {
      landmarkBufferRef.current.push(sample);
    }
  };

  const startAssessment = () => {
    landmarkBufferRef.current = [];
    setApiError(null);
    setIsRecording(true);
  };

  const stopAssessment = async () => {
    setIsRecording(false);
    const capturedSamples = [...landmarkBufferRef.current];

    if (capturedSamples.length < 15) {
      setApiError("Recording was too short. Please record for at least 3-5 seconds.");
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);

    try {
      if (assessmentMode === 'tremor') {
        const response = await fetch(`${API_BASE_URL}/api/v1/analyze/tremor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            samples: capturedSamples,
            tracking_landmark_idx: 8,
            target_fs: 30.0
          })
        });
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
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
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        setTappingData(data);
      }
    } catch (err) {
      console.error("Analysis call failed:", err);
      setApiError(`Analysis failed: ${err.message}. Ensure backend is running on :8000`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setIsRecording(false);
    landmarkBufferRef.current = [];
    setTremorData(null);
    setTappingData(null);
    setApiError(null);
    setRecordingSeconds(0);
  };

  return (
    <div className="flex h-screen w-screen bg-[#070B14] text-slate-100 overflow-hidden font-sans">
      {/* LEFT SIDEBAR (Inspired by Reference Image 1 & 2) */}
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
              Clinical Summary Report
            </button>
          </nav>

          {/* Mode Switcher Group */}
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

        {/* Bottom AI Status Badge */}
        <div className="bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-800/40 rounded-2xl p-3.5 text-xs">
          <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable Kinematics</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Deterministic physical measurements. Zero opaque ML disease classification.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#070B14]">
        {/* TOP HEADER BAR */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0B1120]/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-200">
              {activeTab === 'dashboard' ? 'Real-Time Motor Examination' : 'Exportable Assessment Report'}
            </span>
            <span className="text-xs bg-slate-800/80 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 font-mono">
              Session #NM-2026-LIVE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API: 127.0.0.1:8000
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Session
            </button>
          </div>
        </header>

        {/* BODY DASHBOARD */}
        <main className="p-6 space-y-6 flex-1">
          {apiError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {activeTab === 'dashboard' ? (
            <>
              {/* TOP ROW: 4 STAT SUMMARY CARDS (Inspired by Reference 1 & 2 Cards) */}
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
                      'Execute active module'
                    )}
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: LIVE CAMERA & PROTOCOL CONTROLLER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Camera Feed + Canvas Overlay */}
                <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Live MediaPipe Hand Tracking (21 Landmarks)
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                      Target: {assessmentMode === 'tremor' ? 'Landmark 8 (Index Tip)' : 'Landmark 4 & 8 (Thumb + Index)'}
                    </span>
                  </div>

                  <HandTrackerCanvas
                    onLandmarksUpdate={handleLandmarkSample}
                    isRecording={isRecording}
                    assessmentMode={assessmentMode}
                  />

                  {/* Controller Bar */}
                  <div className="mt-4 flex items-center justify-between bg-slate-950/70 border border-slate-800 px-4 py-3 rounded-xl">
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

                      {isAnalyzing && (
                        <div className="flex items-center gap-2 text-xs font-medium text-teal-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Computing signal harmonics...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">Duration:</span>
                      <span className={`font-bold px-2.5 py-1 rounded-md ${isRecording ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'}`}>
                        {recordingSeconds}s / 10s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Instructions & Real-time Guide */}
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
                            Rest your forearm comfortably on a desk or armrest with your hand relaxed and extended in clear view of the camera.
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
                            <span>The engine isolates coordinate displacement and computes FFT power spectra.</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <p className="font-semibold text-cyan-300 mb-1">Rapid Finger Tapping</p>
                          <p className="text-slate-400 leading-relaxed text-[11px]">
                            Tap your index finger and thumb together as rapidly and widely as possible, mimicking the MDS-UPDRS finger-tapping task.
                          </p>
                        </div>

                        <ul className="space-y-2 text-[11px] text-slate-400">
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono shrink-0">1</span>
                            <span>Face your hand toward the camera with the palm upright.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono shrink-0">2</span>
                            <span>Open wide on every tap to measure maximal amplitude.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono shrink-0">3</span>
                            <span>Cycle speed, amplitude decrement (fatigue), and cadence regularity are logged.</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Quality Checklist */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-400 mb-2">Quality Guardrails:</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Target Rate:</span>
                        <span className="text-emerald-400 font-bold">&gt;20 FPS</span>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Normalization:</span>
                        <span className="text-cyan-400 font-bold">Wrist-MCP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: TELEMETRY & KINEMATIC CHARTS */}
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
            /* CLINICAL REPORT VIEW (Inspired by Reference Image 3) */
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white font-heading">
                    NeuroMotion AI — Motor Assessment Summary
                  </h2>
                  <p className="text-xs text-slate-400">
                    Standardized Computer-Vision Kinematics Telemetry Report
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF / Print
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
                  <p className="font-mono text-slate-200 font-bold mt-1">30 FPS (WebGL)</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Reference Scale</span>
                  <p className="font-mono text-cyan-400 font-bold mt-1">Wrist-MCP $S_{'{ref}'}$</p>
                </div>
              </div>

              {/* Module 1 Summary: Tremor */}
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
                      <span className="text-slate-400 text-[10px]">Amplitude Slope:</span>
                      <p className="font-mono text-base font-bold text-slate-200">{tremorData.amplitude_slope}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tremor assessment data captured yet.</p>
                )}
              </div>

              {/* Module 2 Summary: Tapping */}
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
