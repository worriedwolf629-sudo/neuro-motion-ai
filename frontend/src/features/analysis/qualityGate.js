const MIN_EFFECTIVE_FPS = 20;
const MIN_TREMOR_SECONDS = 3;
const MIN_TAPPING_SECONDS = 10;
const MIN_TAPS = 15;
const MIN_VOICED_FRACTION = 0.6;

const result = (reasons) => ({ ok: reasons.length === 0, reasons });

export function checkTremorQuality(metrics) {
  const reasons = [];
  if (!metrics || metrics.status !== 'success') reasons.push('No completed tremor measurement.');
  if ((metrics?.effective_fps ?? 0) < MIN_EFFECTIVE_FPS) reasons.push(`Sampling rate is below ${MIN_EFFECTIVE_FPS} FPS.`);
  if ((metrics?.duration_seconds ?? 0) < MIN_TREMOR_SECONDS) reasons.push(`At least ${MIN_TREMOR_SECONDS} seconds of movement are required.`);
  if ((metrics?.sampling_rate_hz ?? 0) <= 24) reasons.push('Sampling rate does not satisfy the Nyquist limit for the 12 Hz analysis band.');
  if ((metrics?.hand_presence_fraction ?? 0) < 0.9) reasons.push('The hand was not detected in enough frames.');
  return result(reasons);
}

export function checkTappingQuality(metrics) {
  const reasons = [];
  if (!metrics || metrics.status !== 'success') reasons.push('No completed finger-tapping measurement.');
  if ((metrics?.effective_fps ?? 0) < MIN_EFFECTIVE_FPS) reasons.push(`Sampling rate is below ${MIN_EFFECTIVE_FPS} FPS.`);
  if ((metrics?.duration_seconds ?? 0) < MIN_TAPPING_SECONDS) reasons.push(`At least ${MIN_TAPPING_SECONDS} seconds of tapping are required.`);
  if ((metrics?.total_taps ?? 0) < MIN_TAPS) reasons.push(`At least ${MIN_TAPS} complete taps are required.`);
  if ((metrics?.hand_presence_fraction ?? 0) < 0.9) reasons.push('The hand was not detected in enough frames.');
  return result(reasons);
}

export function checkVoiceQuality(metrics) {
  const reasons = [];
  if (!metrics) reasons.push('No completed voice measurement.');
  if ((metrics?.duration_seconds ?? 0) < 4.5) reasons.push('At least 4.5 seconds of the sustained vowel are required.');
  if ((metrics?.voiced_fraction ?? 0) <= MIN_VOICED_FRACTION) reasons.push('More than 60% of analysis windows must contain voiced audio.');
  if ((metrics?.jitter_local_percent == null) || (metrics?.shimmer_local_percent == null) || (metrics?.hnr_db == null)) reasons.push('Voice features could not be estimated reliably.');
  return result(reasons);
}

export function checkModalityQuality(modality, metrics) {
  if (modality === 'tremor') return checkTremorQuality(metrics);
  if (modality === 'tapping') return checkTappingQuality(metrics);
  if (modality === 'voice') return checkVoiceQuality(metrics);
  return result(['Unknown assessment modality.']);
}
