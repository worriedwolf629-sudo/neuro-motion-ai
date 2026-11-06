import React from 'react';
import {
  Activity,
  Radio,
  ArrowRight,
  Clock,
  Camera,
  CheckCircle2,
  Sparkles,
  Mic,
  Sliders
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';

export default function AssessmentSelection({ setActivePage }) {
  return (
    <div className="relative p-6 sm:p-8 space-y-8 max-w-6xl mx-auto overflow-hidden">
      {/* Background Flowing Ribbon layer */}
      <FlowingRibbon position="full" opacity={0.75} className="absolute inset-0 pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#292820] tracking-tight">
          Assessment Protocol Selection
        </h2>
        <p className="text-xs text-[#817D70]">
          Standardized movement and acoustic tasks • Real-time computer vision & local signal processing
        </p>
      </div>

      {/* Available Protocols Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Resting Tremor */}
        <div className="card-flowing rounded-3xl p-7 flex flex-col justify-between space-y-6 bg-white/95 group hover:border-[#75D5C7]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#E9BD4B] group-hover:scale-105 transition">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#EFF7F0] text-[#39734A] px-3 py-1 rounded-full border border-[#B7D7C0]">
                ACTIVE PROTOCOL
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#292820] font-heading group-hover:text-[#D99A38] transition">
                Resting Tremor Examination
              </h3>
              <p className="text-xs text-[#817D70] mt-1.5 leading-relaxed">
                Evaluates involuntary rhythmic hand oscillations during a quiet resting pose.
                Performs discrete FFT decomposition to extract dominant frequency (Hz) and 4–6 Hz band power.
              </p>
            </div>

            {/* Checklist details */}
            <div className="space-y-2 pt-3 border-t border-[#EAE6D9] text-xs text-[#817D70]">
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#E9BD4B]" />
                <span>Test Duration: <strong className="text-[#292820]">10 seconds per phase</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Camera className="w-3.5 h-3.5 text-[#75D5C7]" />
                <span>Camera Setup: <strong className="text-[#292820]">Forearm supported, fingers in frame</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#789879]" />
                <span>Target Landmark: <strong className="text-[#292820]">Index Fingertip (Landmark 8)</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('live-tremor')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-xs rounded-full border border-[#E9BD4B] shadow-xs hover:shadow transition active:scale-95"
          >
            Start Resting Tremor Test <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: Finger Tapping */}
        <div className="card-flowing rounded-3xl p-7 flex flex-col justify-between space-y-6 bg-white/95 group hover:border-[#A0DDEB]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#E9BD4B] group-hover:scale-105 transition">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#EFF7F0] text-[#39734A] px-3 py-1 rounded-full border border-[#B7D7C0]">
                ACTIVE PROTOCOL
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#292820] font-heading group-hover:text-[#D99A38] transition">
                Rapid Finger-Tapping Task
              </h3>
              <p className="text-xs text-[#817D70] mt-1.5 leading-relaxed">
                Quantifies repetitive thumb-to-index movements (MDS-UPDRS Part III).
                Extracts cycle frequency, inter-tap interval regularity, and progressive amplitude fatigue decrement.
              </p>
            </div>

            {/* Checklist details */}
            <div className="space-y-2 pt-3 border-t border-[#EAE6D9] text-xs text-[#817D70]">
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#E9BD4B]" />
                <span>Test Duration: <strong className="text-[#292820]">10 seconds</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Camera className="w-3.5 h-3.5 text-[#75D5C7]" />
                <span>Camera Setup: <strong className="text-[#292820]">Hand upright, maximal tap aperture</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#789879]" />
                <span>Target Landmarks: <strong className="text-[#292820]">Thumb (4) & Index (8)</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('live-tapping')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-xs rounded-full border border-[#E9BD4B] shadow-xs hover:shadow transition active:scale-95"
          >
            Start Finger Tapping Test <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Voice Task Card */}
      <div className="relative z-10 card-flowing rounded-3xl p-7 bg-white/95 flex flex-col md:flex-row md:items-center md:justify-between gap-5 group hover:border-[#B8A8E8]">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#E9BD4B] shrink-0 group-hover:scale-105 transition">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#789879] font-bold">
              Browser-only • 5-second sustained vowel
            </span>
            <h3 className="text-base font-bold text-[#292820] mt-1 group-hover:text-[#D99A38] transition">
              Voice Signal Assessment
            </h3>
            <p className="text-xs text-[#817D70] mt-1 max-w-2xl leading-relaxed">
              Measure estimated pitch stability and amplitude variation from a sustained vowel. Audio is processed locally and discarded; this task does not classify or diagnose disease.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActivePage('voice')}
          className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-xs rounded-full border border-[#E9BD4B] shadow-xs hover:shadow transition active:scale-95"
        >
          Start Voice Task <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}