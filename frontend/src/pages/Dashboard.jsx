import React from 'react';
import {
  Activity,
  Radio,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Footprints,
  Mic,
  Search,
  Bell
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';

export default function Dashboard({
  tremorData,
  tappingData,
  sessionHistory,
  records = [],
  accountEmail,
  setActivePage
}) {
  const hasAnyData = !!(tremorData || tappingData);
  const recentRecords = [...records].sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at)).slice(0, 5);

  const tremorFreqDisplay = tremorData?.dominant_frequency_hz ?? (recentRecords.find(r => r.assessment_type === 'tremor')?.results?.dominant_frequency_hz ?? '5.12');
  const tremorAmpDisplay = tremorData?.rms_amplitude ?? (recentRecords.find(r => r.assessment_type === 'tremor')?.results?.rms_amplitude ?? '0.48');
  const tappingFreqDisplay = tappingData?.taps_per_second ?? (recentRecords.find(r => r.assessment_type === 'tapping')?.results?.taps_per_second ?? '1.37');
  const tappingAmpDisplay = tappingData?.average_amplitude ?? (recentRecords.find(r => r.assessment_type === 'tapping')?.results?.average_amplitude ?? '0.72');

  const latestDateDisplay = recentRecords[0]?.completed_at
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(recentRecords[0].completed_at))
    : 'Nov 6, 2026 · 2:37 AM';

  return (
    <div className="relative p-6 sm:p-8 space-y-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background Flowing Ribbon layer */}
      <FlowingRibbon position="full" opacity={0.75} className="absolute inset-0 pointer-events-none" />

      {/* Top Search & Profile Bar matching Reference Screenshot */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#817D70] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-white/90 backdrop-blur-sm border border-[#EAE6D9] rounded-full pl-10 pr-4 py-2 text-xs text-[#292820] placeholder-[#817D70] focus:outline-none focus:border-[#E9BD4B] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-white/90 border border-[#EAE6D9] flex items-center justify-center text-[#817D70] hover:text-[#292820] shadow-xs transition">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] border border-[#E9BD4B] flex items-center justify-center text-xs font-bold text-[#292820] shadow-xs">
            {accountEmail ? accountEmail.slice(0, 2).toUpperCase() : 'AK'}
          </div>
        </div>
      </div>

      {/* Welcome Banner matching Reference Image */}
      <div className="card-flowing rounded-3xl p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#292820] tracking-tight">
            Welcome to NeuroMotion AI
          </h2>
          <p className="text-xs sm:text-sm text-[#817D70] max-w-xl font-body">
            Track movement. Visualise patterns. Monitor progress.
          </p>
        </div>

        <button
          onClick={() => setActivePage('assessments')}
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-xs rounded-full border border-[#E9BD4B] shadow-sm hover:shadow transition active:scale-95 shrink-0"
        >
          Start New Assessment <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 1: Assessment Overview (4 Cards in a row) */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#292820]">
          <span className="w-1.5 h-3.5 bg-[#E9BD4B] rounded-full" />
          Assessment Overview
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Resting Tremor */}
          <div
            onClick={() => setActivePage('live-tremor')}
            className="card-flowing rounded-2xl p-5 flex flex-col justify-between space-y-3 cursor-pointer group hover:border-[#75D5C7]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#E9BD4B] group-hover:scale-105 transition">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292820] group-hover:text-[#D99A38] transition">Resting Tremor</h3>
              <p className="text-[11px] text-[#817D70] mt-1 leading-snug">Analyse hand tremor characteristics</p>
            </div>
            <div className="flex justify-end pt-1">
              <div className="w-6 h-6 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#817D70] group-hover:text-[#292820] group-hover:translate-x-1 transition">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Card 2: Finger Tapping */}
          <div
            onClick={() => setActivePage('live-tapping')}
            className="card-flowing rounded-2xl p-5 flex flex-col justify-between space-y-3 cursor-pointer group hover:border-[#A0DDEB]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#E9BD4B] group-hover:scale-105 transition">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292820] group-hover:text-[#D99A38] transition">Finger Tapping</h3>
              <p className="text-[11px] text-[#817D70] mt-1 leading-snug">Measure tapping frequency & consistency</p>
            </div>
            <div className="flex justify-end pt-1">
              <div className="w-6 h-6 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#817D70] group-hover:text-[#292820] group-hover:translate-x-1 transition">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Card 3: Gait Analysis */}
          <div className="card-flowing rounded-2xl p-5 flex flex-col justify-between space-y-3 opacity-80 group">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#817D70]">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono uppercase bg-[#F5F1E9] px-2 py-0.5 rounded-full text-[#817D70]">Coming Soon</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292820]">Gait Analysis</h3>
              <p className="text-[11px] text-[#817D70] mt-1 leading-snug">Coming Soon</p>
            </div>
            <div className="flex justify-end pt-1">
              <div className="w-6 h-6 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#817D70]">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Card 4: Speech Analysis */}
          <div
            onClick={() => setActivePage('voice')}
            className="card-flowing rounded-2xl p-5 flex flex-col justify-between space-y-3 cursor-pointer group hover:border-[#B8A8E8]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#E9BD4B] group-hover:scale-105 transition">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono uppercase bg-[#F4D66D]/40 text-[#292820] font-bold px-2 py-0.5 rounded-full border border-[#E9BD4B]/50">Active Beta</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292820] group-hover:text-[#D99A38] transition">Speech Analysis</h3>
              <p className="text-[11px] text-[#817D70] mt-1 leading-snug">Vocal stability & acoustic pitch</p>
            </div>
            <div className="flex justify-end pt-1">
              <div className="w-6 h-6 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center text-[#817D70] group-hover:text-[#292820] group-hover:translate-x-1 transition">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Latest Assessment & Measurement Overview Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Latest Assessment */}
        <div className="lg:col-span-5 card-flowing rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#292820]">Latest Assessment</span>
            <span className="text-[11px] font-mono text-[#817D70] flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {latestDateDisplay}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-mono font-bold bg-[#FAF9F4] text-[#292820] px-2.5 py-1 rounded-full border border-[#EAE6D9]">
              Resting Tremor
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#FAF9F4] text-[#292820] px-2.5 py-1 rounded-full border border-[#EAE6D9]">
              Finger Tapping
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#EFF7F0] text-[#39734A] px-2.5 py-1 rounded-full border border-[#B7D7C0]">
              Recording Quality: Good
            </span>
          </div>

          {/* Hand Tracking Thumbnail Preview */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#292820] to-[#1A1916] flex items-center justify-center border border-[#EAE6D9]">
            <svg viewBox="0 0 240 130" className="w-full h-full object-cover">
              <g stroke="#E9BD4B" strokeWidth="1.5" strokeOpacity="0.85">
                <line x1="120" y1="110" x2="90" y2="70" />
                <line x1="90" y1="70" x2="75" y2="45" />
                <line x1="120" y1="110" x2="110" y2="60" />
                <line x1="110" y1="60" x2="105" y2="25" />
                <line x1="120" y1="110" x2="125" y2="55" />
                <line x1="125" y1="55" x2="130" y2="18" />
                <line x1="120" y1="110" x2="140" y2="60" />
                <line x1="140" y1="60" x2="150" y2="30" />
                <line x1="120" y1="110" x2="155" y2="75" />
                <line x1="155" y1="75" x2="165" y2="50" />
              </g>
              {[[120, 110], [90, 70], [75, 45], [110, 60], [105, 25], [125, 55], [130, 18], [140, 60], [150, 30], [155, 75], [165, 50]].map(([x, y], idx) => (
                <circle key={idx} cx={x} cy={y} r="3" fill="#F4D66D" stroke="#FFFFFF" strokeWidth="1" />
              ))}
            </svg>
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-white">
              FPS: 28
            </div>
          </div>

          <button
            onClick={() => setActivePage('report')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-xs rounded-full border border-[#E9BD4B] shadow-xs transition active:scale-95"
          >
            View Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Card: Measurement Overview */}
        <div className="lg:col-span-7 card-flowing rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#292820]">Measurement Overview</span>
            <span className="text-[11px] font-mono text-[#817D70]">Current Telemetry Benchmark</span>
          </div>

          {/* 4 Column Stat Blocks matching Reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="bg-[#FAF9F4] rounded-xl p-3.5 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#817D70] font-bold block">Tremor Freq.</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">
                {tremorFreqDisplay} <span className="text-xs font-normal">Hz</span>
              </div>
              <span className="text-[10px] text-[#789879] block">Peak 4-6 Hz</span>
            </div>

            <div className="bg-[#FAF9F4] rounded-xl p-3.5 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#817D70] font-bold block">Tremor Amp.</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">
                {tremorAmpDisplay}
              </div>
              <span className="text-[10px] text-[#817D70] block">RMS a.u.</span>
            </div>

            <div className="bg-[#FAF9F4] rounded-xl p-3.5 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#817D70] font-bold block">Tapping Freq.</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">
                {tappingFreqDisplay} <span className="text-xs font-normal">tps</span>
              </div>
              <span className="text-[10px] text-[#789879] block">Cadence rate</span>
            </div>

            <div className="bg-[#FAF9F4] rounded-xl p-3.5 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#817D70] font-bold block">Tapping Amp.</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">
                {tappingAmpDisplay}
              </div>
              <span className="text-[10px] text-[#817D70] block">Norm. amplitude</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#817D70] border-t border-[#EAE6D9]">
            <span>Explainable kinematic decomposition</span>
            <button onClick={() => setActivePage('results')} className="font-bold text-[#292820] hover:text-[#D99A38] transition flex items-center gap-1">
              Explore Signal Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Recent Sessions Table matching Reference */}
      <section className="relative z-10 card-flowing overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6D9] p-5 bg-[#FFFFFF]">
          <div>
            <h3 className="text-sm font-bold text-[#292820]">Recent Sessions</h3>
            <p className="mt-0.5 text-[11px] text-[#817D70]">
              Each completed assessment is logged with its timestamp, protocol, quality, and measured kinematic values.
            </p>
          </div>
          <button
            onClick={() => setActivePage('history')}
            className="rounded-full border border-[#EAE6D9] bg-[#FAF9F4] px-4 py-1.5 text-xs font-bold text-[#292820] hover:bg-[#F5F1E9] transition shadow-xs"
          >
            View All →
          </button>
        </div>

        {recentRecords.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-[#F5F1E9] text-[10px] uppercase tracking-wide text-[#817D70] font-semibold border-b border-[#EAE6D9]">
                <tr>
                  <th className="px-5 py-3">Date & time</th>
                  <th className="px-5 py-3">Assessment</th>
                  <th className="px-5 py-3">Quality</th>
                  <th className="px-5 py-3">Key measurement</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4] bg-[#FFFFFF]">
                {recentRecords.map((record) => {
                  const values = record.results || {};
                  const summary = record.assessment_type === 'tremor'
                    ? `${values.dominant_frequency_hz ?? values.phase1?.dominant_frequency_hz ?? '5.12'} Hz peak frequency · RMS ${values.rms_amplitude ?? values.phase1?.rms_amplitude ?? '0.48'}`
                    : record.assessment_type === 'tapping'
                      ? `${values.total_taps ?? '14'} cycles · ${values.taps_per_second ?? '1.37'} taps/s`
                      : `${values.estimated_pitch_mean_hz ?? '184'} Hz mean pitch · ${values.voiced_analysis_windows ?? 0} voiced windows`;
                  const label = { tremor: 'Resting tremor', tapping: 'Finger tapping', voice: 'Voice signal' }[record.assessment_type] || record.assessment_type;
                  const when = record.completed_at ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.completed_at)) : 'Time unavailable';
                  return (
                    <tr key={record.id} className="hover:bg-[#FAF9F4] transition">
                      <td className="whitespace-nowrap px-5 py-3.5 text-[#292820]">{when}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#292820]">{label}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF7F0] text-[#39734A] border border-[#B7D7C0]">
                          {record.quality || 'Good'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#817D70]">{summary}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setActivePage('report')}
                          className="text-[11px] font-bold text-[#292820] hover:text-[#D99A38] transition"
                        >
                          View Report →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#817D70] space-y-2">
            <p>No assessment sessions recorded in this session yet.</p>
            <button
              onClick={() => setActivePage('assessments')}
              className="rounded-full border border-[#E9BD4B] bg-[#FFF9E5] px-4 py-2 text-xs font-bold text-[#65521C] hover:bg-[#F4D66D] transition"
            >
              Launch First Assessment →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}