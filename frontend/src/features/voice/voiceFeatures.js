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
  const correlations = [];
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
    correlations.push(correlation);
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }
  // Prefer the first strong autocorrelation peak (the fundamental period),
  // avoiding octave errors where the second harmonic has a larger peak.
  for (let index = 1; index < correlations.length - 1; index += 1) {
    const correlation = correlations[index];
    if (correlation >= 0.6 && correlation >= correlations[index - 1] && correlation > correlations[index + 1]) {
      const lag = minLag + index;
      return { pitchHz: TARGET_SAMPLE_RATE / lag, lag, correlation };
    }
  }
  return bestLag > 0 ? { pitchHz: TARGET_SAMPLE_RATE / bestLag, lag: bestLag, correlation: bestCorrelation } : null;
}

function cyclePeakAmplitudes(frame, periodSamples) {
  const amplitudes = [];
  for (let start = 0; start + periodSamples <= frame.length; start += periodSamples) {
    let peak = 0;
    const end = Math.min(frame.length, Math.round(start + periodSamples));
    for (let i = start; i < end; i += 1) peak = Math.max(peak, Math.abs(frame[i]));
    if (peak > 0) amplitudes.push(peak);
  }
  return amplitudes;
}

function extractCycleMeasurements(audio) {
  const dc = mean(audio);
  const crossings = [];
  for (let i = 1; i < audio.length; i += 1) {
    const left = audio[i - 1] - dc;
    const right = audio[i] - dc;
    if (left <= 0 && right > 0) crossings.push(i - 1 + (-left / (right - left || 1)));
  }
  const periods = [];
  const amplitudes = [];
  const minPeriod = TARGET_SAMPLE_RATE / MAX_PITCH_HZ;
  const maxPeriod = TARGET_SAMPLE_RATE / MIN_PITCH_HZ;
  for (let crossingIndex = 1; crossingIndex < crossings.length; crossingIndex += 1) {
    const start = crossings[crossingIndex - 1];
    const end = crossings[crossingIndex];
    const period = end - start;
    if (period < minPeriod || period > maxPeriod) continue;
    let peak = 0;
    for (let i = Math.floor(start); i < Math.min(audio.length, Math.ceil(end)); i += 1) {
      peak = Math.max(peak, Math.abs(audio[i] - dc));
    }
    periods.push(period);
    amplitudes.push(peak);
  }
  return { periods, amplitudes };
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function standardDeviation(values, average = mean(values)) {
  if (!values.length || average === null) return null;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
}

export function analyzeVoiceSamples(samples, sourceRate) {
  if (!samples?.length || !Number.isFinite(sourceRate) || sourceRate <= 0) {
    throw new Error('A valid microphone recording is required.');
  }
  const audio = downsample(samples, sourceRate);
  const frameSize = Math.floor(TARGET_SAMPLE_RATE * 0.04);
  const hopSize = Math.floor(TARGET_SAMPLE_RATE * 0.02);
  const pitchHz = [];
  const periodsSamples = [];
  const cycleAmplitudes = [];
  const hnrValues = [];
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
    if (pitch !== null) {
      pitchHz.push(pitch.pitchHz);
      periodsSamples.push(pitch.lag);
      const r = Math.min(0.9999, Math.max(0.0001, pitch.correlation));
      hnrValues.push(10 * Math.log10(r / (1 - r)));
      // Use non-overlapping analysis frames for cycle amplitudes so the 50%
      // pitch-frame overlap does not duplicate each acoustic peak.
      if (Math.round(start / hopSize) % 2 === 0) cycleAmplitudes.push(...cyclePeakAmplitudes(frame, pitch.lag));
    }
    timeline.push({ elapsed_seconds: Number(elapsed.toFixed(3)), pitch_hz: pitch === null ? null : Number(pitch.pitchHz.toFixed(2)), rms: Number(rms.toFixed(5)) });
  }

  const pitchMean = mean(pitchHz);
  const pitchSd = standardDeviation(pitchHz, pitchMean);
  const rmsMean = mean(rmsValues);
  const rmsSd = standardDeviation(rmsValues, rmsMean);
  if (pitchHz.length < 8) {
    throw new Error('Not enough clear voiced audio was detected. Try again in a quiet room and sustain the vowel throughout the countdown.');
  }

  const cycles = extractCycleMeasurements(audio);
  const periodSeries = cycles.periods.length > 8 ? cycles.periods : periodsSamples;
  const amplitudeSeries = cycles.amplitudes.length > 8 ? cycles.amplitudes : cycleAmplitudes;
  const periodsSeconds = periodSeries.map((period) => period / TARGET_SAMPLE_RATE);
  const meanPeriod = mean(periodsSeconds);
  const jitterLocalPercent = periodsSeconds.length > 1 && meanPeriod
    ? periodsSeconds.slice(1).reduce((sum, period, index) => sum + Math.abs(period - periodsSeconds[index]), 0) / (periodsSeconds.length - 1) / meanPeriod * 100
    : null;
  const meanCycleAmplitude = mean(amplitudeSeries);
  const shimmerLocalPercent = amplitudeSeries.length > 1 && meanCycleAmplitude
    ? amplitudeSeries.slice(1).reduce((sum, amplitude, index) => sum + Math.abs(amplitude - amplitudeSeries[index]), 0) / (amplitudeSeries.length - 1) / meanCycleAmplitude * 100
    : null;
  const correlationHnr = mean(hnrValues);

  return {
    estimated_pitch_mean_hz: pitchMean,
    estimated_pitch_range_hz: Math.max(...pitchHz) - Math.min(...pitchHz),
    pitch_variation_sd_hz: pitchSd,
    pitch_variation_cv_percent: pitchMean ? (pitchSd / pitchMean) * 100 : null,
    rms_amplitude_variation_cv_percent: rmsMean ? (rmsSd / rmsMean) * 100 : null,
    voiced_analysis_windows: pitchHz.length,
    total_analysis_windows: timeline.length,
    voiced_fraction: timeline.length ? pitchHz.length / timeline.length : 0,
    jitter_local_percent: jitterLocalPercent,
    shimmer_local_percent: shimmerLocalPercent,
    hnr_db: correlationHnr,
    measured_voice_cycles: cycles.periods.length,
    hnr_method: 'mean normalized autocorrelation peak; experimental approximation, not Praat-equivalent',
    timeline,
    duration_seconds: audio.length / TARGET_SAMPLE_RATE,
  };
}

