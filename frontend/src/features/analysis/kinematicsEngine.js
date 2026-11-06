/**
 * In-browser Kinematics & Signal Analysis Engine (Pure TypeScript/JavaScript)
 * Fully replaces backend dependency for static browser deployment.
 * Supports:
 * - Tremor: Uniform resampling, detrending, Hanning window, discrete FFT, 4-6 Hz power ratio, Hilbert envelope approximation.
 * - Tapping: Anatomical scale normalization (Wrist-to-Middle MCP), low-pass smoothing, peak/trough cycle detection with hysteresis, cadence, interval CV variability, amplitude fatigue regression.
 */

export function resampleUniformGrid(timestampsMs, signal, targetFs = 30.0) {
  if (!timestampsMs || timestampsMs.length < 2) return { tUniform: [], sigUniform: [] };
  const t0 = timestampsMs[0];
  const tSec = timestampsMs.map(t => (t - t0) / 1000.0);
  const totalDuration = tSec[tSec.length - 1];
  const numSamples = Math.floor(totalDuration * targetFs);
  if (numSamples < 5) return { tUniform: tSec, sigUniform: signal };

  const tUniform = [];
  const sigUniform = [];
  const dt = totalDuration / (numSamples - 1);

  let srcIdx = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i * dt;
    tUniform.push(t);
    while (srcIdx < tSec.length - 1 && tSec[srcIdx + 1] < t) {
      srcIdx++;
    }
    if (srcIdx >= tSec.length - 1) {
      sigUniform.push(signal[signal.length - 1]);
    } else {
      const tA = tSec[srcIdx];
      const tB = tSec[srcIdx + 1];
      const valA = signal[srcIdx];
      const valB = signal[srcIdx + 1];
      const alpha = (t - tA) / (tB - tA || 1e-6);
      sigUniform.push(valA + alpha * (valB - valA));
    }
  }
  return { tUniform, sigUniform };
}

export function detrend(arr) {
  const n = arr.length;
  if (n === 0) return [];
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  return arr.map(v => v - mean);
}

export function movingAverage(arr, windowSize = 5) {
  const result = [];
  const half = Math.floor(windowSize / 2);
  for (let i = 0; i < arr.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(arr.length - 1, i + half); j++) {
      sum += arr[j];
      count++;
    }
    result.push(sum / count);
  }
  return result;
}

export function computeFFT(signal, fs = 30.0) {
  const N = signal.length;
  if (N < 4) return { freqs: [], powers: [] };

  let nPadded = 1;
  while (nPadded < N) nPadded <<= 1;

  const real = new Float64Array(nPadded);
  const imag = new Float64Array(nPadded);
  for (let i = 0; i < N; i++) real[i] = signal[i];

  let j = 0;
  for (let i = 0; i < nPadded - 1; i++) {
    if (i < j) {
      const tempR = real[i]; real[i] = real[j]; real[j] = tempR;
      const tempI = imag[i]; imag[i] = imag[j]; imag[j] = tempI;
    }
    let k = nPadded >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  for (let len = 2; len <= nPadded; len <<= 1) {
    const half = len >> 1;
    const angle = -2 * Math.PI / len;
    const wStepR = Math.cos(angle);
    const wStepI = Math.sin(angle);

    for (let i = 0; i < nPadded; i += len) {
      let wR = 1.0;
      let wI = 0.0;
      for (let k = 0; k < half; k++) {
        const uR = real[i + k];
        const uI = imag[i + k];
        const vR = real[i + k + half] * wR - imag[i + k + half] * wI;
        const vI = real[i + k + half] * wI + imag[i + k + half] * wR;

        real[i + k] = uR + vR;
        imag[i + k] = uI + vI;
        real[i + k + half] = uR - vR;
        imag[i + k + half] = uI - vI;

        const nextWR = wR * wStepR - wI * wStepI;
        const nextWI = wR * wStepI + wI * wStepR;
        wR = nextWR;
        wI = nextWI;
      }
    }
  }

  const numHalf = (nPadded / 2) + 1;
  const freqs = [];
  const powers = [];

  for (let i = 0; i < numHalf; i++) {
    const f = (i * fs) / nPadded;
    const mag = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) * (2.0 / N);
    freqs.push(f);
    powers.push(mag);
  }
  return { freqs, powers };
}

