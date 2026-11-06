import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileText,
  Radio,
  Activity,
  Calendar,
  Clock,
  Info
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';
import ScreeningSummary from '../components/ScreeningSummary';
import { evaluateScreeningTriage } from '../features/analysis/screeningTriage.js';

export default function MotorReport({
  tremorData,
  tappingData,
  voiceData,
  setActivePage
}) {
  const [notes, setNotes] = useState('');
  const screening = evaluateScreeningTriage({ tremor: tremorData, tapping: tappingData, voice: voiceData });

  const handleExportJSON = () => {
    const reportObj = {
      title: "NeuroMotion AI — Motor Assessment Report",
      date: new Date().toISOString(),
      disclaimer: "Research screening aid: compares measurements to provisional reference ranges. Not a diagnosis. Consult a neurologist.",
      screening,
      notes,
      tremor: tremorData || "Not recorded",
      tapping: tappingData || "Not recorded",
      voice: voiceData || "Not recorded"
    };

    const blob = new Blob([JSON.stringify(reportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuromotion_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headerLines = [
      '# Research screening aid: compares measurements to provisional reference ranges. Not a diagnosis. Consult a neurologist.',
      `# Date: ${new Date().toISOString()}`,
      `# Screening Tier: ${screening.tier}`,
      `# Domains: ${screening.domainCount}`,
      ''
    ];
    const rows = [['modality', 'metric', 'observed_value', 'provisional_range', 'severity', 'citation']];
    screening.flags.forEach((item) => rows.push([item.modality, item.metricName, item.observedValue, item.referenceRange, item.severity, item.citation]));
    const dataCsv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const csv = headerLines.join('\n') + dataCsv;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `neuromotion-screening-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative p-6 sm:p-8 max-w-4xl mx-auto space-y-6 overflow-hidden">
      {/* Background Flowing Ribbon layer */}
      <FlowingRibbon position="full" opacity={0.75} className="absolute inset-0 pointer-events-none" />

      {/* Top Action Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6D9] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#817D70] font-bold">Standardized Clinical Export</span>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-[#292820] tracking-tight">
            Motor Assessment Report
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F5F1E6] text-[#292820] text-xs font-semibold rounded-xl border border-[#EAE6D9] shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" /> Export screening CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] hover:bg-[#F5F1E9] text-[#292820] text-xs font-semibold rounded-full border border-[#EAE6D9] shadow-xs transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] hover:opacity-95 text-[#292820] text-xs font-bold rounded-full border border-[#E9BD4B] shadow-xs transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="relative z-10 card-flowing rounded-3xl p-8 bg-white/95 border border-[#EAE6D9] shadow-sm space-y-8 text-[#292820]">
        <ScreeningSummary tremor={tremorData} tapping={tappingData} voice={voiceData} />
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-[#EAE6D9] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E9BD4B]" />
              <span className="font-extrabold text-lg tracking-tight font-heading">
                Neuro<span className="text-[#D99A38]">Motion AI</span>
              </span>
            </div>
            <p className="text-xs text-[#817D70]">
              Computer-Vision Motor Movement & Tremor Kinematics Report
            </p>
            <p className="text-xs font-medium text-[#817D70] mt-1.5">
              Research screening aid: compares measurements to provisional reference ranges. Not a diagnosis. Consult a neurologist.
            </p>
          </div>

          <div className="text-right text-xs space-y-1 font-mono">
            <p className="text-[#817D70]">Generated: <strong className="text-[#292820]">{new Date().toLocaleDateString()}</strong></p>
            <p className="text-[#817D70]">Session ID: <strong className="text-[#292820]">#NM-8924-REV</strong></p>
            <p className="text-[#817D70]">Capture Engine: <strong className="text-[#292820]">Tasks-Vision WebGL</strong></p>
          </div>
        </div>

        {/* Section 1: Measured Values Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#817D70]">
            Part 1: Measured Physical Kinematics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tremor Measurements */}
            <div className="bg-[#FAF9F4] p-5 rounded-xl border border-[#EAE6D9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-2 text-[#292820]">
                  <Radio className="w-4 h-4 text-[#E9BD4B]" /> Resting Tremor
                </span>
                <span className="text-[10px] font-mono text-[#817D70]">
                  {tremorData ? `Quality: ${tremorData.quality}` : 'Not tested'}
                </span>
              </div>

              {tremorData ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#EAE6D9]/80">
                    <span className="text-[#817D70]">Dominant Frequency:</span>
                    <span className="font-mono font-bold text-[#292820]">{tremorData.dominant_frequency_hz} Hz</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAE6D9]/80">
                    <span className="text-[#817D70]">4–6 Hz Power Ratio:</span>
                    <span className="font-mono font-bold text-[#292820]">{(tremorData.power_ratio_4_6hz * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAE6D9]/80">
                    <span className="text-[#817D70]">RMS Magnitude:</span>
                    <span className="font-mono font-bold text-[#292820]">{tremorData.rms_amplitude}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#817D70]">Sampling Rate:</span>
                    <span className="font-mono text-[#292820]">{tremorData.effective_fps} FPS</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#817D70] italic">No resting tremor data recorded in this session.</p>
              )}
            </div>

            {/* Finger Tapping Measurements */}
            <div className="bg-[#FAF9F4] p-5 rounded-xl border border-[#EAE6D9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-2 text-[#292820]">
                  <Activity className="w-4 h-4 text-[#E9BD4B]" /> Finger-Tapping
                </span>
                <span className="text-[10px] font-mono text-[#817D70]">
                  {tappingData ? `Quality: ${tappingData.quality}` : 'Not tested'}
                </span>
              </div>

              {tappingData ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#EAE6D9]/80">
                    <span className="text-[#817D70]">Total Completed Taps:</span>
                    <span className="font-mono font-bold text-[#292820]">{tappingData.total_taps}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAE6D9]/80">
                    <span className="text-[#817D70]">Tapping Cadence:</span>
                    <span className="font-mono font-bold text-[#292820]">{tappingData.taps_per_second} taps/s</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EAE6D9]/80">
                    <span className="text-[#817D70]">Interval Variability (CV):</span>
                    <span className="font-mono font-bold text-[#292820]">{tappingData.interval_variability_cv}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#817D70]">Fatigue Decrement Slope:</span>
                    <span className="font-mono text-[#292820]">{tappingData.amplitude_slope}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#817D70] italic">No finger-tapping data recorded in this session.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Neutral Observations & Notes */}
        <div className="space-y-3 pt-4 border-t border-[#EAE6D9]">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#817D70]">
            Part 2: Neutral Observations & Notes
          </h3>

          <div className="space-y-2 text-xs text-[#292820]">
            <p className="p-3 bg-[#FAF9F4] rounded-lg border border-[#EAE6D9] leading-relaxed">
              {tremorData && tremorData.dominant_frequency_hz >= 4.0 && tremorData.dominant_frequency_hz <= 6.0
                ? "Observation: The resting tremor signal exhibited spectral energy concentration within the 4.0–6.0 Hz physiological band."
                : "Observation: Recorded resting motion exhibited low dominant peak energy in the resting tremor band."}
            </p>
            <p className="p-3 bg-[#FAF9F4] rounded-lg border border-[#EAE6D9] leading-relaxed">
              {tappingData && tappingData.amplitude_slope < -0.01
                ? "Observation: Finger-tapping kinematics demonstrated a negative amplitude regression slope across successive cycles, indicating progressive movement decrement."
                : "Observation: Finger-tapping cycles maintained relatively stable movement amplitude throughout the observation window."}
            </p>
          </div>

          <div className="pt-2">
            <label className="text-xs font-bold text-[#817D70] uppercase font-mono tracking-wider block mb-1.5">
              Examiner Clinical Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record notes on subject posture, lighting, fatigue, or session environment..."
              rows={3}
              className="w-full bg-[#FAF9F4] border border-[#EAE6D9] rounded-xl p-3 text-xs text-[#292820] placeholder-[#817D70] focus:outline-none focus:border-[#E9BD4B]"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

