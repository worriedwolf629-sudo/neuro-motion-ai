const TARGET_SAMPLE_RATE = 12000;
const MIN_PITCH_HZ = 70;
const MAX_PITCH_HZ = 400;

function downsample(input, sourceRate) {
  if (sourceRate === TARGET_SAMPLE_RATE) return input;
  const ratio = sourceRate / TARGET_SAMPLE_RATE;
  const output = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < output.length; i += 1) {
    output[i] = input[Math.floor(i * ratio)] || 0;
  }
  return output;
}

function estimatePitch(frame) {
  let mean = 0;
  for (let i = 0; i < frame.length; i += 1) mean += frame[i];
  mean /= frame.length;

  let energy = 0;
  for (let i = 0; i < frame.length; i += 1) {
    const centered = frame[i] - mean;
    energy += centered * centered;
  }
  if (energy / frame.length < 0.000025) return null;

  const minLag = Math.floor(TARGET_SAMPLE_RATE / MAX_PITCH_HZ);
  const maxLag = Math.min(Math.floor(TARGET_SAMPLE_RATE / MIN_PITCH_HZ), frame.length - 2);
  let bestLag = -1;
  let bestCorrelation = 0.3;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let cross = 0;
    let leftEnergy = 0;
    let rightEnergy = 0;
    for (let i = 0; i < frame.length - lag; i += 1) {
      const left = frame[i] - mean;
      const right = frame[i + lag] - mean;
      cross += left * right;
      leftEnergy += left * left;
      rightEnergy += right * right;
    }
    const correlation = cross / Math.sqrt(leftEnergy * rightEnergy || 1);
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }
  return bestLag > 0 ? TARGET_SAMPLE_RATE / bestLag : null;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function standardDeviation(values, average = mean(values)) {
  if (!values.length || average === null) return null;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
}

export function analyzeVoiceSamples(samples, sourceRate) {
  const audio = downsample(samples, sourceRate);
  const frameSize = Math.floor(TARGET_SAMPLE_RATE * 0.04);
  const hopSize = Math.floor(TARGET_SAMPLE_RATE * 0.02);
  const pitchHz = [];
  const rmsValues = [];
  const timeline = [];

  for (let start = 0; start + frameSize <= audio.length; start += hopSize) {
    const frame = audio.subarray(start, start + frameSize);
    let squareSum = 0;
    for (let i = 0; i < frame.length; i += 1) squareSum += frame[i] * frame[i];
    const rms = Math.sqrt(squareSum / frame.length);
    const pitch = estimatePitch(frame);
    const elapsed = start / TARGET_SAMPLE_RATE;
    rmsValues.push(rms);
    if (pitch !== null) pitchHz.push(pitch);
    timeline.push({ elapsed_seconds: Number(elapsed.toFixed(3)), pitch_hz: pitch === null ? null : Number(pitch.toFixed(2)), rms: Number(rms.toFixed(5)) });
  }

  const pitchMean = mean(pitchHz);
  const pitchSd = standardDeviation(pitchHz, pitchMean);
  const rmsMean = mean(rmsValues);
  const rmsSd = standardDeviation(rmsValues, rmsMean);
  if (pitchHz.length < 8) {
    throw new Error('Not enough clear voiced audio was detected. Try again in a quiet room and sustain the vowel throughout the countdown.');
  }

  return {
    estimated_pitch_mean_hz: pitchMean,
    estimated_pitch_range_hz: Math.max(...pitchHz) - Math.min(...pitchHz),
    pitch_variation_sd_hz: pitchSd,
    pitch_variation_cv_percent: pitchMean ? (pitchSd / pitchMean) * 100 : null,
    rms_amplitude_variation_cv_percent: rmsMean ? (rmsSd / rmsMean) * 100 : null,
    voiced_analysis_windows: pitchHz.length,
    timeline,
    duration_seconds: audio.length / TARGET_SAMPLE_RATE,
  };
}

export function toVoiceCsv(metrics) {
  const columns = [
    'elapsed_seconds', 'estimated_pitch_hz', 'rms_amplitude', 'estimated_pitch_mean_hz',
    'estimated_pitch_range_hz', 'pitch_variation_sd_hz', 'pitch_variation_cv_percent',
    'rms_amplitude_variation_cv_percent', 'voiced_analysis_windows',
  ];
  const rows = metrics.timeline.map((point) => [
    point.elapsed_seconds, point.pitch_hz ?? '', point.rms,
    metrics.estimated_pitch_mean_hz, metrics.estimated_pitch_range_hz,
    metrics.pitch_variation_sd_hz, metrics.pitch_variation_cv_percent,
    metrics.rms_amplitude_variation_cv_percent, metrics.voiced_analysis_windows,
  ]);
  return [columns.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
