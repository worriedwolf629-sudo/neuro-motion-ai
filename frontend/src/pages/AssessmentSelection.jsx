import React from 'react';
import {
  Activity,
  Radio,
  ArrowRight,
  Clock,
  Camera,
  CheckCircle2,
  Sparkles,
  Footprints,
  Mic,
  Sliders
} from 'lucide-react';

export default function AssessmentSelection({ setActivePage }) {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-[#292820]">
          Assessment Selection
        </h2>
        <p className="text-xs text-[#817D70] mt-1 font-mono uppercase tracking-wider">
          Guided movement and voice signal tasks • short observation windows
        </p>
      </div>

      {/* Available Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Resting Tremor */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE6D9] p-6 shadow-sm hover:border-[#E9BD4B] transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#292820]">
                <Radio className="w-5 h-5 text-[#E9BD4B]" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#FAF9F4] text-[#789879] px-2.5 py-1 rounded-full border border-[#EAE6D9]">
                READY TO TEST
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#292820] font-heading">
                Resting-Hand Tremor Assessment
              </h3>
              <p className="text-xs text-[#817D70] mt-1 leading-relaxed">
                Evaluates involuntary rhythmic hand oscillations during a quiet resting pose.
                Performs discrete FFT decomposition to extract dominant frequency (Hz) and 4–6 Hz power ratio.
              </p>
            </div>

            {/* Checklist details */}
            <div className="space-y-2 pt-2 border-t border-[#EAE6D9] text-xs text-[#817D70]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#292820]" />
                <span>Test Duration: <strong>10 seconds</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-[#292820]" />
                <span>Camera Setup: <strong>Forearm supported, fingers relaxed in view</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#789879]" />
                <span>Target Landmark: <strong>Index Fingertip (Landmark 8)</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('live-tremor')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition active:scale-95"
          >
            Start Resting Tremor Test <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: Finger Tapping */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE6D9] p-6 shadow-sm hover:border-[#E9BD4B] transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#292820]">
                <Activity className="w-5 h-5 text-[#E9BD4B]" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#FAF9F4] text-[#789879] px-2.5 py-1 rounded-full border border-[#EAE6D9]">
                READY TO TEST
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#292820] font-heading">
                Rapid Finger-Tapping Assessment
              </h3>
              <p className="text-xs text-[#817D70] mt-1 leading-relaxed">
                Quantifies repetitive thumb-to-index movements (MDS-UPDRS Part III).
                Extracts cycle frequency, inter-tap interval regularity, and amplitude fatigue regression.
              </p>
            </div>

            {/* Checklist details */}
            <div className="space-y-2 pt-2 border-t border-[#EAE6D9] text-xs text-[#817D70]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#292820]" />
                <span>Test Duration: <strong>10 seconds</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-[#292820]" />
                <span>Camera Setup: <strong>Hand upright facing camera, maximal tap aperture</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#789879]" />
                <span>Target Landmarks: <strong>Thumb (4) and Index (8)</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('live-tapping')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition active:scale-95"
          >
            Start Finger Tapping Test <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAE6D9] p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center"><Mic className="w-5 h-5 text-[#E9BD4B]" /></div>
          <div><span className="text-[10px] font-mono uppercase tracking-wider text-[#789879] font-bold">Browser-only • 5 seconds</span><h3 className="text-base font-bold text-[#292820] mt-1">Voice Signal Assessment</h3><p className="text-xs text-[#817D70] mt-1 max-w-2xl">Measure estimated pitch stability and amplitude variation from a sustained vowel. Audio is processed locally and discarded; this task does not classify or diagnose disease.</p></div>
        </div>
        <button onClick={() => setActivePage('voice')} className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition active:scale-95">Start Voice Task <ArrowRight className="w-3.5 h-3.5" /></button>
      </div>

      {/* Future Roadmap Modules */}
      <div className="pt-6 border-t border-[#EAE6D9]">
        <h4 className="text-xs font-bold text-[#817D70] uppercase font-mono tracking-wider mb-4">
          Upcoming Research Modules
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF9F4] border border-[#EAE6D9] rounded-xl p-4 flex items-center justify-between opacity-70">
            <div className="flex items-center gap-3">
              <Footprints className="w-5 h-5 text-[#817D70]" />
              <div>
                <p className="text-xs font-bold text-[#292820]">Gait & Postural Balance Analysis</p>
                <p className="text-[11px] text-[#817D70]">Full-body pose estimation for stride symmetry and cadence</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#EAE6D9] px-2 py-0.5 rounded text-[#817D70]">
              In Development
            </span>
          </div>

          <div className="bg-[#FAF9F4] border border-[#EAE6D9] rounded-xl p-4 flex items-center justify-between opacity-70">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-[#817D70]" />
              <div>
                <p className="text-xs font-bold text-[#292820]">Voice Signal Analysis</p>
                <p className="text-[11px] text-[#817D70]">Local sustained-vowel pitch and amplitude measurements</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#EAE6D9] px-2 py-0.5 rounded text-[#817D70]">
              Available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

