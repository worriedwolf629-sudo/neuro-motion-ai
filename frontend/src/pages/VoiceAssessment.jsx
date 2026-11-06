import React, { useEffect, useRef, useState } from 'react';
import { Activity, Download, Mic, MicOff, RotateCcw, ShieldCheck } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyzeVoiceSamples, toVoiceCsv } from '../features/voice/voiceFeatures';
import FlowingRibbon from '../components/FlowingRibbon';
import ScreeningSummary from '../components/ScreeningSummary';
import { evaluateScreeningTriage } from '../features/analysis/screeningTriage.js';

const CAPTURE_SECONDS = 5;
const format = (value, digits = 2) => Number.isFinite(value) ? value.toFixed(digits) : '—';

export default function VoiceAssessment({ onAssessmentCompleted, screeningContext = {} }) {
  const [status, setStatus] = useState('ready');
  const [remaining, setRemaining] = useState(CAPTURE_SECONDS);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  const releaseMicrophone = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => {
    window.clearInterval(timerRef.current);
    releaseMicrophone();
  }, []);

  const startCapture = async () => {
    setError('');
    setMetrics(null);
    setRemaining(CAPTURE_SECONDS);
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error('This browser does not support microphone recording. Try a recent version of Chrome, Safari, or Firefox over HTTPS or localhost.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { autoGainControl: false, noiseSuppression: false, echoCancellation: false } });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => {
        releaseMicrophone();
        setStatus('ready');
        setError('The browser could not record from the selected microphone. Check its permission and try again.');
      };
      recorder.onstop = async () => {
        releaseMicrophone();
        recorderRef.current = null;
        window.clearInterval(timerRef.current);
        setStatus('processing');
        let audioContext;
        let decoded;
        let encodedAudio;
        try {
          let blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          encodedAudio = await blob.arrayBuffer();
          blob = null;
          chunks.length = 0;
          audioContext = new AudioContext();
          decoded = await audioContext.decodeAudioData(encodedAudio);
          const channel = decoded.getChannelData(0);
          const analyzed = analyzeVoiceSamples(channel, decoded.sampleRate);
          channel.fill(0);
          new Uint8Array(encodedAudio).fill(0);
          const screening = evaluateScreeningTriage({
            tremor: screeningContext.tremorData,
            tapping: screeningContext.tappingData,
            voice: analyzed,
          });
          const voiceQuality = screening.modalities.find((modality) => modality.modality === 'voice').quality;
          const result = {
            ...analyzed,
            quality: voiceQuality.ok ? 'Good' : 'Insufficient',
            quality_reasons: voiceQuality.reasons,
            screening,
          };
          setMetrics(result);
          onAssessmentCompleted?.('voice', result);
          setStatus('complete');
        } catch (captureError) {
          setStatus('ready');
          setError(captureError.message || 'The audio could not be analyzed. Please try another recording.');
        } finally {
          chunks.length = 0;
          if (decoded && decoded.numberOfChannels > 0) decoded.getChannelData(0).fill(0);
          if (encodedAudio) new Uint8Array(encodedAudio).fill(0);
          recorder.ondataavailable = null;
          recorder.onstop = null;
          if (audioContext && audioContext.state !== 'closed') await audioContext.close();
        }
      };
      recorder.start();
      setStatus('recording');
      const startTime = performance.now();
      timerRef.current = window.setInterval(() => {
        const secondsLeft = Math.max(0, CAPTURE_SECONDS - (performance.now() - startTime) / 1000);
        setRemaining(secondsLeft);
        if (secondsLeft <= 0 && recorder.state === 'recording') recorder.stop();
      }, 50);
    } catch (captureError) {
      releaseMicrophone();
      setStatus('ready');
      setError(captureError.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Allow microphone access in your browser settings and try again.'
        : captureError.message || 'Could not start microphone capture.');
    }
  };

  const stopCapture = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const downloadCsv = () => {
    if (!metrics) return;
    const blob = new Blob([toVoiceCsv(metrics)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neuromotion-voice-metrics-${new Date().toISOString().replaceAll(':', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative p-6 sm:p-8 space-y-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background Flowing Ribbon layer */}
      <FlowingRibbon position="full" opacity={0.75} className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#817D70] font-bold">Exploratory acoustic measurement</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#292820] tracking-tight">Voice Signal Assessment</h2>
        <p className="text-sm text-[#817D70] mt-1">Sustain a comfortable “ah” sound for five seconds. Keep the microphone at a steady distance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 card-flowing rounded-3xl p-6 space-y-5 relative z-10 bg-white/95">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F4] border border-[#EAE6D9] flex items-center justify-center">
            {status === 'recording' ? <Mic className="w-5 h-5 text-[#D99A38] animate-pulse" /> : <MicOff className="w-5 h-5 text-[#817D70]" />}
          </div>
          <div>
            <p className="text-sm font-bold text-[#292820]">{status === 'recording' ? 'Recording in progress' : status === 'processing' ? 'Analyzing locally…' : status === 'complete' ? 'Recording analyzed on this device' : 'Ready when you are'}</p>
            <p className="text-xs text-[#817D70] mt-1">{status === 'recording' ? `${remaining.toFixed(1)} seconds remaining` : 'Quiet room • comfortable volume • steady vowel'}</p>
          </div>
          {status === 'recording' && <div className="h-2 bg-[#F5F1E6] rounded-full overflow-hidden"><div className="h-full bg-[#E9BD4B] transition-all" style={{ width: `${((CAPTURE_SECONDS - remaining) / CAPTURE_SECONDS) * 100}%` }} /></div>}
          {status === 'recording' ? (
            <button onClick={stopCapture} className="w-full px-5 py-3 rounded-full bg-[#C66D5B] text-white text-sm font-bold shadow-xs active:scale-95 transition">Stop recording</button>
          ) : (
            <button onClick={startCapture} disabled={status === 'processing'} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 disabled:opacity-60 text-[#292820] text-sm font-bold border border-[#E9BD4B] shadow-xs hover:shadow transition active:scale-95">
              {status === 'complete' ? <RotateCcw className="w-4 h-4" /> : <Mic className="w-4 h-4" />}{status === 'complete' ? 'Record again' : 'Record 5 seconds'}
            </button>
          )}
          {error && <p role="alert" className="text-xs text-[#B55C4A] leading-relaxed">{error}</p>}
          <div className="flex gap-2 border-t border-[#EAE6D9] pt-4 text-xs text-[#817D70] leading-relaxed"><ShieldCheck className="w-4 h-4 shrink-0 text-[#789879]" /><p>Audio is analyzed in this browser, then discarded. No audio is uploaded or retained by this feature.</p></div>
        </section>

        <section className="lg:col-span-8 card-flowing rounded-3xl p-6 relative z-10 bg-white/95">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-base font-bold text-[#292820]">Pitch over time</h3><p className="text-xs text-[#817D70]">Estimated fundamental frequency • Hz</p></div>
            {metrics && <button onClick={downloadCsv} className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border border-[#EAE6D9] hover:bg-[#FAF9F4] transition shadow-xs"><Download className="w-3.5 h-3.5" />Download CSV</button>}
          </div>
          <div className="h-64">
            {metrics ? <ResponsiveContainer width="100%" height="100%"><LineChart data={metrics.timeline} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#EAE6D9" strokeDasharray="3 3" />
              <XAxis dataKey="elapsed_seconds" type="number" domain={[0, 5]} tick={{ fontSize: 11 }} label={{ value: 'Elapsed seconds', position: 'insideBottom', offset: -2, fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} label={{ value: 'Hz', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value} Hz`, 'Estimated pitch']} labelFormatter={(value) => `${value}s`} />
              <Line type="monotone" dataKey="pitch_hz" name="Estimated pitch" stroke="#75D5C7" strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />
            </LineChart></ResponsiveContainer> : <div className="h-full rounded-xl bg-[#FAF9F4] border border-[#EAE6D9] flex flex-col items-center justify-center text-center px-6"><Activity className="w-7 h-7 text-[#C4BEAD] mb-2" /><p className="text-sm font-semibold text-[#817D70]">Your measured signal will appear here</p><p className="text-xs text-[#817D70] mt-1">No sample or simulated values are shown.</p></div>}
          </div>
        </section>
      </div>

      {metrics && <section className="bg-white border border-[#EAE6D9] rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-5"><div><h3 className="text-base font-bold text-[#292820]">Measured features</h3><p className="text-xs text-[#817D70]">Descriptive estimates from this recording only</p></div><div className="flex flex-wrap justify-end gap-2"><span className="text-[10px] font-mono uppercase tracking-wider text-[#817D70] bg-[#FAF9F4] border border-[#EAE6D9] rounded-full px-3 py-1">{metrics.voiced_analysis_windows} voiced windows</span><span className={`text-[10px] font-mono uppercase tracking-wider ${metrics.quality === 'Good' ? 'text-[#39734A]' : 'text-[#A64E3E]'} bg-[#FAF9F4] border border-[#EAE6D9] rounded-full px-3 py-1`}>Quality: {metrics.quality}</span></div></div>
        {metrics.quality_reasons?.length > 0 && <p className="mb-4 rounded-lg border border-[#E9BD4B] bg-[#FFFDF5] p-3 text-xs text-[#817D70]">Uncertain: re-test. {metrics.quality_reasons.join(' ')}</p>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Estimated pitch mean', `${format(metrics.estimated_pitch_mean_hz)} Hz`],
            ['Estimated pitch range', `${format(metrics.estimated_pitch_range_hz)} Hz`],
            ['Pitch variation (SD)', `${format(metrics.pitch_variation_sd_hz)} Hz`],
            ['Pitch variation (CV)', `${format(metrics.pitch_variation_cv_percent)}%`],
            ['RMS amplitude variation (CV)', `${format(metrics.rms_amplitude_variation_cv_percent)}%`],
            ['Jitter (local)', `${format(metrics.jitter_local_percent, 3)}%`],
            ['Shimmer (local)', `${format(metrics.shimmer_local_percent, 3)}%`],
            ['HNR (autocorrelation estimate)', `${format(metrics.hnr_db)} dB`],
            ['Voiced fraction', `${format(metrics.voiced_fraction * 100, 1)}%`],
          ].map(([label, value]) => <div key={label} className="bg-[#FAF9F4] rounded-xl border border-[#EAE6D9] p-4"><p className="text-[11px] text-[#817D70]">{label}</p><p className="text-lg font-bold text-[#292820] mt-1">{value}</p></div>)}
        </div>
        <ScreeningSummary voice={metrics} />
        <div className="mt-5 rounded-xl border border-[#D99A38] bg-[#FAF9F4] px-4 py-3 text-xs leading-relaxed text-[#817D70]"><strong className="text-[#292820]">Research prototype, not a diagnosis.</strong> These microphone measurements do not determine whether someone has Parkinson’s disease and should not be used to make medical decisions. Results depend on the microphone, room noise, speaking task, and recording quality.</div>
      </section>}
    </div>
  );
}
