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
  FlaskConical
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const getNavItemClass = (page) =>
    activePage === page
      ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#F4D66D] text-[#292820] shadow-xs transition'
      : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E9] transition';

  const getSubItemClass = (page) =>
    activePage === page
      ? 'w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F4D66D] text-[#292820] shadow-xs flex items-center justify-between transition'
      : 'w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E9] flex items-center justify-between transition';

  return (
    <aside className="w-64 bg-[#FAF9F4] border-r border-[#EAE6D9] flex flex-col justify-between p-4 z-20 shrink-0 h-screen select-none">
      <div>
        {/* Brand Header */}
        <div
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-3 px-3 py-3 mb-6 cursor-pointer group rounded-xl transition hover:bg-[#F5F1E9]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F4D66D] border border-[#E9BD4B] flex items-center justify-center shadow-sm group-hover:bg-[#E9BD4B] transition">
            <Activity className="w-5 h-5 text-[#292820]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-[#292820] font-heading">
              Neuro<span className="text-[#D99A38]">Motion AI</span>
            </h1>
            <p className="text-[10px] tracking-widest text-[#817D70] uppercase font-mono">Motor AI Engine</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => setActivePage('dashboard')}
            className={getNavItemClass('dashboard')}
          >
            <Layers className={`w-4 h-4 ${activePage === 'dashboard' ? 'text-[#292820]' : 'text-[#E9BD4B]'}`} />
            Overview
          </button>

          <button
            onClick={() => setActivePage('assessments')}
            className={getNavItemClass('assessments')}
          >
            <Sparkles className={`w-4 h-4 ${activePage === 'assessments' ? 'text-[#292820]' : 'text-[#E9BD4B]'}`} />
            Assessments
          </button>
        </nav>

        {/* Live Assessments Sub-menu */}
        <div className="mt-6 pt-5 border-t border-[#EAE6D9]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#817D70] px-3 mb-2 font-bold">
            Assessments
          </p>

          <div className="space-y-1">
            <button
              onClick={() => setActivePage('live-tremor')}
              className={getSubItemClass('live-tremor')}
            >
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-current" />
                Resting Tremor
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              onClick={() => setActivePage('live-tapping')}
              className={getSubItemClass('live-tapping')}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-current" />
                Finger Tapping
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            {/* Upcoming Roadmap Items */}
            <div className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#817D70]/60 flex items-center justify-between cursor-not-allowed">
              <span className="flex items-center gap-2">
                <Footprints className="w-3.5 h-3.5 text-[#817D70]/50" />
                Gait Analysis
              </span>
              <span className="text-[9px] font-mono uppercase bg-[#F5F1E9] px-1.5 py-0.5 rounded text-[#817D70]">Soon</span>
            </div>

            <button
              onClick={() => setActivePage('voice')}
              className={getSubItemClass('voice')}
            >
              <span className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-current" />
                Speech Analysis
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>

        {/* Results & History */}
        <div className="mt-6 pt-5 border-t border-[#EAE6D9]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#817D70] px-3 mb-2 font-bold">
            Results & Reports
          </p>

          <div className="space-y-1">
            <button
              onClick={() => setActivePage('results')}
              className={getNavItemClass('results')}
            >
              <Activity className={`w-3.5 h-3.5 ${activePage === 'results' ? 'text-[#292820]' : 'text-[#E9BD4B]'}`} />
              Results & Reports
            </button>

            <button
              onClick={() => setActivePage('history')}
              className={getNavItemClass('history')}
            >
              <Clock className={`w-3.5 h-3.5 ${activePage === 'history' ? 'text-[#292820]' : 'text-[#E9BD4B]'}`} />
              Session History
            </button>

            <button
              onClick={() => setActivePage('report')}
              className={getNavItemClass('report')}
            >
              <FileText className={`w-3.5 h-3.5 ${activePage === 'report' ? 'text-[#292820]' : 'text-[#E9BD4B]'}`} />
              Motor Report
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info / About */}
      <div className="pt-4 border-t border-[#EAE6D9]">
        <button
          onClick={() => setActivePage('about')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
            activePage === 'about' ? 'bg-[#F4D66D] text-[#292820] font-bold shadow-xs' : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E9]'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          About NeuroMotion
        </button>

        <div className="mt-3 p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-[#EAE6D9] shadow-xs flex items-start gap-2.5">
          <FlaskConical className="w-4 h-4 text-[#E9BD4B] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D99A38] block">
              Research Prototype
            </span>
            <p className="text-[10px] text-[#817D70] leading-tight mt-0.5">
              Non-diagnostic tool
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
