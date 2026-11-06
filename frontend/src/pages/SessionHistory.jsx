import React from 'react';
import {
  Clock,
  Calendar,
  Activity,
  Radio,
  FileText,
  Trash2,
  TrendingUp,
  Info
} from 'lucide-react';

export default function SessionHistory({
  sessionHistory,
  clearHistory,
  setActivePage
}) {
  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAE6D9] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#817D70] font-bold">Progress Tracking</span>
          <h2 className="text-xl font-bold font-heading text-[#292820]">
            Assessment Session History
          </h2>
        </div>

        {sessionHistory && sessionHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C66D5B] hover:bg-[#FAF9F4] rounded-lg border border-[#EAE6D9] transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {sessionHistory && sessionHistory.length > 0 ? (
        <div className="space-y-4">
          {sessionHistory.map((session, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#292820]">Session #{session.id || (index + 1)}</span>
                  <span className="text-[10px] font-mono text-[#817D70] bg-[#FAF9F4] px-2 py-0.5 rounded border border-[#EAE6D9]">
                    {session.date}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#817D70] pt-1">
                  {session.tremorFreq != null && <span>Tremor: <strong className="text-[#292820]">{session.tremorFreq} Hz</strong></span>}
                  {session.tapsCount != null && <span>Tapping: <strong className="text-[#292820]">{session.tapsCount} taps</strong></span>}
                  {session.cadence != null && <span>Cadence: <strong className="text-[#292820]">{session.cadence} taps/s</strong></span>}
                  {session.voicePitch != null && <span>Voice Pitch: <strong className="text-[#292820]">{Number(session.voicePitch).toFixed(1)} Hz</strong></span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActivePage('report')}
                  className="px-3.5 py-1.5 bg-[#FAF9F4] hover:bg-[#F5F1E6] text-[#292820] text-xs font-semibold rounded-xl border border-[#EAE6D9] transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#EAE6D9] rounded-2xl p-12 text-center space-y-3">
          <Clock className="w-8 h-8 text-[#817D70] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#292820]">No Previous Sessions Recorded</h3>
          <p className="text-xs text-[#817D70] max-w-sm mx-auto">
            Completed assessment sessions will automatically be logged here for session-to-session trend comparisons.
          </p>
        </div>
      )}

      {/* Methodology caveat */}
      <div className="p-4 bg-[#FAF9F4] rounded-xl border border-[#EAE6D9] text-[11px] text-[#817D70] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#817D70] shrink-0 mt-0.5" />
        <span>
          Session-to-session comparisons are influenced by ambient webcam frame rate, lighting conditions, and hand distance from the sensor. Measurements should be interpreted as kinematic trends, not clinical severity scores.
        </span>
      </div>
    </div>
  );
}

