import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Activity,
  Radio,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import FlowingRibbon from '../components/FlowingRibbon';

export default function AboutMethodology({ setActivePage }) {
  return (
    <div className="relative p-8 space-y-8 max-w-4xl mx-auto overflow-hidden">
      {/* Subtle background ribbon accent */}
      <FlowingRibbon variant="subtle" className="opacity-20" />
      {/* Header */}
      <div className="relative z-10 border-b border-[#EAE6D9] pb-4">
        <span className="text-[10px] font-mono uppercase text-[#817D70] font-bold">Scientific Methodology</span>
        <h2 className="text-2xl font-bold font-heading text-[#292820]">
          About NeuroMotion AI
        </h2>
        <p className="text-xs text-[#817D70] mt-1">
          Algorithmic principles, signal processing architecture, and clinical boundaries.
        </p>
      </div>

      {/* Section 1: Principles */}
      <div className="card-flowing rounded-2xl p-6 relative z-10 space-y-4">
        <h3 className="text-sm font-bold font-heading text-[#292820] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#E9BD4B]" />
          Zero-Hardware Accessibility
        </h3>
        <p className="text-xs text-[#817D70] leading-relaxed">
          Traditional motor evaluations rely either on subjective clinical scales (such as the MDS-UPDRS Part III) or costly laboratory sensors (such as electromagnetic trackers or sensorized gloves). NeuroMotion AI demonstrates that commodity webcams coupled with WebGL-accelerated hand tracking can reliably quantify physical movement characteristics with millisecond precision.
        </p>
      </div>

      {/* Section 2: Kinematic Signal Pipeline */}
      <div className="card-flowing rounded-2xl p-6 relative z-10 space-y-4">
        <h3 className="text-sm font-bold font-heading text-[#292820] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#E9BD4B]" />
          Explainable Kinematic Pipeline
        </h3>
        <div className="space-y-3 text-xs text-[#817D70]">
          <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#EAE6D9]">
            <strong className="text-[#292820] block mb-1">Resting Tremor FFT Analysis:</strong>
            Oscillations of the index fingertip are projected onto the principal movement axis to prevent harmonic folding. After uniform 30 Hz resampling, detrending, and Hanning windowing, a discrete Fast Fourier Transform isolates spectral energy inside the 4.0–6.0 Hz band.
          </div>

          <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#EAE6D9]">
            <strong className="text-[#292820] block mb-1">Finger-Tapping Scale Normalization:</strong>
            Fingertip separation is normalized against the instantaneous anatomical distance between the wrist and middle finger MCP joint ($S_{'{ref}'}$), ensuring that camera distance variations do not distort amplitude measurements.
          </div>
          <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#EAE6D9]">
            <strong className="text-[#292820] block mb-1">Exploratory Voice Signal:</strong>
            A five-second sustained vowel is analyzed in the browser using windowed autocorrelation for estimated pitch and RMS amplitude variation. These are descriptive signal measurements, not Parkinson’s biomarkers or classifier output.
          </div>
        </div>
      </div>

      {/* Section 3: Privacy Architecture */}
      <div className="card-flowing rounded-2xl p-6 relative z-10 space-y-4">
        <h3 className="text-sm font-bold font-heading text-[#292820] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#E9BD4B]" />
          Local Browser-First Privacy
        </h3>
        <p className="text-xs text-[#817D70] leading-relaxed">
          Camera frames and microphone audio are processed in your browser and are not uploaded. The short voice recording is discarded after feature extraction; the voice task does not save audio or persist voice metrics. Existing movement session metrics may be retained in this browser’s local storage.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => setActivePage('assessments')}
          className="flex items-center gap-2 px-5 py-3 bg-[#F4D66D] hover:bg-[#E9BD4B] text-[#292820] font-bold text-xs rounded-xl border border-[#E9BD4B] shadow-sm transition"
        >
          Launch Assessment <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

