import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceArea
} from 'recharts';
import {
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  Zap,
  FlaskConical
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';
import ScreeningSummary from '../components/ScreeningSummary';

const ChartCard = ({ title, subtitle, legend, children, className = '' }) => (
  <section className={`min-w-0 rounded-3xl card-flowing p-5 bg-white/95 flex flex-col justify-between ${className}`}>
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <h3 className="font-heading text-sm font-bold text-[#292820]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11px] text-[#817D70]">{subtitle}</p>}
      </div>
      {legend && (
        <div className="flex items-center gap-2 text-[10px] font-medium text-[#817D70] shrink-0">
          {legend}
        </div>
      )}
    </div>
    <div className="flex-1 w-full">{children}</div>
  </section>
);

export default function AssessmentResults({
  tremorData,
  tappingData,
  voiceData,
  setActivePage
}) {
  const phase1Data = tremorData?.phase1 || tremorData;
  const phase2Data = tremorData?.phase2 || null;

  const displayWaveform = phase1Data?.filtered_waveform || [];
  const displaySpectrum = phase1Data?.frequency_spectrum || [];

  const envelopeComparison = displayWaveform.map((point, index) => ({
    time_sec: point.time_sec,
    phase1: point.envelope,
    phase2: phase2Data?.filtered_waveform?.[index]?.envelope
  }));

  const dominantFreq = phase1Data?.dominant_frequency_hz;
  const rmsAmp = phase1Data?.rms_amplitude;
  const powerBand = phase1Data?.power_ratio_4_6hz != null ? (phase1Data.power_ratio_4_6hz * 100).toFixed(1) : null;
  const duration = phase1Data?.duration_seconds;
  const quality = phase1Data?.quality;
  const fps = phase1Data?.effective_fps;
  const trackedPercent = phase1Data?.hand_presence_fraction != null ? Number((phase1Data.hand_presence_fraction * 100).toFixed(1)) : null;
  const recordedAt = tremorData?.completed_at || phase1Data?.completed_at;

  return (
    <div className="relative p-6 sm:p-8 space-y-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background Flowing Ribbon layer */}
      <FlowingRibbon position="full" opacity={0.78} className="absolute inset-0 pointer-events-none" />

      {/* Header matching Reference Image */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-[#F5F1E9] text-xs font-semibold text-[#292820] border border-[#EAE6D9] shadow-xs transition active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#292820] tracking-tight pt-1">
            Motor Assessment Results
          </h2>
          <p className="text-xs text-[#817D70]">
            Detailed analysis of recorded hand movement characteristics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('report')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] font-bold text-xs rounded-full border border-[#E9BD4B] shadow-xs transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F5F1E9] text-[#292820] font-semibold text-xs rounded-full border border-[#EAE6D9] shadow-xs transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-[#817D70]" /> Print
          </button>
        </div>
      </div>

      {/* Meta Pills Row matching Reference Screenshot */}
      <div className="relative z-10 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#EAE6D9] text-xs font-mono text-[#292820] shadow-xs">
          <Calendar className="w-3 h-3 text-[#E9BD4B]" /> {recordedAt ? new Date(recordedAt).toLocaleString() : 'Assessment time unavailable'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#EAE6D9] text-xs font-mono text-[#292820] shadow-xs">
          <Clock className="w-3 h-3 text-[#75D5C7]" /> Duration: {duration != null ? `${duration}s` : '—'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF7F0] border border-[#B7D7C0] text-xs font-mono font-bold text-[#39734A] shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-[#39734A]" /> Quality: {quality || 'Not recorded'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#EAE6D9] text-xs font-mono text-[#292820] shadow-xs">
          <Zap className="w-3 h-3 text-[#E9BD4B]" /> Resting-hand tremor
        </span>
      </div>

      <ScreeningSummary tremor={tremorData} tapping={tappingData} voice={voiceData} />

      {/* 3 Main Kinematic Charts in a Row matching Reference Screenshot */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Resting Tremor - Finger Displacement */}
        <ChartCard
          title="Resting Tremor — Finger Displacement"
          legend={
            <>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#B1AA98]" />Raw</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E9BD4B]" />Filtered</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#B8A8E8]" />Envelope</span>
            </>
          }
        >
          <div className="h-52 w-full pt-2">
            {displayWaveform.length ?
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayWaveform} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
                <XAxis dataKey="time_sec" stroke="#817D70" fontSize={9} tickFormatter={(v) => `${v}s`} />
                <YAxis stroke="#817D70" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: 8, fontSize: 10 }} />
                <Line type="monotone" dataKey="raw_displacement" stroke="#B1AA98" dot={false} strokeWidth={1} name="raw" />
                <Line type="monotone" dataKey="filtered" stroke="#E9BD4B" dot={false} strokeWidth={2} name="filtered" />
                <Line type="monotone" dataKey="envelope" stroke="#B8A8E8" strokeDasharray="3 3" dot={false} strokeWidth={1.5} name="envelope" />
              </LineChart>
            </ResponsiveContainer>
              : <div className="flex h-full items-center justify-center text-xs text-[#817D70]">No recorded tremor waveform.</div>}
          </div>
        </ChartCard>

        {/* Chart 2: FFT Spectrum - Phase 1 with 4-6 Hz highlighted band */}
        <ChartCard
          title="FFT Spectrum — Phase 1"
          legend={
            <span className="font-mono text-[10px] font-bold text-[#292820] bg-[#FFF9E5] px-2 py-0.5 rounded-full border border-[#E9BD4B]">
              {dominantFreq != null ? `${dominantFreq} Hz Peak` : 'No recorded peak'}
            </span>
          }
        >
          <div className="h-52 w-full pt-2">
            {displaySpectrum.length ?
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displaySpectrum} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
                <XAxis dataKey="frequency_hz" stroke="#817D70" fontSize={9} tickFormatter={(v) => `${v} Hz`} />
                <YAxis stroke="#817D70" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: 8, fontSize: 10 }} />
                <ReferenceArea x1={4} x2={6} stroke="#E9BD4B" fill="#F4D66D" fillOpacity={0.25} />
                <Bar dataKey="power" fill="#E9BD4B" radius={[4, 4, 0, 0]} name="FFT Amplitude" />
              </BarChart>
            </ResponsiveContainer>
              : <div className="flex h-full items-center justify-center text-xs text-[#817D70]">No recorded frequency spectrum.</div>}
          </div>
        </ChartCard>

        {/* Chart 3: Amplitude Envelope */}
        <ChartCard
          title="Amplitude Envelope"
          legend={
            <>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E9BD4B]" />Phase 1</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#75D5C7]" />Phase 2</span>
            </>
          }
        >
          <div className="h-52 w-full pt-2">
            {phase2Data && envelopeComparison.length ?
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={envelopeComparison} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
                <XAxis dataKey="time_sec" stroke="#817D70" fontSize={9} tickFormatter={(v) => `${v}s`} />
                <YAxis stroke="#817D70" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: 8, fontSize: 10 }} />
                <Line type="monotone" dataKey="phase1" stroke="#E9BD4B" dot={false} strokeWidth={2} name="Phase 1" />
                <Line type="monotone" dataKey="phase2" stroke="#75D5C7" dot={false} strokeWidth={2} name="Phase 2" />
              </LineChart>
            </ResponsiveContainer>
              : <div className="flex h-full items-center justify-center text-xs text-[#817D70]">Record both phases to compare measured amplitude envelopes.</div>}
          </div>
        </ChartCard>
      </div>

      {/* Bottom 2 Summary Cards matching Reference Screenshot */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recording Quality */}
        <div className="lg:col-span-4 card-flowing rounded-3xl p-6 bg-white/95 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#292820]">Recording Quality</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${quality === 'Good' ? 'bg-[#EFF7F0] text-[#39734A] border border-[#B7D7C0]' : 'bg-[#FAF9F4] text-[#817D70] border border-[#EAE6D9]'}`}>
              {quality || 'Not recorded'}
            </span>
          </div>

          <div className="py-2">
            <div className="text-lg font-mono font-bold text-[#292820]">
              FPS: {fps ?? '—'} · Tracking: {trackedPercent != null ? `${trackedPercent}%` : '—'}
            </div>
            <p className="text-[11px] text-[#817D70] mt-1">
              Values are measured from this session. Low sampling or tracking quality can exclude this modality from triage.
            </p>
          </div>

          <div className="h-1.5 rounded-full bg-[#EFF7F0] overflow-hidden">
            <div className="h-full bg-[#789879] rounded-full" style={{ width: `${trackedPercent ?? 0}%` }} />
          </div>
        </div>

        {/* Right: Measurement Summary (4 Columns) */}
        <div className="lg:col-span-8 card-flowing rounded-3xl p-6 bg-white/95 space-y-3">
          <h4 className="text-xs font-bold text-[#292820]">Measurement Summary</h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="bg-[#FAF9F4] rounded-2xl p-4 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono text-[#817D70] uppercase font-bold block">Dominant Freq.</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">{dominantFreq != null ? `${dominantFreq} Hz` : '—'}</div>
              <span className="text-[10px] text-[#789879] block">Peak harmonic</span>
            </div>

            <div className="bg-[#FAF9F4] rounded-2xl p-4 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono text-[#817D70] uppercase font-bold block">RMS Amplitude</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">{rmsAmp ?? '—'}</div>
              <span className="text-[10px] text-[#817D70] block">Spatial a.u.</span>
            </div>

            <div className="bg-[#FAF9F4] rounded-2xl p-4 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono text-[#817D70] uppercase font-bold block">Power (4-6 Hz)</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">{powerBand != null ? `${powerBand}%` : '—'}</div>
              <span className="text-[10px] text-[#789879] block">Band energy</span>
            </div>

            <div className="bg-[#FAF9F4] rounded-2xl p-4 border border-[#EAE6D9] text-center space-y-1">
              <span className="text-[10px] font-mono text-[#817D70] uppercase font-bold block">Duration</span>
              <div className="text-xl font-extrabold font-mono text-[#292820]">{duration != null ? `${duration}s` : '—'}</div>
              <span className="text-[10px] text-[#817D70] block">Full observation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Card matching Reference Bottom */}
      <div className="relative z-10 card-flowing rounded-2xl p-4 bg-white/90 border border-[#EAE6D9] flex items-center justify-between gap-4 text-xs text-[#817D70]">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-4 h-4 text-[#E9BD4B] shrink-0" />
          <span>
            <strong>Observational Research Prototype:</strong> Measured kinematic characteristics only.
            Not a medical diagnosis or risk classification.
          </span>
        </div>
        <button
          onClick={() => setActivePage('about')}
          className="text-xs font-bold text-[#292820] hover:text-[#D99A38] shrink-0 transition"
        >
          Methodology Details →
        </button>
      </div>
    </div>
  );
}
