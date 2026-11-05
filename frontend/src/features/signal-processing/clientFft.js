/**
 * Client-side Signal Processing & FFT Engine for NeuroMotion AI
 * Handles uniform resampling, detrending, Hanning windowing,
 * discrete Fast Fourier Transform, and dominant peak identification in 3–12 Hz band.
 */

export function resampleToUniformGrid(timestampsMs, signal, targetFs = 30.0) {
  if (timestampsMs.length < 2) return { tUniform: [], sigUniform: [] };
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

    // Linear interpolation
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

export function detrendSignal(signal) {
  const n = signal.length;
  if (n === 0) return [];
  const mean = signal.reduce((a, b) => a + b, 0) / n;
  return signal.map(val => val - mean);
}

export function applyHanningWindow(signal) {
  const n = signal.length;
  return signal.map((val, idx) => {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * idx) / (n - 1)));
    return val * w;
  });
}

/**
 * Standard Radix-2 Cooley-Tukey FFT or DFT for arbitrary length
 */
export function computeFFT(signal, fs = 30.0) {
  const N = signal.length;
  if (N < 4) return { freqs: [], powers: [] };

  // Next power of 2
  let nPadded = 1;
  while (nPadded < N) nPadded <<= 1;

  const real = new Float64Array(nPadded);
  const imag = new Float64Array(nPadded);
  for (let i = 0; i < N; i++) real[i] = signal[i];

  // Bit reversal permutation
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

  // Butterfly updates
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

  // Single-sided amplitude spectrum up to Nyquist (fs / 2)
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

export function extractDominantFrequency(freqs, powers, fMin = 1.0, fMax = 12.0) {
  let maxP = -1;
  let domFreq = 0;
  for (let i = 0; i < freqs.length; i++) {
    if (freqs[i] >= fMin && freqs[i] <= fMax) {
      if (powers[i] > maxP) {
        maxP = powers[i];
        domFreq = freqs[i];
      }
    }
  }
  return { domFreq: Number(domFreq.toFixed(2)), peakPower: maxP > 0 ? maxP : 0 };
}

export function calculatePowerRatio(freqs, powers, lowHz = 4.0, highHz = 6.0) {
  let totalPower = 1e-9;
  let bandPower = 0;
  for (let i = 0; i < freqs.length; i++) {
    const pSq = powers[i] * powers[i];
    totalPower += pSq;
    if (freqs[i] >= lowHz && freqs[i] <= highHz) {
      bandPower += pSq;
    }
  }
  return Number((bandPower / totalPower).toFixed(4));
}