// Complete Tremor Pipeline
export function analyzeTremorKinematics(samples, targetFs = 30.0) {
  if (!samples || samples.length < 15) {
    return {
      status: "insufficient_data",
      quality: "Insufficient",
      quality_reason: "Recording duration was under 15 frames",
      effective_fps: 0,
      duration_seconds: 0,
      dominant_frequency_hz: 0,
      power_ratio_4_6hz: 0,
      rms_amplitude: 0,
      amplitude_slope: 0,
      frequency_spectrum: [],
      filtered_waveform: []
    };
  }

  const timestamps = samples.map(s => s.timestamp_ms);
  const durationSec = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000.0;
  const effectiveFps = samples.length / Math.max(0.1, durationSec);

  // Track missing landmarks explicitly for the shared recording-quality gate.
  const validLandmarkFrames = samples.filter((s) => Number.isFinite(s.landmarks?.[8]?.x) && Number.isFinite(s.landmarks?.[8]?.y)).length;
  const handPresenceFraction = validLandmarkFrames / samples.length;
  // Extract landmark 8 (Index fingertip); missing samples interpolate from neighbors below.
  const coords = samples.map(s => [s.landmarks?.[8]?.x ?? NaN, s.landmarks?.[8]?.y ?? NaN]);
  for (let axis = 0; axis < 2; axis += 1) {
    let last = 0;
    for (let i = 0; i < coords.length; i += 1) {
      if (Number.isFinite(coords[i][axis])) last = coords[i][axis];
      else coords[i][axis] = last;
    }
  }
  const meanX = coords.reduce((a, b) => a + b[0], 0) / coords.length;
  const meanY = coords.reduce((a, b) => a + b[1], 0) / coords.length;
  const centered = coords.map(c => [c[0] - meanX, c[1] - meanY]);

  // Project along principal axis to maintain true zero-crossing frequencies
  const disp1D = centered.map(c => c[0]);

  // Resample
  const { tUniform, sigUniform } = resampleUniformGrid(timestamps, disp1D, targetFs);
  const detrended = detrend(sigUniform);
  const filtered = movingAverage(detrended, 3);

  // Envelope calculation
  const absSig = filtered.map(Math.abs);
  const envelope = movingAverage(absSig, 7);

  // FFT
  const { freqs, powers } = computeFFT(filtered, targetFs);

  // Dominant Peak in 1–12 Hz
  let maxP = -1;
  let domFreq = 0;
  let totalPower = 1e-9;
  let bandPower = 0;

  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    const p = powers[i];
    const pSq = p * p;
    totalPower += pSq;
    if (f >= 4.0 && f <= 6.0) bandPower += pSq;
    if (f >= 1.0 && f <= 12.0 && p > maxP) {
      maxP = p;
      domFreq = f;
    }
  }

  const powerRatio = bandPower / totalPower;
  const rms = Math.sqrt(filtered.reduce((a, b) => a + b * b, 0) / (filtered.length || 1));

  // Amplitude linear slope
  let slope = 0;
  if (envelope.length > 5) {
    const n = envelope.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += envelope[i];
      sumXY += i * envelope[i];
      sumX2 += i * i;
    }
    slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  }

  const quality = effectiveFps >= 24 ? "Good" : effectiveFps >= 18 ? "Acceptable" : "Insufficient";

  return {
    status: "success",
    quality,
    effective_fps: Number(effectiveFps.toFixed(1)),
    sampling_rate_hz: Number(effectiveFps.toFixed(1)),
    hand_presence_fraction: Number(handPresenceFraction.toFixed(3)),
    duration_seconds: Number(durationSec.toFixed(2)),
    dominant_frequency_hz: Number(domFreq.toFixed(2)),
    power_ratio_4_6hz: Number(powerRatio.toFixed(3)),
    rms_amplitude: Number((rms * 100).toFixed(3)),
    amplitude_slope: Number((slope * 1000).toFixed(3)),
    frequency_spectrum: freqs.filter(f => f <= 15).map((f, i) => ({
      frequency_hz: Number(f.toFixed(1)),
      power: Number(powers[i].toFixed(4))
    })),
    filtered_waveform: tUniform.map((t, i) => ({
      time_sec: Number(t.toFixed(2)),
      raw_displacement: Number((sigUniform[i] * 100).toFixed(2)),
      filtered: Number((filtered[i] * 100).toFixed(2)),
      envelope: Number((envelope[i] * 100).toFixed(2))
    }))
  };
}

