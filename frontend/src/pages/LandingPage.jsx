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
  Sparkles,
  Lock,
  Play
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';

export default function LandingPage({ setActivePage }) {
  return (
    <div className="min-h-full bg-[#FAF9F4] text-[#292820] flex flex-col relative overflow-hidden">
      {/* Signature Flowing Ribbon Background */}
      <FlowingRibbon position="hero" opacity={0.88} className="absolute inset-0 pointer-events-none" />

      {/* Top Banner Navigation */}
      <nav className="h-16 px-8 border-b border-[#EAE6D9] bg-[#FAF9F4]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F4D66D] border border-[#E9BD4B] flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5 text-[#292820]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight font-heading">
            Neuro<span className="text-[#D99A38]">Motion AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#817D70]">
          <button onClick={() => setActivePage('landing')} className="text-[#292820] font-bold border-b-2 border-[#E9BD4B] pb-0.5">Home</button>
          <button onClick={() => setActivePage('assessments')} className="hover:text-[#292820] transition">Assessments</button>
          <button onClick={() => setActivePage('about')} className="hover:text-[#292820] transition">About</button>
          <button onClick={() => setActivePage('about')} className="hover:text-[#292820] transition">Resources</button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActivePage('assessments')}
            className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] rounded-full border border-[#E9BD4B] transition shadow-xs active:scale-95"
          >
            Start Assessment <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section matching Reference Image */}
      <section className="relative px-8 py-14 lg:py-20 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#292820] font-heading leading-[1.12]">
              Understand <br />
              <span className="text-[#D99A38]">Movement</span> Beyond <br />
              What the Eye Can See.
            </h1>

            <p className="text-base sm:text-lg text-[#817D70] max-w-xl font-body leading-relaxed">
              An experimental computer-vision platform for visualising tremor characteristics
              and finger movement patterns.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActivePage('assessments')}
                className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-sm rounded-full border border-[#E9BD4B] shadow-sm hover:shadow transition active:scale-95"
              >
                Start Assessment <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('dashboard')}
                className="flex items-center gap-2 px-7 py-3.5 bg-[#FFFFFF] hover:bg-[#F5F1E9] text-[#292820] font-bold text-sm rounded-full border border-[#EAE6D9] shadow-xs transition active:scale-95"
              >
                Explore Platform <Play className="w-3.5 h-3.5 fill-current text-[#E9BD4B]" />
              </button>
            </div>
          </div>

          {/* Right Hero Visual Card matching Reference Screenshot */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Floating Glass Mockup Card */}
            <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden border border-[#EAE6D9]/90 bg-white/75 backdrop-blur-md shadow-xl p-3 flex flex-col justify-between">
              {/* Simulated Hand Tracking Viewport */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#292820] to-[#1C1B18] flex items-center justify-center">
                {/* Hand Silhouette / Landmark overlay representation */}
                <svg viewBox="0 0 400 300" className="w-full h-full object-cover">
                  {/* Subtle Hand Outline Contour */}
                  <path
                    d="M 170 290 C 160 230, 140 180, 130 140 C 125 120, 145 110, 150 130 C 160 170, 165 110, 170 80 C 175 60, 190 60, 192 80 C 196 110, 198 100, 205 70 C 210 50, 225 50, 228 70 C 232 105, 235 125, 245 90 C 250 75, 265 80, 262 100 C 255 140, 250 175, 275 190 C 295 200, 280 230, 270 290 Z"
                    fill="rgba(244, 214, 109, 0.08)"
                    stroke="rgba(233, 189, 75, 0.3)"
                    strokeWidth="1.5"
                  />

                  {/* Golden Skeleton Connections */}
                  <g stroke="#E9BD4B" strokeWidth="2" strokeOpacity="0.85">
                    <line x1="200" y1="230" x2="160" y2="180" />
                    <line x1="160" y1="180" x2="140" y2="135" />
                    <line x1="200" y1="230" x2="180" y2="150" />
                    <line x1="180" y1="150" x2="175" y2="90" />
                    <line x1="200" y1="230" x2="205" y2="145" />
                    <line x1="205" y1="145" x2="210" y2="78" />
                    <line x1="200" y1="230" x2="230" y2="155" />
                    <line x1="230" y1="155" x2="245" y2="95" />
                    <line x1="200" y1="230" x2="255" y2="185" />
                    <line x1="255" y1="185" x2="275" y2="135" />
                    <line x1="160" y1="180" x2="180" y2="150" strokeDasharray="3 3" strokeOpacity="0.6" />
                    <line x1="180" y1="150" x2="205" y2="145" strokeDasharray="3 3" strokeOpacity="0.6" />
                    <line x1="205" y1="145" x2="230" y2="155" strokeDasharray="3 3" strokeOpacity="0.6" />
                  </g>

                  {/* Luminous Golden Landmark Dots */}
                  {[
                    [200, 230], [160, 180], [140, 135], [180, 150], [175, 90],
                    [205, 145], [210, 78], [230, 155], [245, 95], [255, 185], [275, 135]
                  ].map(([cx, cy], i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="8" fill="#F4D66D" fillOpacity="0.35" className="animate-pulse" />
                      <circle cx={cx} cy={cy} r="4" fill="#F4D66D" stroke="#FFFFFF" strokeWidth="1.5" />
                    </g>
                  ))}
                </svg>

                {/* HUD Overlay in Mockup */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#75D5C7] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-wide">Tracking...</span>
                </div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white">
                  FPS: 30
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Badges matching Reference Image */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-6 border-t border-[#EAE6D9]/60">
          <div className="card-flowing rounded-2xl p-4 flex items-center gap-3 bg-white/90">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#E9BD4B] shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#292820]">Real-Time</h4>
              <p className="text-[11px] text-[#817D70]">Hand Tracking</p>
            </div>
          </div>

          <div className="card-flowing rounded-2xl p-4 flex items-center gap-3 bg-white/90">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#75D5C7] shrink-0">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#292820]">Advanced</h4>
              <p className="text-[11px] text-[#817D70]">Signal Analysis</p>
            </div>
          </div>

          <div className="card-flowing rounded-2xl p-4 flex items-center gap-3 bg-white/90">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#B8A8E8] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#292820]">Detailed</h4>
              <p className="text-[11px] text-[#817D70]">Reports</p>
            </div>
          </div>

          <div className="card-flowing rounded-2xl p-4 flex items-center gap-3 bg-white/90">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#789879] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#292820]">Privacy</h4>
              <p className="text-[11px] text-[#817D70]">Focused</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="relative px-8 py-14 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold font-heading text-[#292820]">
            Movement and Voice Signal Measurements
          </h2>
          <p className="text-xs text-[#817D70] mt-1 font-mono uppercase tracking-wider">
            Zero specialized hardware • Browser-local MediaPipe tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Module 1 Card */}
          <div className="card-flowing rounded-2xl p-7 space-y-4 relative overflow-hidden group">
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
          <div className="card-flowing rounded-2xl p-7 space-y-4 relative overflow-hidden group">
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
          <div className="card-flowing rounded-2xl p-7 space-y-4 relative overflow-hidden group">
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
              Zero-crossing kinematic peak detection
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Protocol Banner */}
      <section className="px-8 py-10 max-w-4xl mx-auto w-full z-10">
        <div className="bg-[#FAF9F4] border border-[#EAE6D9] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#EAE6D9] flex items-center justify-center text-[#D99A38] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-[#292820]">
              Observational Prototype Notice
            </h4>
            <p className="text-xs text-[#817D70] leading-relaxed">
              NeuroMotion AI is an experimental motion analysis and voice telemetry system. It is not an FDA-approved medical diagnostic device. All processing runs entirely on your local machine.
            </p>
          </div>
        </div>
      </section>

      {/* Mandatory Disclaimer Footer */}
      <footer className="mt-auto px-8 py-8 max-w-5xl mx-auto w-full text-center text-xs text-[#817D70] z-10">
        <p className="text-xs text-[#817D70]">
          Research screening aid: compares measurements to provisional reference ranges. Not a diagnosis. Consult a neurologist.
        </p>
      </footer>
    </div>
  );
}