export function toVoiceCsv(metrics) {
  const columns = [
    'elapsed_seconds', 'estimated_pitch_hz', 'rms_amplitude', 'estimated_pitch_mean_hz',
    'estimated_pitch_range_hz', 'pitch_variation_sd_hz', 'pitch_variation_cv_percent',
    'rms_amplitude_variation_cv_percent', 'voiced_analysis_windows', 'total_analysis_windows',
    'voiced_fraction', 'jitter_local_percent', 'shimmer_local_percent', 'hnr_db',
    'recording_quality', 'quality_reasons', 'screening_tier', 'screening_flags',
  ];
  const rows = metrics.timeline.map((point) => [
    point.elapsed_seconds, point.pitch_hz ?? '', point.rms,
    metrics.estimated_pitch_mean_hz, metrics.estimated_pitch_range_hz,
    metrics.pitch_variation_sd_hz, metrics.pitch_variation_cv_percent,
    metrics.rms_amplitude_variation_cv_percent, metrics.voiced_analysis_windows, metrics.total_analysis_windows,
    metrics.voiced_fraction, metrics.jitter_local_percent, metrics.shimmer_local_percent, metrics.hnr_db,
    metrics.quality || '', JSON.stringify(metrics.quality_reasons || []),
    metrics.screening?.tier || '', JSON.stringify(metrics.screening?.flags || []),
  ]);
  const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [columns, ...rows].map((row) => row.map(cell).join(',')).join('\n');
}
