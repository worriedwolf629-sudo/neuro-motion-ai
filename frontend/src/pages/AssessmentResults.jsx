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
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export default function AssessmentResults({
  tremorData,
  tappingData,
  setActivePage
}) {
  const [activeTab, setActiveTab] = useState(tremorData ? 'tremor' : 'tapping');

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
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

      {/* TREMOR ANALYTICAL VIEW (Faithfully modeled after ParkScreen reference layout) */}
      {activeTab === 'tremor' && (
        <div className="space-y-6">
          {tremorData ? (
            <>
              {/* Top Row: Displacement & Envelope Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Graph 1: Phase 1 Finger Displacement (Raw, Filtered, Envelope) */}
                <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#292820] font-heading">
                        Phase 1 (Rest) — Finger Displacement
                      </h4>
                      <p className="text-[11px] text-[#817D70]">
                        Normalized index fingertip deviation along principal oscillation axis
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 text-[#817D70]">
                        <span className="w-2.5 h-0.5 bg-[#817D70]" /> Raw
                      </span>
                      <span className="flex items-center gap-1.5 text-[#292820] font-bold">
                        <span className="w-2.5 h-1 bg-[#292820]" /> Filtered
                      </span>
                      <span className="flex items-center gap-1.5 text-[#C66D5B] font-bold">
                        <span className="w-2.5 h-0.5 border-t border-dashed border-[#C66D5B]" /> Envelope
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tremorData.filtered_waveform} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                        <XAxis dataKey="time_sec" stroke="#817D70" fontSize={10} tickFormatter={(v) => `${v}s`} />
                        <YAxis stroke="#817D70" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '10px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                        />
                        <Line type="monotone" dataKey="raw_displacement" stroke="#D8D2C2" dot={false} strokeWidth={1} name="Raw" />
                        <Line type="monotone" dataKey="filtered" stroke="#292820" dot={false} strokeWidth={2} name="Filtered" />
                        <Line type="monotone" dataKey="envelope" stroke="#C66D5B" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="Envelope" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Graph 2 / Right: Amplitude Envelope & Decay Metric */}
                <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#292820] font-heading mb-1">
                      Amplitude Envelope Overview
                    </h4>
                    <p className="text-[11px] text-[#817D70] mb-4">
                      Oscillation stability & amplitude regression slope
                    </p>

                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={tremorData.filtered_waveform} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                          <XAxis dataKey="time_sec" stroke="#817D70" fontSize={9} tickFormatter={(v) => `${v}s`} />
                          <YAxis stroke="#817D70" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '8px', fontSize: '10px' }} />
                          <Line type="monotone" dataKey="envelope" stroke="#E9BD4B" strokeWidth={2} dot={false} name="RMS Envelope" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EAE6D9] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#817D70]">Envelope Slope:</span>
                      <span className="font-mono font-bold text-[#292820]">{tremorData.amplitude_slope}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#817D70]">RMS Magnitude:</span>
                      <span className="font-mono font-bold text-[#292820]">{tremorData.rms_amplitude}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: FFT Power Spectrum (ParkScreen style with 4-6 Hz band highlighted) */}
              <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#292820] font-heading">
                      FFT Spectrum — Spectral Power Distribution
                    </h4>
                    <p className="text-[11px] text-[#817D70]">
                      Discrete Fourier Transform with highlighted physiological tremor band (4.0–6.0 Hz)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF9F4] text-[#292820] border border-[#EAE6D9]">
                      Dominant Peak: {tremorData.dominant_frequency_hz} Hz
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tremorData.frequency_spectrum} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                      <XAxis dataKey="frequency_hz" stroke="#817D70" fontSize={10} tickFormatter={(v) => `${v} Hz`} />
                      <YAxis stroke="#817D70" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '10px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                      />
                      <ReferenceArea x1={4.0} x2={6.0} stroke="#E9BD4B" fill="#F4D66D" fillOpacity={0.25} />
                      <Bar dataKey="power" fill="#292820" radius={[3, 3, 0, 0]} name="Spectral Energy" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Summary Section (Inspired by ParkScreen bottom report card) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Horizontal Recording Quality Bar */}
                <div className="md:col-span-7 bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-[#817D70] uppercase font-mono tracking-wider">
                    Recording & Sampling Quality Audit
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#292820]">Effective Frame Rate: {tremorData.effective_fps} FPS</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        tremorData.quality === 'Good' ? 'bg-[#789879]/20 text-[#789879]' : 'bg-[#D99A38]/20 text-[#D99A38]'
                      }`}>
                        STATUS: {tremorData.quality.toUpperCase()}
                      </span>
                    </div>

                    {/* Quality 3-segment bar */}
                    <div className="w-full h-3 rounded-full bg-[#FAF9F4] border border-[#EAE6D9] flex overflow-hidden">
                      <div className={`h-full ${tremorData.effective_fps >= 18 ? 'bg-[#789879]' : 'bg-[#FAF9F4]'} flex-1 border-r border-[#EAE6D9]`} title="Sufficient" />
                      <div className={`h-full ${tremorData.effective_fps >= 24 ? 'bg-[#E9BD4B]' : 'bg-[#FAF9F4]'} flex-1 border-r border-[#EAE6D9]`} title="Optimal" />
                      <div className={`h-full ${tremorData.effective_fps >= 28 ? 'bg-[#292820]' : 'bg-[#FAF9F4]'} flex-1`} title="High Quality" />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#817D70] leading-relaxed">
                    Sampling meets the Nyquist criterion for 0.5–12.0 Hz bandpass filtering. Frame timestamps were uniformly resampled.
                  </p>
                </div>

                {/* Neutral Measurement Telemetry Box */}
                <div className="md:col-span-5 bg-[#FAF9F4] border border-[#EAE6D9] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#817D70] uppercase font-mono tracking-wider mb-2">
                      Kinematic Telemetry Summary
                    </h4>
                    <div className="space-y-1.5 text-xs text-[#292820]">
                      <div className="flex justify-between">
                        <span className="text-[#817D70]">Observed Peak Frequency:</span>
                        <span className="font-mono font-bold">{tremorData.dominant_frequency_hz} Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#817D70]">4–6 Hz Band Power Ratio:</span>
                        <span className="font-mono font-bold">{(tremorData.power_ratio_4_6hz * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#817D70]">Observation Duration:</span>
                        <span className="font-mono font-bold">{tremorData.duration_seconds}s</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#817D70] mt-4 pt-3 border-t border-[#EAE6D9]">
                    *Neutral signal processing observation. Does not constitute a clinical neurological diagnosis.
                  </p>
                </div>
              </div>
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
                      <Line type="monotone" dataKey="is_tap" stroke="#C66D5B" strokeWidth={0} dot={{ r: 4, fill: '#C66D5B' }} name="Tap Peak" />
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
                        <Line type="monotone" dataKey="interval_sec" stroke="#E9BD4B" strokeWidth={2} dot={{ r: 3, fill: '#E9BD4B' }} name="Interval (s)" />
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
                        <Line type="monotone" dataKey="normalized_amplitude" stroke="#C66D5B" strokeWidth={2} dot={{ r: 3, fill: '#C66D5B' }} name="Peak Amplitude" />
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

