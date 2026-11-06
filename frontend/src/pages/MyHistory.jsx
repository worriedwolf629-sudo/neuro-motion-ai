import React, { useMemo, useState } from 'react';
import { Activity, Clock, Info, Radio, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import FlowingRibbon from '../components/FlowingRibbon';

const METRICS = {
  tremor: [
    { key: 'dominant_frequency_hz', label: 'Peak frequency', unit: 'Hz' },
    { key: 'rms_amplitude', label: 'RMS amplitude', unit: '' },
    { key: 'power_ratio_4_6hz', label: '4–6 Hz band power', unit: '%' }
  ],
  tapping: [
    { key: 'taps_per_second', label: 'Tapping rate', unit: 'taps/s' },
    { key: 'total_taps', label: 'Detected tap cycles', unit: 'taps' },
    { key: 'average_amplitude', label: 'Mean normalized amplitude', unit: '' },
    { key: 'interval_variability_cv', label: 'Rhythm variability', unit: '%' }
  ],
  voice: [
    { key: 'estimated_pitch_mean_hz', label: 'Mean estimated pitch', unit: 'Hz' },
    { key: 'pitch_variation_sd_hz', label: 'Pitch variation', unit: 'Hz' },
    { key: 'rms_amplitude_variation_cv_percent', label: 'Amplitude variation', unit: '%' }
  ]
};

const TYPE_LABELS = { tremor: 'Resting tremor', tapping: 'Finger tapping', voice: 'Voice signal' };
const resultOf = (record) => record.results || {};
const valueOf = (record, key) => {
  const results = resultOf(record);
  const value = results[key] ?? results.phase1?.[key];
  if (value == null || !Number.isFinite(Number(value))) return null;
  return key === 'power_ratio_4_6hz' ? Number(value) * 100 : Number(value);
};
const formatDateTime = (record) => record.completed_at
  ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.completed_at))
  : record.legacy_date ? `${record.legacy_date} · exact time unavailable` : 'Legacy record · exact time unavailable';
const showValue = (value, metric) => value == null ? '—' : `${Number(value).toFixed(2)}${metric.unit ? ` ${metric.unit}` : ''}`;

