import { checkModalityQuality } from './qualityGate.js';

// Experimental flag bands only. Values are deliberately marked to verify: they
// are not clinical reference limits and have not been calibrated on consumer devices.
export const SCREENING_THRESHOLDS = {
  tremor_frequency_hz: { value: { lower: 3, upper: 8 }, source: 'to verify', status: 'provisional' },
  tremor_band_power_percent: { value: { lower: 0, upper: 25 }, source: 'to verify', status: 'provisional' },
  tapping_cadence_taps_s: { value: { lower: 2, upper: 6 }, source: 'to verify', status: 'provisional' },
  tapping_interval_cv_percent: { value: { lower: 0, upper: 30 }, source: 'to verify', status: 'provisional' },
  tapping_amplitude_slope: { value: { lower: -0.03, upper: 0.03 }, source: 'to verify', status: 'provisional' },
  voice_jitter_percent: { value: { lower: 0, upper: 1 }, source: 'to verify', status: 'provisional' },
  voice_shimmer_percent: { value: { lower: 0, upper: 4 }, source: 'to verify', status: 'provisional' },
  voice_hnr_db: { value: { lower: 20, upper: 60 }, source: 'to verify', status: 'provisional' },
};

export const SCREENING_DISCLAIMER = 'Research screening aid; no diagnosis is made. All thresholds are provisional and unvalidated on consumer webcams and microphones.';

function flag(modality, metricName, observedValue, thresholdKey) {
  const threshold = SCREENING_THRESHOLDS[thresholdKey];
  if (!Number.isFinite(observedValue) || !threshold) return null;
  const { lower, upper } = threshold.value;
  const outside = observedValue < lower || observedValue > upper;
  const margin = (upper - lower) * 0.15;
  const nearBoundary = (observedValue < lower && lower - observedValue <= margin)
    || (observedValue > upper && observedValue - upper <= margin);
  const severity = !outside ? 'normal' : nearBoundary ? 'borderline' : 'elevated';
  return {
    modality,
    metricName,
    observedValue,
    referenceRange: `${lower}–${upper}`,
    severity,
    citation: threshold.source,
    provisional: threshold.status === 'provisional',
  };
}

function buildFlags(modality, metrics) {
  if (!metrics) return [];
  if (modality === 'tremor') return [
    flag(modality, 'Dominant frequency (Hz)', metrics.dominant_frequency_hz, 'tremor_frequency_hz'),
    flag(modality, '4–6 Hz band power (%)', Number(metrics.power_ratio_4_6hz) * 100, 'tremor_band_power_percent'),
  ].filter(Boolean);
  if (modality === 'tapping') return [
    flag(modality, 'Tapping cadence (taps/s)', metrics.taps_per_second, 'tapping_cadence_taps_s'),
    flag(modality, 'Interval variability (CV %)', metrics.interval_variability_cv, 'tapping_interval_cv_percent'),
    flag(modality, 'Amplitude slope', metrics.amplitude_slope, 'tapping_amplitude_slope'),
  ].filter(Boolean);
  if (modality === 'voice') return [
    flag(modality, 'Local jitter (%)', metrics.jitter_local_percent, 'voice_jitter_percent'),
    flag(modality, 'Local shimmer (%)', metrics.shimmer_local_percent, 'voice_shimmer_percent'),
    flag(modality, 'HNR (dB)', metrics.hnr_db, 'voice_hnr_db'),
  ].filter(Boolean);
  return [];
}

export function evaluateScreeningTriage({ tremor, tapping, voice } = {}) {
  const inputs = { tremor, tapping, voice };
  const modalities = Object.entries(inputs).map(([modality, metrics]) => {
    const quality = checkModalityQuality(modality, metrics);
    const flags = quality.ok ? buildFlags(modality, metrics) : [];
    const severities = flags.map((item) => item.severity);
    const severity = !quality.ok || !flags.length
      ? 'incomplete'
      : severities.includes('elevated') ? 'elevated' : severities.includes('borderline') ? 'borderline' : 'normal';
    return { modality, quality, severity, flags };
  });
  const eligible = modalities.filter((item) => item.quality.ok);
  const elevatedCount = eligible.filter((item) => item.severity === 'elevated').length;
  const borderlineCount = eligible.filter((item) => item.severity === 'borderline').length;
  let tier = 'INCOMPLETE_SCREEN';
  if (eligible.length >= 2) {
    if (elevatedCount >= 2) tier = 'SUGGEST_NEUROLOGIST_FOLLOWUP';
    else if (elevatedCount === 1 || borderlineCount >= 2) tier = 'BORDERLINE_RETEST';
    else if (eligible.every((item) => item.severity === 'normal')) tier = 'WITHIN_TYPICAL_RANGE';
    else tier = 'BORDERLINE_RETEST';
  }
  const flags = modalities.flatMap((item) => item.flags);
  const outsideCount = eligible.filter((item) => item.severity !== 'normal').length;
  return {
    tier,
    modalities,
    flags,
    domainCount: `${outsideCount} of ${eligible.length} domains outside provisional reference range`,
    disclaimer: SCREENING_DISCLAIMER,
  };
}
