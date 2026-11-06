import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeFingerTappingKinematics, analyzeTremorKinematics } from './kinematicsEngine.js';
import { checkTappingQuality, checkTremorQuality, checkVoiceQuality } from './qualityGate.js';
import { evaluateScreeningTriage } from './screeningTriage.js';
import { analyzeVoiceSamples } from '../voice/voiceFeatures.js';

function handSample(timestamp, indexX, gap = 0.06) {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  landmarks[0] = { x: 0.5, y: 0.8, z: 0 };
  landmarks[4] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[8] = { x: indexX ?? 0.5 + gap, y: 0.5, z: 0 };
  landmarks[9] = { x: 0.5, y: 0.6, z: 0 };
  return { timestamp_ms: timestamp, landmarks };
}

test('synthetic 5 Hz hand displacement returns a peak near 5 Hz', () => {
  const samples = Array.from({ length: 180 }, (_, i) => {
    const t = i / 30;
    return handSample(t * 1000, 0.5 + 0.01 * Math.sin(2 * Math.PI * 5 * t));
  });
  const result = analyzeTremorKinematics(samples);
  assert.equal(result.status, 'success');
  assert.ok(Math.abs(result.dominant_frequency_hz - 5) <= 0.35, `got ${result.dominant_frequency_hz} Hz`);
  assert.equal(checkTremorQuality(result).ok, true);
});

test('synthetic tapping stream recovers cycles and a declining amplitude trend', () => {
  const samples = Array.from({ length: 300 }, (_, i) => {
    const t = i / 30;
    const amplitude = 0.055 * (1 - 0.25 * t / 10);
    const distance = 0.07 + amplitude * Math.sin(2 * Math.PI * 2 * t);
    return handSample(i * 10000 / 299, 0.5 + distance * 0.2);
  });
  const result = analyzeFingerTappingKinematics(samples);
  assert.ok(result.total_taps >= 15 && result.total_taps <= 21, `got ${result.total_taps} taps`);
  assert.ok(Math.abs(result.taps_per_second - 2) < 0.25, `got ${result.taps_per_second} taps/s`);
  assert.ok(result.interval_variability_cv < 5, `expected low known interval CV, got ${result.interval_variability_cv}%`);
  assert.ok(result.amplitude_slope < 0, `expected a negative decrement slope, got ${result.amplitude_slope}`);
  assert.equal(checkTappingQuality(result).ok, true);
});

test('synthetic sustained vowel returns pitch, jitter, shimmer and finite HNR', () => {
  const sampleRate = 12000;
  const seconds = 5;
  const audio = new Float32Array(sampleRate * seconds);
  const periodSamples = [60, 61, 60, 59]; // expected local jitter: 1/60 * 100 = 1.67%
  const cycleAmplitudes = [0.3, 0.315, 0.3, 0.285]; // expected local shimmer: 0.015/0.3 * 100 = 5%
  let sample = 0;
  let cycle = 0;
  while (sample < audio.length) {
    const period = periodSamples[cycle % periodSamples.length];
    const amplitude = cycleAmplitudes[cycle % cycleAmplitudes.length];
    for (let offset = 0; offset < period && sample < audio.length; offset += 1, sample += 1) {
      audio[sample] = amplitude * Math.sin(2 * Math.PI * offset / period);
    }
    cycle += 1;
  }
  const result = analyzeVoiceSamples(audio, sampleRate);
  assert.ok(Math.abs(result.estimated_pitch_mean_hz - 200) < 12);
  assert.ok(Math.abs(result.jitter_local_percent - 1.67) < 0.2, `got ${result.jitter_local_percent}% jitter`);
  assert.ok(Math.abs(result.shimmer_local_percent - 5) < 0.5, `got ${result.shimmer_local_percent}% shimmer`);
  assert.ok(Number.isFinite(result.hnr_db));
  assert.ok(result.voiced_fraction > 0.6);
  assert.equal(checkVoiceQuality(result).ok, true);
});

test('quality gates report Nyquist, hand-tracking, and minimum-tap failures', () => {
  const tremorGate = checkTremorQuality({ status: 'success', duration_seconds: 4, effective_fps: 23, sampling_rate_hz: 23, hand_presence_fraction: 0.7 });
  assert.equal(tremorGate.ok, false);
  assert.ok(tremorGate.reasons.some((reason) => reason.includes('Nyquist')));
  assert.ok(tremorGate.reasons.some((reason) => reason.includes('hand')));
  const tappingGate = checkTappingQuality({ status: 'success', duration_seconds: 10, effective_fps: 30, hand_presence_fraction: 1, total_taps: 14 });
  assert.ok(tappingGate.reasons.some((reason) => reason.includes('15 complete taps')));
});

test('screening excludes failed modalities and counts quality-passing domains', () => {
  const triage = evaluateScreeningTriage({
    tremor: { status: 'insufficient_data' },
    tapping: { status: 'success', duration_seconds: 10, effective_fps: 30, hand_presence_fraction: 1, total_taps: 18, taps_per_second: 2.3, interval_variability_cv: 8, amplitude_slope: 0 },
    voice: { duration_seconds: 5, voiced_fraction: 0.9, jitter_local_percent: 0.4, shimmer_local_percent: 2, hnr_db: 28 },
  });
  assert.equal(triage.tier, 'WITHIN_TYPICAL_RANGE');
  assert.equal(triage.modalities.find((item) => item.modality === 'tremor').quality.ok, false);
  assert.equal(triage.domainCount, '0 of 2 domains outside provisional reference range');
});

test('triage counts elevated modalities rather than multiple flags within one modality', () => {
  const tremor = { status: 'success', duration_seconds: 5, effective_fps: 30, sampling_rate_hz: 30, hand_presence_fraction: 1, dominant_frequency_hz: 10, power_ratio_4_6hz: 0.4 };
  const tapping = { status: 'success', duration_seconds: 10, effective_fps: 30, hand_presence_fraction: 1, total_taps: 18, taps_per_second: 4, interval_variability_cv: 10, amplitude_slope: 0 };
  const voice = { duration_seconds: 5, voiced_fraction: 0.9, jitter_local_percent: 0.4, shimmer_local_percent: 2, hnr_db: 28 };
  const oneElevatedDomain = evaluateScreeningTriage({ tremor, tapping, voice });
  assert.equal(oneElevatedDomain.tier, 'BORDERLINE_RETEST');
  assert.equal(oneElevatedDomain.modalities.find((item) => item.modality === 'tremor').severity, 'elevated');
  const twoElevatedDomains = evaluateScreeningTriage({ tremor, tapping: { ...tapping, taps_per_second: 7 }, voice });
  assert.equal(twoElevatedDomains.tier, 'SUGGEST_NEUROLOGIST_FOLLOWUP');
  const oneBorderlineDomain = evaluateScreeningTriage({ tremor: { ...tremor, dominant_frequency_hz: 8.1 }, tapping, voice });
  assert.equal(oneBorderlineDomain.tier, 'BORDERLINE_RETEST');
});