export default function MyHistory({ records = [], loading = false, onOpenRecord }) {
  const [type, setType] = useState('tremor');
  const [metricKey, setMetricKey] = useState(METRICS.tremor[0].key);
  const options = METRICS[type] || METRICS.tremor;
  const selectedMetric = options.find((item) => item.key === metricKey) || options[0];
  const matching = useMemo(() => records
    .filter((record) => record.assessment_type === type && valueOf(record, selectedMetric.key) != null)
    .sort((a, b) => new Date(a.completed_at || a.created_at || a.legacy_date || 0) - new Date(b.completed_at || b.created_at || b.legacy_date || 0)),
  [records, type, selectedMetric.key]);
  const chartRows = matching.map((record) => ({
    ...record,
    chartDate: record.completed_at
      ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(record.completed_at))
      : record.legacy_date || `Legacy ${index + 1}`,
    chartValue: valueOf(record, selectedMetric.key)
  }));
  const previous = chartRows.length > 1 ? chartRows[chartRows.length - 2] : null;
  const latest = chartRows.at(-1) || null;
  const difference = previous && latest ? latest.chartValue - previous.chartValue : null;
  const sortedRecords = [...records].sort((a, b) => new Date(b.completed_at || b.created_at || b.legacy_date || 0) - new Date(a.completed_at || a.created_at || a.legacy_date || 0));

  const changeType = (nextType) => {
    setType(nextType);
    setMetricKey(METRICS[nextType][0].key);
  };

  return (
    <div className="relative mx-auto max-w-6xl space-y-6 p-6 md:p-8 overflow-hidden">
      {/* Background Flowing Ribbon layer */}
      <FlowingRibbon position="full" opacity={0.75} className="absolute inset-0 pointer-events-none" />

      <header className="relative z-10 flex flex-wrap items-end justify-between gap-3 border-b border-[#EAE6D9] pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#817D70]">Your account</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold font-heading text-[#292820] tracking-tight">Session History & Comparison</h2>
          <p className="mt-1 text-xs text-[#817D70]">All saved recordings for this account, newest first.</p>
        </div>
        <span className="rounded-full border border-[#EAE6D9] bg-white px-4 py-1.5 text-xs font-semibold text-[#292820] shadow-xs">{records.length} saved {records.length === 1 ? 'record' : 'records'}</span>
      </header>

      <section className="card-flowing rounded-3xl p-6 bg-white/95 relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#292820]"><TrendingUp className="h-4 w-4 text-[#D99A38]" />Compare your sessions</h3>
            <p className="mt-1 text-[11px] text-[#817D70]">The chart uses every saved record of the selected assessment and metric.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="text-[10px] font-semibold text-[#817D70]">Assessment<select value={type} onChange={(event) => changeType(event.target.value)} className="mt-1 block rounded-lg border border-[#EAE6D9] bg-white px-3 py-2 text-xs text-[#292820]">
              {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select></label>
            <label className="text-[10px] font-semibold text-[#817D70]">Measurement<select value={selectedMetric.key} onChange={(event) => setMetricKey(event.target.value)} className="mt-1 block rounded-lg border border-[#EAE6D9] bg-white px-3 py-2 text-xs text-[#292820]">
              {options.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select></label>
          </div>
        </div>

        {loading ? <div className="flex h-64 items-center justify-center text-xs text-[#817D70]">Loading your saved assessments…</div> : chartRows.length ? <>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                <CartesianGrid stroke="#EAE6D9" strokeDasharray="3 3" />
                <XAxis dataKey="chartDate" tick={{ fontSize: 10, fill: '#817D70' }} minTickGap={24} />
                <YAxis tick={{ fontSize: 10, fill: '#817D70' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: 10, fontSize: 11 }} formatter={(value) => [showValue(value, selectedMetric), selectedMetric.label]} labelFormatter={(label) => label} />
                <Line type="monotone" dataKey="chartValue" name={selectedMetric.label} stroke="#D99A38" strokeWidth={2.5} dot={{ r: 4, fill: '#D99A38' }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 border-t border-[#EAE6D9] pt-4 sm:grid-cols-3">
            <CompareValue label="Previous session" record={previous} metric={selectedMetric} />
            <CompareValue label="Latest session" record={latest} metric={selectedMetric} />
            <div className="rounded-xl bg-[#FAF9F4] p-3"><p className="text-[10px] text-[#817D70]">Change since previous</p><p className="mt-1 font-mono text-lg font-bold text-[#292820]">{difference == null ? 'Need 2 records' : `${difference > 0 ? '+' : ''}${difference.toFixed(2)}${selectedMetric.unit ? ` ${selectedMetric.unit}` : ''}`}</p></div>
          </div>
        </> : <div className="mt-4 flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[#EAE6D9] text-center">
          <Activity className="h-7 w-7 text-[#D7CDAE]" /><p className="mt-2 text-sm font-semibold text-[#292820]">No {TYPE_LABELS[type].toLowerCase()} records yet</p><p className="mt-1 text-xs text-[#817D70]">Complete this assessment to start a comparison chart.</p>
        </div>}
      </section>

      <section className="card-flowing overflow-hidden rounded-2xl relative z-10">
        <div className="border-b border-[#EAE6D9] p-5"><h3 className="text-sm font-bold text-[#292820]">Every saved assessment</h3><p className="mt-1 text-[11px] text-[#817D70]">Date and time are shown in your browser’s local timezone.</p></div>
        {sortedRecords.length ? <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-xs">
          <thead className="bg-[#F5F1E9] text-[10px] uppercase tracking-wide text-[#817D70] font-semibold border-b border-[#EAE6D9]"><tr><th className="px-5 py-3">Date & time</th><th className="px-5 py-3">Assessment</th><th className="px-5 py-3">Recording quality</th><th className="px-5 py-3">Key measurements</th><th className="px-5 py-3">Report</th></tr></thead>
          <tbody className="divide-y divide-[#F0EDE4]">{sortedRecords.map((record) => <RecordRow key={record.id} record={record} onOpenRecord={onOpenRecord} />)}</tbody>
        </table></div> : <div className="p-10 text-center"><Clock className="mx-auto h-7 w-7 text-[#D7CDAE]" /><p className="mt-2 text-sm font-semibold text-[#292820]">No records saved</p><p className="mt-1 text-xs text-[#817D70]">Your completed assessments will appear here.</p></div>}
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-[#EAE6D9] bg-[#FAF9F4] p-4 text-[11px] leading-relaxed text-[#817D70]"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>These charts compare recorded measurements within the same assessment type. They are descriptive trends, not a disease probability, risk score, or diagnosis.</p></div>
    </div>
  );
}

function CompareValue({ label, record, metric }) {
  return <div className="rounded-xl bg-[#FAF9F4] p-3"><p className="text-[10px] text-[#817D70]">{label}</p><p className="mt-1 font-mono text-lg font-bold text-[#292820]">{record ? showValue(record.chartValue, metric) : '—'}</p><p className="mt-1 truncate text-[10px] text-[#817D70]">{record ? formatDateTime(record) : 'No earlier session'}</p></div>;
}

function RecordRow({ record, onOpenRecord }) {
  const results = resultOf(record);
  const primaryMetrics = (METRICS[record.assessment_type] || []).slice(0, 3);
  return <tr className="align-top">
    <td className="whitespace-nowrap px-5 py-4 text-[#292820]">{formatDateTime(record)}</td>
    <td className="px-5 py-4 font-semibold text-[#292820]">{TYPE_LABELS[record.assessment_type] || record.assessment_type}</td>
    <td className="px-5 py-4 text-[#817D70]">{record.quality || 'Not reported'}{record.effective_fps ? <span className="block text-[10px]">{record.effective_fps} FPS</span> : null}</td>
    <td className="px-5 py-4 text-[#292820]">{primaryMetrics.map((metric) => <span key={metric.key} className="mr-3 inline-block whitespace-nowrap"><span className="text-[#817D70]">{metric.label}:</span> {showValue(valueOf(record, metric.key), metric)}</span>)}{record.assessment_type === 'voice' && results.voiced_analysis_windows != null ? <span className="block mt-1 text-[10px] text-[#817D70]">{results.voiced_analysis_windows} voiced windows</span> : null}</td>
    <td className="px-5 py-4">{onOpenRecord ? <button onClick={() => onOpenRecord(record)} className="rounded-lg border border-[#EAE6D9] bg-white px-3 py-1.5 font-semibold text-[#292820] hover:bg-[#FAF9F4] transition">Open</button> : <span className="text-[#817D70]">—</span>}</td>
  </tr>;
}
