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
      <div className="flex items-center gap-2 border-b border-[#EAE6D9] pb-3">
        <button
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
            activeTab === 'tremor'
              ? 'bg-[#FFFFFF] text-[#292820] border border-[#E9BD4B] shadow-sm font-bold'
              : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E9]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-[#E9BD4B]" />
          Resting Tremor Kinematics
        </button>

        <button
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
            activeTab === 'tapping'
              ? 'bg-[#FFFFFF] text-[#292820] border border-[#E9BD4B] shadow-sm font-bold'
              : 'text-[#817D70] hover:text-[#292820] hover:bg-[#F5F1E9]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#E9BD4B]" />
          Finger-Tapping Dynamics
        </button>
      </div>

      {/* Tremor Visualizations */}
      {activeTab === 'tremor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Waveform Chart */}
          <div className="card-flowing rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#292820] uppercase tracking-wider font-heading">Displacement Time-Series</h4>
                <p className="text-[11px] text-[#817D70]">Index fingertip motion relative to resting mean</p>
              </div>
              <span className="text-[11px] font-mono bg-[#FAF9F4] text-[#292820] px-2 py-0.5 rounded border border-[#EAE6D9]">
                Butterworth (0.5 - 12 Hz)
              </span>
            </div>

            <div className="h-56 w-full">
              {tremorResult && tremorResult.filtered_waveform && tremorResult.filtered_waveform.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tremorResult.filtered_waveform} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                    <XAxis dataKey="time_sec" stroke="#817D70" fontSize={10} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#817D70" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '10px', fontSize: '11px', color: '#292820', boxShadow: '0 4px 12px rgba(41,40,32,0.06)' }}
                    />
                    <Line type="monotone" dataKey="filtered_displacement" stroke="#E9BD4B" dot={false} strokeWidth={2} name="Filtered (norm)" />
                    <Line type="monotone" dataKey="envelope" stroke="#75D5C7" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="Hilbert Envelope" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#817D70] text-xs">
                  <Radio className="w-6 h-6 text-[#E9BD4B] mb-2 animate-pulse" />
                  Perform a resting tremor test to populate displacement waveform.
                </div>
              )}
            </div>
          </div>

          {/* FFT Spectrum Chart */}
          <div className="card-flowing rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#292820] uppercase tracking-wider font-heading">FFT Power Spectrum</h4>
                <p className="text-[11px] text-[#817D70]">Frequency breakdown with 4–6 Hz physiological band highlighted</p>
              </div>
              {tremorResult && tremorResult.dominant_frequency_hz > 0 && (
                <span className="text-xs font-mono font-bold text-[#292820] bg-[#FAF9F4] border border-[#EAE6D9] px-2.5 py-0.5 rounded-full">
                  Peak: {tremorResult.dominant_frequency_hz} Hz
                </span>
              )}
            </div>

            <div className="h-56 w-full">
              {tremorResult && tremorResult.frequency_spectrum && tremorResult.frequency_spectrum.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tremorResult.frequency_spectrum} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                    <XAxis dataKey="frequency_hz" stroke="#817D70" fontSize={10} tickFormatter={(v) => `${v} Hz`} />
                    <YAxis stroke="#817D70" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '10px', fontSize: '11px', color: '#292820', boxShadow: '0 4px 12px rgba(41,40,32,0.06)' }}
                    />
                    <ReferenceArea x1={4.0} x2={6.0} stroke="#D99A38" fill="#F4D66D" fillOpacity={0.25} />
                    <Bar dataKey="power" fill="#75D5C7" radius={[4, 4, 0, 0]} name="Spectral Energy" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#817D70] text-xs">
                  <BarChart3 className="w-6 h-6 text-[#E9BD4B] mb-2 animate-pulse" />
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
          <div className="card-flowing rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#292820] uppercase tracking-wider font-heading">Thumb-Index Distance ($D_{'{norm}'}$)</h4>
                <p className="text-[11px] text-[#817D70]">Normalized by anatomical wrist-to-MCP hand scale</p>
              </div>
              <span className="text-[11px] font-mono bg-[#FAF9F4] text-[#292820] px-2 py-0.5 rounded border border-[#EAE6D9]">
                Scale Invariant
              </span>
            </div>

            <div className="h-56 w-full">
              {tappingResult && tappingResult.distance_timeseries && tappingResult.distance_timeseries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tappingResult.distance_timeseries} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                    <XAxis dataKey="time_sec" stroke="#817D70" fontSize={10} tickFormatter={(v) => `${v}s`} />
                    <YAxis stroke="#817D70" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '10px', fontSize: '11px', color: '#292820', boxShadow: '0 4px 12px rgba(41,40,32,0.06)' }}
                    />
                    <Line type="monotone" dataKey="smoothed_distance" stroke="#E9BD4B" dot={false} strokeWidth={2.2} name="Normalized Distance" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#817D70] text-xs">
                  <Activity className="w-6 h-6 text-[#E9BD4B] mb-2 animate-pulse" />
                  Record finger-tapping exercise to graph opening/closing peaks.
                </div>
              )}
            </div>
          </div>

          {/* Cycle Interval & Amplitude Fatigue */}
          <div className="card-flowing rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#292820] uppercase tracking-wider font-heading">Cycle Amplitude & Rhythm Stability</h4>
                <p className="text-[11px] text-[#817D70]">Extracted tap amplitude per completed opening cycle</p>
              </div>
              {tappingResult && (
                <span className="text-[11px] font-mono text-[#292820] bg-[#FAF9F4] px-2.5 py-0.5 rounded border border-[#EAE6D9]">
                  CV: {tappingResult.interval_variability_cv}%
                </span>
              )}
            </div>

            <div className="h-56 w-full">
              {tappingResult && tappingResult.cycles && tappingResult.cycles.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tappingResult.cycles} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE6D9" />
                    <XAxis dataKey="tap_index" stroke="#817D70" fontSize={10} tickFormatter={(v) => `Tap ${v}`} />
                    <YAxis stroke="#817D70" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAE6D9', borderRadius: '10px', fontSize: '11px', color: '#292820', boxShadow: '0 4px 12px rgba(41,40,32,0.06)' }}
                    />
                    <Line type="monotone" dataKey="normalized_amplitude" stroke="#B8A8E8" strokeWidth={2} dot={{ r: 4, fill: '#B8A8E8' }} name="Tap Amplitude" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#817D70] text-xs">
                  <TrendingDown className="w-6 h-6 text-[#E9BD4B] mb-2 animate-pulse" />
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
