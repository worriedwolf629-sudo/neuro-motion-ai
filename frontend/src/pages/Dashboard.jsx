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
  Sparkles
} from 'lucide-react';

export default function Dashboard({
  tremorData,
  tappingData,
  sessionHistory,
  setActivePage
}) {
  const hasAnyData = !!(tremorData || tappingData);

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Welcome Workspace Banner */}
      <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] text-[11px] font-mono font-semibold text-[#817D70] mb-2">
            <Sparkles className="w-3 h-3 text-[#E9BD4B]" />
            Active Session #NM-2026-LIVE
          </div>
          <h2 className="text-2xl font-bold font-heading text-[#292820]">
            Motor Assessment Workspace
          </h2>
          <p className="text-xs text-[#817D70] mt-1 max-w-xl leading-relaxed">
            Perform guided, non-invasive motor tests using your webcam. Real-time signal processing
            extracts objective movement frequencies and tapping dynamics.
          </p>
        </div>

        <button
          onClick={() => setActivePage('assessments')}
          className="flex items-center gap-2 px-5 py-3 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition active:scale-95 shrink-0"
        >
          Start New Assessment <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Stat Telemetry Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#817D70]">Tremor Frequency</span>
            <Radio className="w-4 h-4 text-[#E9BD4B]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#292820]">
            {tremorData ? `${tremorData.dominant_frequency_hz} Hz` : '--'}
          </div>
          <p className="text-[11px] text-[#817D70]">
            {tremorData ? `Power in 4-6 Hz: ${(tremorData.power_ratio_4_6hz * 100).toFixed(1)}%` : 'Awaiting resting test'}
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#817D70]">Tremor RMS Amplitude</span>
            <Activity className="w-4 h-4 text-[#E9BD4B]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#292820]">
            {tremorData ? `${tremorData.rms_amplitude}` : '--'}
          </div>
          <p className="text-[11px] text-[#817D70]">
            {tremorData ? `Slope: ${tremorData.amplitude_slope}` : 'Awaiting resting test'}
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#817D70]">Tapping Frequency</span>
            <Activity className="w-4 h-4 text-[#E9BD4B]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#292820]">
            {tappingData ? `${tappingData.taps_per_second} taps/s` : '--'}
          </div>
          <p className="text-[11px] text-[#817D70]">
            {tappingData ? `${tappingData.total_taps} total cycles` : 'Awaiting tapping test'}
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#817D70]">Tapping Rhythm (CV)</span>
            <Clock className="w-4 h-4 text-[#E9BD4B]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#292820]">
            {tappingData ? `${tappingData.interval_variability_cv}%` : '--'}
          </div>
          <p className="text-[11px] text-[#817D70]">
            {tappingData ? `Fatigue: ${tappingData.amplitude_slope}` : 'Awaiting tapping test'}
          </p>
        </div>
      </div>

      {/* Assessment Modules Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1 Card */}
        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#817D70] uppercase">Module A</span>
              {tremorData ? (
                <span className="text-[10px] font-mono font-bold bg-[#FAF9F4] text-[#789879] px-2.5 py-0.5 rounded-full border border-[#EAE6D9]">
                  COMPLETED ({tremorData.quality})
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[#817D70] bg-[#FAF9F4] px-2.5 py-0.5 rounded-full border border-[#EAE6D9]">
                  NOT RECORDED
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#292820]">Resting-Hand Tremor</h3>
            <p className="text-xs text-[#817D70] mt-1 leading-relaxed">
              Real-time FFT frequency spectrum analysis, 4–6 Hz power ratio estimation, and displacement envelope tracking.
            </p>
          </div>

          <button
            onClick={() => setActivePage('live-tremor')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF9F4] hover:bg-[#F5F1E6] text-[#292820] font-bold text-xs rounded-xl border border-[#EAE6D9] transition"
          >
            {tremorData ? 'Retake Tremor Test' : 'Launch Tremor Assessment'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2 Card */}
        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#817D70] uppercase">Module B</span>
              {tappingData ? (
                <span className="text-[10px] font-mono font-bold bg-[#FAF9F4] text-[#789879] px-2.5 py-0.5 rounded-full border border-[#EAE6D9]">
                  COMPLETED ({tappingData.quality})
                </span>
              ) : (
                <span className="text-[10px] font-mono text-[#817D70] bg-[#FAF9F4] px-2.5 py-0.5 rounded-full border border-[#EAE6D9]">
                  NOT RECORDED
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#292820]">Rapid Finger Tapping</h3>
            <p className="text-xs text-[#817D70] mt-1 leading-relaxed">
              MDS-UPDRS finger-tapping task quantifying cadence, cycle interval regularity, and amplitude fatigue regression.
            </p>
          </div>

          <button
            onClick={() => setActivePage('live-tapping')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF9F4] hover:bg-[#F5F1E6] text-[#292820] font-bold text-xs rounded-xl border border-[#EAE6D9] transition"
          >
            {tappingData ? 'Retake Tapping Test' : 'Launch Tapping Assessment'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Latest Completed Session Preview */}
      {hasAnyData && (
        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#817D70] font-bold block mb-1">
              Active Assessment Telemetry Available
            </span>
            <p className="text-xs text-[#292820] leading-relaxed">
              Review full displacement waveforms, FFT spectral charts, and export a structured Motor Assessment Report.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActivePage('results')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF9F4] hover:bg-[#F5F1E6] text-[#292820] font-bold text-xs rounded-xl border border-[#EAE6D9] transition"
            >
              View Analytics
            </button>
            <button
              onClick={() => setActivePage('report')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition"
            >
              <FileText className="w-3.5 h-3.5" /> Motor Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
