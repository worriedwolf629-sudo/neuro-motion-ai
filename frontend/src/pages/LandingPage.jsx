import React from 'react';
import {
  Activity,
  Radio,
  Mic,
  ArrowRight,
  ShieldCheck,
  Video,
  LineChart,
  FileText,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';

export default function LandingPage({ setActivePage }) {
  return (
    <div className="min-h-full bg-[#FAF9F4] text-[#292820] flex flex-col relative overflow-hidden">
      {/* Top Banner Navigation */}
      <nav className="h-16 px-8 border-b border-[#EAE6D9] bg-[#FAF9F4]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F4D66D] border border-[#E9BD4B] flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-[#292820]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight font-heading">
            Neuro<span className="text-[#D99A38]">Motion AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActivePage('about')}
            className="text-xs font-semibold text-[#817D70] hover:text-[#292820] transition"
          >
            Methodology
          </button>
          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] rounded-xl border border-[#E9BD4B] transition shadow-sm active:scale-95"
          >
            Open Workspace <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section with Signature Flowing Ribbon Effect */}
      <section className="relative px-8 py-24 sm:py-32 max-w-6xl mx-auto text-center space-y-7 w-full overflow-hidden">
        {/* Signature Flowing Ribbon Layer */}
        <FlowingRibbon variant="hero" className="opacity-85 -top-12" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/90 backdrop-blur-sm border border-[#EAE6D9] text-xs font-mono font-semibold text-[#817D70] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#789879] animate-pulse" />
            Movement and Voice Signal Assessment Prototype
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#292820] font-heading leading-tight drop-shadow-sm">
            Understand Movement <br />
            <span className="text-[#D99A38]">Beyond What the Eye Can See.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#817D70] max-w-2xl mx-auto font-body leading-relaxed">
            An explainable, browser-based assessment platform for movement measurements and
            exploratory voice-signal features, processed locally in your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActivePage('assessments')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-sm rounded-xl border border-[#E9BD4B] shadow-sm transition active:scale-95 hover:shadow-md"
            >
              Start Assessment <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFFFFF] hover:bg-[#F5F1E9] text-[#292820] font-semibold text-sm rounded-xl border border-[#EAE6D9] shadow-sm transition active:scale-95"
            >
              Explore Dashboard Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="relative px-8 py-16 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold font-heading text-[#292820]">
            Movement and Voice Signal Measurements
          </h2>
          <p className="text-xs text-[#817D70] mt-1 font-mono uppercase tracking-wider">
            Zero specialized hardware • Browser-local MediaPipe tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Module 1 Card */}
          <div className="card-flowing rounded-2xl p-8 space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#292820] group-hover:border-[#75D5C7] transition">
              <Radio className="w-6 h-6 text-[#E9BD4B]" />
            </div>
            <h3 className="text-lg font-bold text-[#292820] font-heading">
              Resting Tremor Frequency Analysis
            </h3>
            <p className="text-xs text-[#817D70] leading-relaxed">
              Captures index fingertip spatial deviations during a resting observation. Computes
              discrete Fast Fourier Transform (FFT) spectra, dominant harmonic peaks, and power concentration in the 4–6 Hz physiological band.
            </p>
            <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-[#292820] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#789879]" />
              Butterworth filtering (0.5–12 Hz) • Uniform 30 Hz grid
            </div>
          </div>

          {/* Module 2 Card: Voice Signal */}
          <div className="card-flowing rounded-2xl p-8 space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#292820] group-hover:border-[#B8A8E8] transition">
              <Mic className="w-6 h-6 text-[#E9BD4B]" />
            </div>
            <h3 className="text-lg font-bold text-[#292820] font-heading">Voice Signal Assessment</h3>
            <p className="text-xs text-[#817D70] leading-relaxed">
              Records a five-second sustained vowel to estimate pitch stability and RMS amplitude variation. Audio is analyzed locally and discarded; measurements are not a diagnosis or validated disease biomarker.
            </p>
            <button onClick={() => setActivePage('voice')} className="pt-2 flex items-center gap-2 font-mono text-[11px] text-[#292820] font-semibold hover:text-[#D99A38] transition">
              <span className="w-1.5 h-1.5 rounded-full bg-[#789879]" />Open microphone task <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Module 3 Card: Finger-Tapping */}
          <div className="card-flowing rounded-2xl p-8 space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#292820] group-hover:border-[#A0DDEB] transition">
              <Activity className="w-6 h-6 text-[#E9BD4B]" />
            </div>
            <h3 className="text-lg font-bold text-[#292820] font-heading">
              Finger-Tapping Kinematics
            </h3>
            <p className="text-xs text-[#817D70] leading-relaxed">
              Measures repetitive thumb-index opening and closing cycles (MDS-UPDRS task).
              Calculates cadence (taps/second), rhythm variability (interval CV%), and progressive amplitude decrement (fatigue slope).
            </p>
            <div className="pt-2 flex items-center gap-2 font-mono text-[11px] text-[#292820] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#789879]" />
              Anatomical scale normalization • Distance-invariant
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative px-8 py-20 bg-[#F5F1E9]/80 border-y border-[#EAE6D9] w-full overflow-hidden">
        <FlowingRibbon variant="banner" className="opacity-30" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2 className="text-xl font-bold font-heading text-center text-[#292820] mb-10">
            How The Pipeline Operates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-flowing p-6 rounded-2xl">
              <span className="w-7 h-7 rounded-lg bg-[#FAF9F4] border border-[#EAE6D9] text-xs font-mono font-bold flex items-center justify-center text-[#292820] mb-3">
                1
              </span>
              <h4 className="text-sm font-bold text-[#292820] mb-1">Webcam Hand Tracking</h4>
              <p className="text-xs text-[#817D70] leading-relaxed">
                MediaPipe Tasks-Vision extracts 21 3D landmarks in real time entirely inside your browser. No video is ever recorded or uploaded.
              </p>
            </div>

            <div className="card-flowing p-6 rounded-2xl">
              <span className="w-7 h-7 rounded-lg bg-[#FAF9F4] border border-[#EAE6D9] text-xs font-mono font-bold flex items-center justify-center text-[#292820] mb-3">
                2
              </span>
              <h4 className="text-sm font-bold text-[#292820] mb-1">Signal Processing</h4>
              <p className="text-xs text-[#817D70] leading-relaxed">
                Timestamps are linearly resampled to eliminate frame jitter. Detrending, Hanning windowing, and FFT produce pure frequency distributions.
              </p>
            </div>

            <div className="card-flowing p-6 rounded-2xl">
              <span className="w-7 h-7 rounded-lg bg-[#FAF9F4] border border-[#EAE6D9] text-xs font-mono font-bold flex items-center justify-center text-[#292820] mb-3">
                3
              </span>
              <h4 className="text-sm font-bold text-[#292820] mb-1">Explainable Telemetry</h4>
              <p className="text-xs text-[#817D70] leading-relaxed">
                Analytical waveforms, power spectra, and session summaries are generated instantly for clinical inspection and export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Disclaimer Footer */}
      <footer className="mt-auto px-8 py-8 max-w-5xl mx-auto w-full text-center text-xs text-[#817D70] space-y-2">
        <p className="font-semibold text-[#292820]">
          NeuroMotion AI — Experimental Motor Assessment Platform
        </p>
        <p className="text-[11px] max-w-2xl mx-auto leading-relaxed">
          This system is an observational prototype developed for hackathon demonstration and motor movement benchmarking.
          It does not diagnose Parkinson's disease or any medical condition and contains zero machine-learning classification models.
        </p>
      </footer>
    </div>
  );
}
