import React from 'react';
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
import { Activity, Radio, BarChart3, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

export default function TelemetryCharts({
  tremorResult,
  tappingResult,
  activeTab = 'tremor' // 'tremor' | 'tapping' | 'overview'
}) {
  return (
    <div className="space-y-5">
      {/* Visual Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
            activeTab === 'tremor'
              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Resting Tremor Kinematics
        </button>

        <button
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
            activeTab === 'tapping'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Finger-Tapping Dynamics
        </button>
      </div>

      {/* Tremor Visualizations */}
      {activeTab === 'tremor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Waveform Chart */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Displacement Time-Series</h4>
                <p className="text-[11px] text-slate-400">Index fingertip motion relative to resting mean</p>
              </div>
              <span className="text-[11px] font-mono bg-slate-800 text-teal-400 px-2 py-0.5 rounded border border-slate-700">
                Butterworth (0.5 - 12 Hz)
              </span>
            </div>

            <div className="h-56 w-full">
              {tremorResult && tremorResult.filtered_waveform && tremorResult.filtered_waveform.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tremorResult.filtered_waveform} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="time_sec" stroke="#64748B" fontSize={10} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="filtered_displacement" stroke="#06B6D4" dot={false} strokeWidth={2} name="Filtered (norm)" />
                    <Line type="monotone" dataKey="envelope" stroke="#F43F5E" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="Hilbert Envelope" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Radio className="w-6 h-6 text-slate-600 mb-2 animate-pulse" />
                  Perform a resting tremor test to populate displacement waveform.
                </div>
              )}
            </div>
          </div>

          {/* FFT Spectrum Chart */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">FFT Power Spectrum</h4>
                <p className="text-[11px] text-slate-400">Frequency breakdown with 4–6 Hz physiological band highlighted</p>
              </div>
              {tremorResult && tremorResult.dominant_frequency_hz > 0 && (
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                  Peak: {tremorResult.dominant_frequency_hz} Hz
                </span>
              )}
            </div>

            <div className="h-56 w-full">
              {tremorResult && tremorResult.frequency_spectrum && tremorResult.frequency_spectrum.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tremorResult.frequency_spectrum} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="frequency_hz" stroke="#64748B" fontSize={10} tickFormatter={(v) => `${v} Hz`} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <ReferenceArea x1={4.0} x2={6.0} stroke="rgba(245, 158, 11, 0.4)" fill="rgba(245, 158, 11, 0.1)" />
                    <Bar dataKey="power" fill="#14B8A6" radius={[4, 4, 0, 0]} name="Spectral Energy" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <BarChart3 className="w-6 h-6 text-slate-600 mb-2 animate-pulse" />
                  Frequency spectrum will calculate after a resting assessment recording.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tapping Visualizations */}
      {activeTab === 'tapping' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Tapping Distance Curve */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Thumb-Index Distance ($D_{norm}$)</h4>
                <p className="text-[11px] text-slate-400">Normalized by anatomical wrist-to-MCP hand scale</p>
              </div>
              <span className="text-[11px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700">
                Scale Invariant
              </span>
            </div>

            <div className="h-56 w-full">
              {tappingResult && tappingResult.distance_timeseries && tappingResult.distance_timeseries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tappingResult.distance_timeseries} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="time_sec" stroke="#64748B" fontSize={10} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="smoothed_distance" stroke="#38BDF8" dot={false} strokeWidth={2.2} name="Normalized Distance" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Activity className="w-6 h-6 text-slate-600 mb-2 animate-pulse" />
                  Record finger-tapping exercise to graph opening/closing peaks.
                </div>
              )}
            </div>
          </div>

          {/* Cycle Interval & Amplitude Fatigue */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cycle Amplitude & Rhythm Stability</h4>
                <p className="text-[11px] text-slate-400">Extracted tap amplitude per completed opening cycle</p>
              </div>
              {tappingResult && (
                <span className="text-[11px] font-mono text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  CV: {tappingResult.interval_variability_cv}%
                </span>
              )}
            </div>

            <div className="h-56 w-full">
              {tappingResult && tappingResult.cycles && tappingResult.cycles.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tappingResult.cycles} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="tap_index" stroke="#64748B" fontSize={10} tickFormatter={(v) => `Tap ${v}`} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="normalized_amplitude" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B' }} name="Tap Amplitude" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <TrendingDown className="w-6 h-6 text-slate-600 mb-2 animate-pulse" />
                  Tap cycle progression and fatigue will calculate upon test completion.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
