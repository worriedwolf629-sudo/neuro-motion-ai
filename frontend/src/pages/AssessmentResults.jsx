import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceArea
} from 'recharts';
import {
  Activity,
  Radio,
  FileText
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <section className={`min-w-0 rounded-2xl card-flowing p-5 ${className}`}>
    <div className="mb-3">
      <h3 className="font-heading text-sm font-bold text-[#292820]">{title}</h3>
      {subtitle && <p className="mt-1 text-[11px] text-[#817D70]">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const TremorWaveform = ({ title, data }) => (
  <ChartCard title={title} subtitle="Finger displacement over time; raw, filtered and amplitude envelope signals." className="h-full">
    {data?.length ? (
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
            <XAxis dataKey="time_sec" stroke="#817D70" fontSize={9} tickFormatter={(v) => `${v}s`} />
            <YAxis stroke="#817D70" fontSize={9} />
            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: 8, fontSize: 10 }} />
            <Line type="monotone" dataKey="raw_displacement" stroke="#B1AA98" dot={false} strokeWidth={1} name="raw" />
            <Line type="monotone" dataKey="filtered" stroke="#E9BD4B" dot={false} strokeWidth={2} name="filtered" />
            <Line type="monotone" dataKey="envelope" stroke="#B8A8E8" strokeDasharray="4 3" dot={false} strokeWidth={1.5} name="envelope" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-[#EAE6D9] text-xs text-[#817D70]">This phase has not been recorded.</div>}
  </ChartCard>
);

const TremorSpectrum = ({ title, phase }) => (
  <ChartCard title={title} subtitle="FFT frequency spectrum with the 4–6 Hz reference band highlighted.">
    {phase?.frequency_spectrum?.length ? (
      <>
        <p className="mb-2 text-[11px] font-mono text-[#817D70]">Peak: {phase.dominant_frequency_hz} Hz · 4–6 Hz band</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={phase.frequency_spectrum} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
              <XAxis dataKey="frequency_hz" stroke="#817D70" fontSize={9} tickFormatter={(v) => `${v} Hz`} />
              <YAxis stroke="#817D70" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: 8, fontSize: 10 }} />
              <ReferenceArea x1={4} x2={6} stroke="#C66D5B" fill="#F4D66D" fillOpacity={0.28} />
              <Bar dataKey="power" fill="#E9BD4B" radius={[3, 3, 0, 0]} name="FFT amplitude" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>
    ) : <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-[#EAE6D9] text-xs text-[#817D70]">Spectrum is unavailable for this phase.</div>}
  </ChartCard>
);

export default function AssessmentResults({
  tremorData,
  tappingData,
  setActivePage
}) {
  const [activeTab, setActiveTab] = useState(tremorData ? 'tremor' : 'tapping');
  const phase1Data = tremorData?.phase1 || tremorData;
  const phase2Data = tremorData?.phase2 || null;
  const envelopeComparison = phase1Data?.filtered_waveform?.map((point, index) => ({
    time_sec: point.time_sec,
    rest_envelope: point.envelope,
    cognitive_envelope: phase2Data?.filtered_waveform?.[index]?.envelope
  })) || [];
  const cognitiveAmplification = tremorData?.cognitive_amplification ?? (
    phase2Data && phase1Data?.rms_amplitude > 0
      ? Number((phase2Data.rms_amplitude / phase1Data.rms_amplitude).toFixed(2))
      : null
  );

  return (
    <div className="relative p-8 space-y-8 max-w-6xl mx-auto overflow-hidden">
      {/* Subtle background ribbon accent */}
      <FlowingRibbon variant="subtle" className="opacity-25" />
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE6D9] pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#817D70] font-bold block mb-1">
            Motor Kinematics Analysis
          </span>
          <h2 className="text-2xl font-bold font-heading text-[#292820]">
            Motor Assessment Results
          </h2>
          <p className="text-xs text-[#817D70] mt-1">
            Detailed analytical decomposition of recorded hand movement kinematics and spectral harmonics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('report')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" /> Generate Motor Report
          </button>
        </div>
      </div>

      {/* Assessment Selector Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('tremor')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition ${
            activeTab === 'tremor'
              ? 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9] shadow-sm'
              : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-[#E9BD4B]" />
          Resting Tremor Kinematics
        </button>

        <button
          onClick={() => setActiveTab('tapping')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition ${
            activeTab === 'tapping'
              ? 'bg-[#FFFFFF] text-[#292820] border border-[#EAE6D9] shadow-sm'
              : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E6]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#E9BD4B]" />
          Finger-Tapping Dynamics
        </button>
      </div>

      {/* TREMOR ANALYTICAL VIEW */}
      {activeTab === 'tremor' && (
        <div className="space-y-6">
          {tremorData ? (
            <>
              <div className="flex flex-col gap-1 border-b border-[#EAE6D9] pb-4">
                <h2 className="font-heading text-lg font-bold text-[#292820]">ParkScreen | Hand Tremor Analysis Report</h2>
                <p className="text-xs text-[#817D70]">Measured displacement and frequency characteristics from the recorded rest and cognitive-load phases.</p>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <TremorWaveform title="Phase 1 (Rest) — Finger Displacement" data={phase1Data?.filtered_waveform} />
                <TremorWaveform title="Phase 2 (Cognitive Load) — Finger Displacement" data={phase2Data?.filtered_waveform} />

                <ChartCard
                  title="Amplitude Envelope Comparison"
                  subtitle={cognitiveAmplification == null ? 'Record both phases to compare amplitude envelopes.' : `Cognitive Amplification: ${cognitiveAmplification}x`}
                  className="h-full"
                >
                  {phase2Data && envelopeComparison.length ? (
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={envelopeComparison} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                          <XAxis dataKey="time_sec" stroke="#817D70" fontSize={9} tickFormatter={(v) => `${v}s`} />
                          <YAxis stroke="#817D70" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: 8, fontSize: 10 }} />
                          <Line type="monotone" dataKey="rest_envelope" stroke="#E9BD4B" dot={false} strokeWidth={2} name="Phase 1 (Rest)" />
                          <Line type="monotone" dataKey="cognitive_envelope" stroke="#C66D5B" dot={false} strokeWidth={2} name="Phase 2 (Cognitive)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-[#EAE6D9] text-center text-xs text-[#817D70]">Phase 2 has not been recorded yet.</div>}
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <TremorSpectrum title="FFT Spectrum — Phase 1" phase={phase1Data} />
                <TremorSpectrum title="FFT Spectrum — Phase 2" phase={phase2Data} />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ChartCard title="Phase 1 (Rest) — Measurements" subtitle={`Recording quality: ${phase1Data?.quality || 'Unavailable'} · Effective FPS: ${phase1Data?.effective_fps ?? 0}`}>
                  <dl className="grid grid-cols-2 gap-4 text-xs">
                    <div><dt className="text-[#817D70]">Peak frequency</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{phase1Data?.dominant_frequency_hz ?? 0} Hz</dd></div>
                    <div><dt className="text-[#817D70]">4–6 Hz band power</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{((phase1Data?.power_ratio_4_6hz || 0) * 100).toFixed(1)}%</dd></div>
                    <div><dt className="text-[#817D70]">RMS amplitude</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{phase1Data?.rms_amplitude ?? 0}</dd></div>
                    <div><dt className="text-[#817D70]">Duration</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{phase1Data?.duration_seconds ?? 0}s</dd></div>
                  </dl>
                </ChartCard>
                <ChartCard title="Phase 2 (Cognitive Load) — Measurements" subtitle={phase2Data ? `Recording quality: ${phase2Data.quality} · Effective FPS: ${phase2Data.effective_fps}` : 'Complete the cognitive-load phase to add its measurements.'}>
                  {phase2Data ? <dl className="grid grid-cols-2 gap-4 text-xs">
                    <div><dt className="text-[#817D70]">Peak frequency</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{phase2Data.dominant_frequency_hz} Hz</dd></div>
                    <div><dt className="text-[#817D70]">4–6 Hz band power</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{(phase2Data.power_ratio_4_6hz * 100).toFixed(1)}%</dd></div>
                    <div><dt className="text-[#817D70]">RMS amplitude</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{phase2Data.rms_amplitude}</dd></div>
                    <div><dt className="text-[#817D70]">Duration</dt><dd className="mt-1 font-mono font-bold text-[#292820]">{phase2Data.duration_seconds}s</dd></div>
                  </dl> : <div className="flex h-20 items-center text-xs text-[#817D70]">Only the rest phase is available in this saved session.</div>}
                </ChartCard>
              </div>

              <ChartCard
                title="Cognitive Load Response"
                subtitle="Measured Phase 2 RMS amplitude relative to Phase 1 (Rest). This is a signal comparison, not a class probability."
              >
                {phase2Data && cognitiveAmplification != null ? (
                  <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[1fr_auto]">
                    <div>
                      <div className="mb-2 flex justify-between text-[11px] text-[#817D70]">
                        <span>Phase 1 (Rest): <strong className="font-mono text-[#292820]">{phase1Data.rms_amplitude}</strong></span>
                        <span>Phase 2 (Cognitive Load): <strong className="font-mono text-[#292820]">{phase2Data.rms_amplitude}</strong></span>
                      </div>
                      <div className="relative h-3 overflow-hidden rounded-full border border-[#EAE6D9] bg-[#F5F1E6]" aria-label={`Cognitive amplification ${cognitiveAmplification} times`}>
                        <div className="h-full rounded-full bg-[#E9BD4B]" style={{ width: `${Math.min(100, Math.max(0, cognitiveAmplification / 2 * 100))}%` }} />
                        <span className="absolute inset-y-[-2px] left-1/2 border-l border-dashed border-[#817D70]" aria-hidden="true" />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-[#817D70]"><span>0×</span><span>1× baseline</span><span>2×</span></div>
                    </div>
                    <div className="rounded-xl border border-[#EAE6D9] bg-[#FFFFFF] px-5 py-3 text-center">
                      <div className="font-mono text-xl font-bold text-[#292820]">{cognitiveAmplification}×</div>
                      <div className="mt-1 text-[10px] text-[#817D70]">Phase 2 / Phase 1 RMS</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#817D70]">Record both phases to calculate a measured amplitude comparison.</p>
                )}
              </ChartCard>

              <p className="rounded-xl border border-[#EAE6D9] bg-[#FFFFFF] p-4 text-[11px] leading-relaxed text-[#817D70]">
                These plots show measured hand movement and signal-processing features only. They are not a Parkinson’s disease risk score or a medical diagnosis; no disease classifier is used.
              </p>
            </>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-12 text-center space-y-4">
              <Radio className="w-8 h-8 text-[#E9BD4B] mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-[#292820]">No Resting Tremor Recording Available</h3>
              <p className="text-xs text-[#817D70] max-w-md mx-auto">
                Launch the resting tremor protocol to capture index fingertip oscillations and generate FFT power spectra.
              </p>
              <button
                onClick={() => setActivePage('live-tremor')}
                className="px-5 py-2.5 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition"
              >
                Start Resting Tremor Test
              </button>
            </div>
          )}
        </div>
      )}

      {/* FINGER TAPPING ANALYTICAL VIEW */}
      {activeTab === 'tapping' && (
        <div className="space-y-6">
          {tappingData ? (
            <>
              {/* Graph 1: Thumb-Index Normalized Distance with Tap Markers */}
              <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#292820] font-heading">
                      Fingertip Distance Over Time ($D_{'{norm}'}$)
                    </h4>
                    <p className="text-[11px] text-[#817D70]">
                      Normalized by anatomical Wrist-to-MCP scale. Detected opening peaks marked.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF9F4] text-[#292820] border border-[#EAE6D9]">
                    {tappingData.total_taps} Completed Taps
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tappingData.distance_timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                      <XAxis dataKey="time_sec" stroke="#817D70" fontSize={10} tickFormatter={(v) => `${v}s`} />
                      <YAxis stroke="#817D70" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '10px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                      />
                      <Line type="monotone" dataKey="smoothed_distance" stroke="#292820" dot={false} strokeWidth={2} name="Smoothed Distance" />
                      <Line type="monotone" dataKey="is_tap" stroke="#75D5C7" strokeWidth={0} dot={{ r: 4, fill: '#75D5C7' }} name="Tap Peak" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Middle Row: Interval Regularity & Amplitude Fatigue Over Time */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interval Regularity */}
                <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#292820] font-heading">Inter-Tap Interval Stability</h4>
                      <p className="text-[11px] text-[#817D70]">Cycle-to-cycle timing variability (CV%)</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#292820] bg-[#FAF9F4] px-2.5 py-1 rounded-lg border border-[#EAE6D9]">
                      CV: {tappingData.interval_variability_cv}%
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tappingData.cycles} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                        <XAxis dataKey="tap_index" stroke="#817D70" fontSize={10} tickFormatter={(v) => `#${v}`} />
                        <YAxis stroke="#817D70" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '8px', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="interval_sec" stroke="#75D5C7" strokeWidth={2} dot={{ r: 3, fill: '#75D5C7' }} name="Interval (s)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Amplitude Fatigue Decay */}
                <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#292820] font-heading">Amplitude Progression & Fatigue</h4>
                      <p className="text-[11px] text-[#817D70]">Linear regression of peak aperture decrement</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#292820] bg-[#FAF9F4] px-2.5 py-1 rounded-lg border border-[#EAE6D9]">
                      Slope: {tappingData.amplitude_slope}
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tappingData.cycles} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                        <XAxis dataKey="tap_index" stroke="#817D70" fontSize={10} tickFormatter={(v) => `#${v}`} />
                        <YAxis stroke="#817D70" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '8px', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="normalized_amplitude" stroke="#B8A8E8" strokeWidth={2} dot={{ r: 3, fill: '#B8A8E8' }} name="Peak Amplitude" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Tapping Metrics Table */}
              <div className="bg-[#FAF9F4] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-[#817D70] uppercase font-mono tracking-wider mb-4">
                  Tapping Kinematics Telemetry
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#817D70] block text-[11px]">Total Taps:</span>
                    <span className="font-mono text-base font-bold text-[#292820]">{tappingData.total_taps}</span>
                  </div>
                  <div>
                    <span className="text-[#817D70] block text-[11px]">Cadence:</span>
                    <span className="font-mono text-base font-bold text-[#292820]">{tappingData.taps_per_second} taps/s</span>
                  </div>
                  <div>
                    <span className="text-[#817D70] block text-[11px]">Mean Interval:</span>
                    <span className="font-mono text-base font-bold text-[#292820]">{tappingData.average_interval_sec}s</span>
                  </div>
                  <div>
                    <span className="text-[#817D70] block text-[11px]">Mean Amplitude:</span>
                    <span className="font-mono text-base font-bold text-[#292820]">{tappingData.average_amplitude}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-12 text-center space-y-4">
              <Activity className="w-8 h-8 text-[#E9BD4B] mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-[#292820]">No Finger-Tapping Recording Available</h3>
              <p className="text-xs text-[#817D70] max-w-md mx-auto">
                Launch the finger-tapping protocol to record thumb-index cadence and rhythm stability.
              </p>
              <button
                onClick={() => setActivePage('live-tapping')}
                className="px-5 py-2.5 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition"
              >
                Start Finger Tapping Test
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