// Complete Finger-Tapping Kinematics Pipeline
export function analyzeFingerTappingKinematics(samples, calibrationThreshold = null, targetFs = 30.0) {
  if (!samples || samples.length < 15) {
    return {
      status: "insufficient_data",
      quality: "Insufficient",
      quality_reason: "Fewer than 15 recorded frames",
      total_taps: 0,
      effective_fps: 0,
      duration_seconds: 0,
      taps_per_second: 0,
      average_interval_sec: 0,
      interval_variability_cv: 0,
      average_amplitude: 0,
      amplitude_slope: 0,
      cycles: [],
      distance_timeseries: []
    };
  }

  const timestamps = samples.map(s => s.timestamp_ms);
  const durationSec = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000.0;
  const effectiveFps = samples.length / Math.max(0.1, durationSec);

  // Compute Thumb-Index Normalized Distance
  const normDistances = samples.map(s => {
    const lm = s.landmarks;
    if (lm && lm.length >= 10) {
      const thumb = lm[4];
      const index = lm[8];
      const wrist = lm[0];
      const mcp = lm[9];
      const d = Math.hypot(thumb.x - index.x, thumb.y - index.y);
      const scale = Math.hypot(wrist.x - mcp.x, wrist.y - mcp.y) || 1.0;
      return d / scale;
    }
    return 0;
  });
  const handPresenceFraction = samples.filter((s) => s.landmarks?.length >= 10
    && Number.isFinite(s.landmarks[4]?.x) && Number.isFinite(s.landmarks[8]?.x)
    && Number.isFinite(s.landmarks[0]?.x) && Number.isFinite(s.landmarks[9]?.x)).length / samples.length;

  const { tUniform, sigUniform } = resampleUniformGrid(timestamps, normDistances, targetFs);
  const smoothed = movingAverage(sigUniform, 3);

  // Peak and Trough Detection with Hysteresis
  const peaks = [];
  const minDistanceSamples = Math.floor(targetFs * 0.2); // ~200ms refractory
  const threshold = calibrationThreshold || (smoothed.reduce((a, b) => a + b, 0) / smoothed.length);

  for (let i = 2; i < smoothed.length - 2; i++) {
    if (
      smoothed[i] > smoothed[i - 1] &&
      smoothed[i] > smoothed[i - 2] &&
      smoothed[i] > smoothed[i + 1] &&
      smoothed[i] > smoothed[i + 2] &&
      smoothed[i] > threshold * 0.8
    ) {
      if (peaks.length === 0 || (i - peaks[peaks.length - 1]) >= minDistanceSamples) {
        peaks.push(i);
      }
    }
  }

  const totalTaps = peaks.length;
  const intervals = [];
  const peakAmps = [];
  const cycles = [];

  for (let i = 0; i < peaks.length; i++) {
    const pIdx = peaks[i];
    const t = tUniform[pIdx];
    const amp = smoothed[pIdx];
    peakAmps.push(amp);

    let interval = 0;
    if (i > 0) {
      interval = t - tUniform[peaks[i - 1]];
      intervals.push(interval);
    }

    cycles.push({
      tap_index: i + 1,
      time_sec: Number(t.toFixed(2)),
      interval_sec: Number(interval.toFixed(3)),
      normalized_amplitude: Number(amp.toFixed(3))
    });
  }

  const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  const tapsPerSec = totalTaps / Math.max(1.0, durationSec);

  // Coefficient of Variation
  let cv = 0;
  if (intervals.length >= 2 && avgInterval > 0) {
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    cv = (Math.sqrt(variance) / avgInterval) * 100;
  }

  const avgAmp = peakAmps.length > 0 ? peakAmps.reduce((a, b) => a + b, 0) / peakAmps.length : 0;

  // Linear Regression Slope for Amplitude Fatigue
  let ampSlope = 0;
  if (peakAmps.length >= 3) {
    const n = peakAmps.length;
    let sX = 0, sY = 0, sXY = 0, sX2 = 0;
    for (let i = 0; i < n; i++) {
      sX += i;
      sY += peakAmps[i];
      sXY += i * peakAmps[i];
      sX2 += i * i;
    }
    ampSlope = (n * sXY - sX * sY) / (n * sX2 - sX * sX || 1);
  }

  const quality = effectiveFps >= 24 ? "Good" : effectiveFps >= 18 ? "Acceptable" : "Insufficient";

  return {
    status: "success",
    quality,
    total_taps: totalTaps,
    effective_fps: Number(effectiveFps.toFixed(1)),
    hand_presence_fraction: Number(handPresenceFraction.toFixed(3)),
    duration_seconds: Number(durationSec.toFixed(2)),
    taps_per_second: Number(tapsPerSec.toFixed(2)),
    average_interval_sec: Number(avgInterval.toFixed(3)),
    interval_variability_cv: Number(cv.toFixed(1)),
    average_amplitude: Number(avgAmp.toFixed(3)),
    amplitude_slope: Number(ampSlope.toFixed(4)),
    cycles,
    distance_timeseries: tUniform.map((t, i) => ({
      time_sec: Number(t.toFixed(2)),
      raw_distance: Number(sigUniform[i].toFixed(3)),
      smoothed_distance: Number(smoothed[i].toFixed(3)),
      is_tap: peaks.includes(i) ? Number(smoothed[i].toFixed(3)) : null
    }))
  };
}

