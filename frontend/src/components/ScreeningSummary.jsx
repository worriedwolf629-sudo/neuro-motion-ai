import React from 'react';
import { evaluateScreeningTriage } from '../features/analysis/screeningTriage.js';

const TIER_LABELS = {
  WITHIN_TYPICAL_RANGE: 'Within provisional range',
  BORDERLINE_RETEST: 'Borderline — consider retesting',
  SUGGEST_NEUROLOGIST_FOLLOWUP: 'Consider discussing with a neurologist',
  INCOMPLETE_SCREEN: 'Incomplete screen — collect more data',
};

export default function ScreeningSummary({ tremor, tapping, voice }) {
  const screening = evaluateScreeningTriage({ tremor, tapping, voice });
  return (
    <section className="rounded-2xl border border-[#E9BD4B] bg-[#FFFDF5] p-5 space-y-4" aria-live="polite">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#817D70]">Provisional signal screening</p>
          <h3 className="mt-1 text-base font-bold text-[#292820]">{TIER_LABELS[screening.tier]}</h3>
        </div>
        <span className="rounded-full border border-[#EAE6D9] bg-white px-3 py-1 text-[11px] text-[#817D70]">{screening.domainCount}</span>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {screening.modalities.map((item) => (
          <div key={item.modality} className="rounded-xl border border-[#EAE6D9] bg-white p-3">
            <p className="text-xs font-bold capitalize text-[#292820]">{item.modality}</p>
            {!item.quality.ok ? <>
              <p className="mt-1 text-xs font-semibold text-[#B55C4A]">Uncertain: re-test</p>
              <ul className="mt-1 list-disc pl-4 text-[10px] text-[#817D70]">{item.quality.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            </> : <div className="mt-1 flex flex-wrap gap-1">
              {item.flags.map((metric) => <span key={metric.metricName} className={`rounded-full px-2 py-1 text-[9px] ${metric.severity === 'normal' ? 'bg-[#EFF7F0] text-[#39734A]' : metric.severity === 'borderline' ? 'bg-[#FFF4D3] text-[#8B6810]' : 'bg-[#FBEAE6] text-[#A64E3E]'}`} title={`${metric.metricName}: ${metric.observedValue}; provisional range ${metric.referenceRange}; source ${metric.citation}`}>
                {metric.metricName}: {Number(metric.observedValue).toFixed(2)} · {metric.severity}
              </span>)}
            </div>}
          </div>
        ))}
      </div>
      <p className="text-[10px] leading-relaxed text-[#817D70]">{screening.disclaimer} Outside-range flags use custom bands marked “to verify”; results cannot determine whether someone has Parkinson’s disease.</p>
    </section>
  );
}
