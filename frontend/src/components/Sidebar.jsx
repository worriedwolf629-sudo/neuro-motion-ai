import React from 'react';
import {
  Activity,
  Layers,
  Radio,
  FileText,
  Clock,
  Info,
  Footprints,
  Mic,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-64 bg-[#FAF9F4] border-r border-[#EAE6D9] flex flex-col justify-between p-4 z-20 shrink-0 h-screen select-none">
      <div>
        {/* Brand Header */}
        <div
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-3 px-3 py-3 mb-6 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F4D66D] border border-[#E9BD4B] flex items-center justify-center shadow-sm group-hover:bg-[#E9BD4B] transition">
            <Activity className="w-5 h-5 text-[#292820]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-[#292820] font-heading">
              Neuro<span className="text-[#D99A38]">Motion</span>
            </h1>
            <p className="text-[10px] tracking-widest text-[#817D70] uppercase font-mono">Motor AI Engine</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activePage === 'dashboard'
                ? 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9] shadow-sm font-bold'
                : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#E9BD4B]" />
            Overview Workspace
          </button>

          <button
            onClick={() => setActivePage('assessments')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activePage === 'assessments'
                ? 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9] shadow-sm font-bold'
                : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#E9BD4B]" />
            Assessment Selection
          </button>
        </nav>

        {/* Live Assessments Sub-menu */}
        <div className="mt-6 pt-5 border-t border-[#EAE6D9]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#817D70] px-3 mb-2 font-bold">
            Active Tests
          </p>

          <div className="space-y-1">
            <button
              onClick={() => setActivePage('live-tremor')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activePage === 'live-tremor'
                  ? 'bg-[#F4D66D]/40 text-[#292820] font-bold border border-[#E9BD4B]/50'
                  : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#292820]" />
                Resting Tremor
              </span>
              <ChevronRight className="w-3 h-3 text-[#817D70]" />
            </button>

            <button
              onClick={() => setActivePage('live-tapping')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                activePage === 'live-tapping'
                  ? 'bg-[#F4D66D]/40 text-[#292820] font-bold border border-[#E9BD4B]/50'
                  : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#292820]" />
                Finger Tapping
              </span>
              <ChevronRight className="w-3 h-3 text-[#817D70]" />
            </button>

            {/* Upcoming Roadmap Items */}
            <div className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#817D70]/60 flex items-center justify-between cursor-not-allowed">
              <span className="flex items-center gap-2">
                <Footprints className="w-3.5 h-3.5 text-[#817D70]/50" />
                Gait Analysis
              </span>
              <span className="text-[9px] font-mono uppercase bg-[#F5F1E6] px-1.5 py-0.5 rounded text-[#817D70]">Soon</span>
            </div>

            <div className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#817D70]/60 flex items-center justify-between cursor-not-allowed">
              <span className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-[#817D70]/50" />
                Speech Analysis
              </span>
              <span className="text-[9px] font-mono uppercase bg-[#F5F1E6] px-1.5 py-0.5 rounded text-[#817D70]">Soon</span>
            </div>
          </div>
        </div>

        {/* Results & History */}
        <div className="mt-6 pt-5 border-t border-[#EAE6D9]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#817D70] px-3 mb-2 font-bold">
            Analytics & Reports
          </p>

          <div className="space-y-1">
            <button
              onClick={() => setActivePage('results')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activePage === 'results'
                  ? 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9] shadow-sm font-bold'
                  : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#E9BD4B]" />
              Assessment Results
            </button>

            <button
              onClick={() => setActivePage('report')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activePage === 'report'
                  ? 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9] shadow-sm font-bold'
                : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#E9BD4B]" />
              Motor Report
            </button>

            <button
              onClick={() => setActivePage('history')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activePage === 'history'
                  ? 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9] shadow-sm font-bold'
                  : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#E9BD4B]" />
              Session History
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info / About */}
      <div className="pt-4 border-t border-[#EAE6D9]">
        <button
          onClick={() => setActivePage('about')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
            activePage === 'about' ? 'bg-[#FFFFFF] text-[#292820] font-bold border border-[#EAE6D9]' : 'text-[#817D70] hover:text-[#292820]'
          }`}
        >
          <Info className="w-3.5 h-3.5 text-[#817D70]" />
          About Methodology
        </button>
        <div className="mt-3 p-3 bg-[#FFFFFF] rounded-xl border border-[#EAE6D9]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D99A38] block mb-1">
            Research Prototype
          </span>
          <p className="text-[11px] text-[#817D70] leading-relaxed">
            Non-diagnostic motor telemetry engine. Standard webcams only.
          </p>
        </div>
      </div>
    </aside>
  );
}
