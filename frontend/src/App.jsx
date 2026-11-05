import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AssessmentSelection from './pages/AssessmentSelection';
import LiveAssessment from './pages/LiveAssessment';
import AssessmentResults from './pages/AssessmentResults';
import MotorReport from './pages/MotorReport';
import SessionHistory from './pages/SessionHistory';
import AboutMethodology from './pages/AboutMethodology';

export default function App() {
  // Navigation State: 'landing' | 'dashboard' | 'assessments' | 'live-tremor' | 'live-tapping' | 'results' | 'report' | 'history' | 'about'
  const [activePage, setActivePage] = useState('dashboard');

  // Shared Camera Stream across all modules
  const [sharedStream, setSharedStream] = useState(null);

  // Persistent Session States
  const [tremorData, setTremorData] = useState(() => {
    try {
      const s = localStorage.getItem('neuromotion_tremor_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [tappingData, setTappingData] = useState(() => {
    try {
      const s = localStorage.getItem('neuromotion_tapping_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [sessionHistory, setSessionHistory] = useState(() => {
    try {
      const h = localStorage.getItem('neuromotion_history');
      return h ? JSON.parse(h) : [];
    } catch { return []; }
  });

  // Sync to localStorage
  useEffect(() => {
    if (tremorData) localStorage.setItem('neuromotion_tremor_session', JSON.stringify(tremorData));
  }, [tremorData]);

  useEffect(() => {
    if (tappingData) localStorage.setItem('neuromotion_tapping_session', JSON.stringify(tappingData));
  }, [tappingData]);

  useEffect(() => {
    localStorage.setItem('neuromotion_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  const handleAssessmentCompleted = (type, results) => {
    if (type === 'tremor') {
      setTremorData(results);
    } else {
      setTappingData(results);
    }

    // Append to session history
    const newEntry = {
      id: Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString(),
      tremorFreq: type === 'tremor' ? results.dominant_frequency_hz : tremorData?.dominant_frequency_hz,
      tapsCount: type === 'tapping' ? results.total_taps : tappingData?.total_taps,
      cadence: type === 'tapping' ? results.taps_per_second : tappingData?.taps_per_second
    };
    setSessionHistory(prev => [newEntry, ...prev]);
  };

  const clearHistory = () => {
    localStorage.removeItem('neuromotion_tremor_session');
    localStorage.removeItem('neuromotion_tapping_session');
    localStorage.removeItem('neuromotion_history');
    setTremorData(null);
    setTappingData(null);
    setSessionHistory([]);
  };

  // If on landing page, render full-bleed landing layout
  if (activePage === 'landing') {
    return <LandingPage setActivePage={setActivePage} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#FFFFFF] text-[#292820] overflow-hidden font-sans">
      {/* Shared Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#FFFFFF]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#EAE6D9] bg-[#FFFFFF] backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-[#292820]">
              {activePage === 'dashboard' && 'Workspace Overview'}
              {activePage === 'assessments' && 'Assessment Protocol Selection'}
              {activePage === 'live-tremor' && 'Resting Tremor Examination'}
              {activePage === 'live-tapping' && 'Rapid Finger-Tapping Task'}
              {activePage === 'results' && 'Kinematics & Spectral Decomposition'}
              {activePage === 'report' && 'Motor Assessment Report'}
              {activePage === 'history' && 'Session-to-Session History'}
              {activePage === 'about' && 'Scientific Methodology'}
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#F5F1E6] text-[#817D70] px-2.5 py-0.5 rounded-full border border-[#EAE6D9]">
              WebGL Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('landing')}
              className="text-xs font-semibold text-[#817D70] hover:text-[#292820] px-3 py-1.5 rounded-lg border border-[#EAE6D9] bg-[#FFFFFF] transition shadow-sm"
            >
              Product Landing
            </button>
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-[#817D70] hover:text-[#C66D5B] px-3 py-1.5 rounded-lg border border-[#EAE6D9] bg-[#FFFFFF] transition shadow-sm"
            >
              Reset Data
            </button>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1">
          {activePage === 'dashboard' && (
            <Dashboard
              tremorData={tremorData}
              tappingData={tappingData}
              sessionHistory={sessionHistory}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'assessments' && (
            <AssessmentSelection setActivePage={setActivePage} />
          )}

          {activePage === 'live-tremor' && (
            <LiveAssessment
              mode="tremor"
              sharedStream={sharedStream}
              onStreamReady={setSharedStream}
              onAssessmentCompleted={handleAssessmentCompleted}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'live-tapping' && (
            <LiveAssessment
              mode="tapping"
              sharedStream={sharedStream}
              onStreamReady={setSharedStream}
              onAssessmentCompleted={handleAssessmentCompleted}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'results' && (
            <AssessmentResults
              tremorData={tremorData}
              tappingData={tappingData}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'report' && (
            <MotorReport
              tremorData={tremorData}
              tappingData={tappingData}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'history' && (
            <SessionHistory
              sessionHistory={sessionHistory}
              clearHistory={clearHistory}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'about' && (
            <AboutMethodology setActivePage={setActivePage} />
          )}
        </main>
      </div>
    </div>
  );
}
