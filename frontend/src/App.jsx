import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AssessmentSelection from './pages/AssessmentSelection';
import LiveAssessment from './pages/LiveAssessment';
import AssessmentResults from './pages/AssessmentResults';
import MotorReport from './pages/MotorReport';
import MyHistory from './pages/MyHistory';
import AboutMethodology from './pages/AboutMethodology';
import VoiceAssessment from './pages/VoiceAssessment';
import LoginPage from './pages/LoginPage';
import { loadAssessmentRecords, saveAssessmentRecord } from './lib/assessmentRecords';
import { supabase, supabaseConfigured } from './lib/supabaseClient';

const readLocal = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

const loadLocalAssessmentRecords = () => {
  const saved = readLocal('neuromotion_assessment_records', null);
  if (Array.isArray(saved)) return saved;
  const storedHistory = readLocal('neuromotion_history', []);
  const oldHistory = Array.isArray(storedHistory) ? storedHistory : [];
  const migrated = [];
  oldHistory.forEach((entry, index) => {
    if (entry.tremorFreq != null) migrated.push({
      id: `legacy-tremor-${index}`, assessment_type: 'tremor', completed_at: null,
      legacy_date: entry.date || null, results: { dominant_frequency_hz: entry.tremorFreq }
    });
    if (entry.tapsCount != null || entry.cadence != null) migrated.push({
      id: `legacy-tapping-${index}`, assessment_type: 'tapping', completed_at: null,
      legacy_date: entry.date || null, results: { total_taps: entry.tapsCount, taps_per_second: entry.cadence }
    });
  });
  if (!migrated.length) {
    const tremor = readLocal('neuromotion_tremor_session', null);
    const tapping = readLocal('neuromotion_tapping_session', null);
    if (tremor) migrated.push({ id: 'legacy-tremor-latest', assessment_type: 'tremor', completed_at: null, results: tremor });
    if (tapping) migrated.push({ id: 'legacy-tapping-latest', assessment_type: 'tapping', completed_at: null, results: tapping });
  }
  if (migrated.length) localStorage.setItem('neuromotion_assessment_records', JSON.stringify(migrated));
  return migrated;
};

export default function App() {
  // Navigation State: dashboard, assessments, movement tests, voice, reports, history, and methodology.
  const [activePage, setActivePage] = useState('dashboard');
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [localDemo, setLocalDemo] = useState(() => !supabaseConfigured && localStorage.getItem('neuromotion_local_demo') === 'yes');
  const [records, setRecords] = useState(() => supabaseConfigured ? [] : loadLocalAssessmentRecords());
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordError, setRecordError] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  // Shared Camera Stream across all modules
  const [sharedStream, setSharedStream] = useState(null);

  // Persistent Session States
  const [tremorData, setTremorData] = useState(() => {
    if (supabaseConfigured) return null;
    try {
      const s = localStorage.getItem('neuromotion_tremor_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [tappingData, setTappingData] = useState(() => {
    if (supabaseConfigured) return null;
    try {
      const s = localStorage.getItem('neuromotion_tapping_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [sessionHistory, setSessionHistory] = useState(() => {
    if (supabaseConfigured) return [];
    try {
      const h = localStorage.getItem('neuromotion_history');
      return h ? JSON.parse(h) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (!supabaseConfigured) {
      setAuthReady(true);
      return undefined;
    }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setRecordError(`Could not restore sign-in: ${error.message}`);
      setSession(data?.session || null);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setRecords([]);
        setTremorData(null);
        setTappingData(null);
        setSessionHistory([]);
        setRecordError('');
        setSyncMessage('');
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    let active = true;
    setRecordsLoading(true);
    loadAssessmentRecords()
      .then((loaded) => {
        if (!active) return;
        setRecords(loaded);
        setTremorData(loaded.find((record) => record.assessment_type === 'tremor')?.results || null);
        setTappingData(loaded.find((record) => record.assessment_type === 'tapping')?.results || null);
        setSessionHistory(loaded.map((record) => ({
          id: record.id,
          date: record.completed_at ? new Date(record.completed_at).toLocaleString() : 'Date unavailable',
          tremorFreq: record.assessment_type === 'tremor' ? record.results?.dominant_frequency_hz : null,
          tapsCount: record.assessment_type === 'tapping' ? record.results?.total_taps : null,
          cadence: record.assessment_type === 'tapping' ? record.results?.taps_per_second : null
        })));
        setRecordError('');
      })
      .catch((error) => {
        if (active) setRecordError(`Could not load your cloud records: ${error.message}`);
      })
      .finally(() => { if (active) setRecordsLoading(false); });
    return () => { active = false; };
  }, [session?.user?.id]);

  // Sync to localStorage
  useEffect(() => {
    if (!supabaseConfigured || localDemo) {
      if (tremorData) localStorage.setItem('neuromotion_tremor_session', JSON.stringify(tremorData));
    }
  }, [tremorData, localDemo]);

  useEffect(() => {
    if (!supabaseConfigured || localDemo) {
      if (tappingData) localStorage.setItem('neuromotion_tapping_session', JSON.stringify(tappingData));
    }
  }, [tappingData, localDemo]);

  useEffect(() => {
    if (!supabaseConfigured || localDemo) localStorage.setItem('neuromotion_history', JSON.stringify(sessionHistory));
  }, [sessionHistory, localDemo]);

  const handleAssessmentCompleted = async (type, results) => {
    if (type === 'tremor') {
      setTremorData(results);
    } else if (type === 'tapping') {
      setTappingData(results);
    }

    const newRecord = {
      assessment_type: type,
      completed_at: new Date().toISOString(),
      quality: results.quality || null,
      effective_fps: results.effective_fps != null && Number.isFinite(Number(results.effective_fps)) ? Number(results.effective_fps) : null,
      results
    };

    if (session?.user?.id && supabaseConfigured) {
      setSyncMessage('Saving assessment to your account…');
      try {
        const savedRecord = await saveAssessmentRecord(session.user.id, type, results);
        setRecords((previous) => [savedRecord, ...previous]);
        setSyncMessage('Assessment saved to your account.');
      } catch (error) {
        setSyncMessage(`Assessment is visible now but cloud save failed: ${error.message}`);
      }
    } else {
      newRecord.id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      newRecord.created_at = newRecord.completed_at;
      const nextRecords = [newRecord, ...records];
      localStorage.setItem('neuromotion_assessment_records', JSON.stringify(nextRecords));
      setRecords(nextRecords);
      setSyncMessage('Saved in this browser only. Sign in with cloud storage enabled to sync across devices.');
    }

    // Local session summary remains available for the existing workspace cards.
    if (type === 'voice') return;

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
    if (session) return;
    localStorage.removeItem('neuromotion_tremor_session');
    localStorage.removeItem('neuromotion_tapping_session');
    localStorage.removeItem('neuromotion_history');
    setTremorData(null);
    setTappingData(null);
    setSessionHistory([]);
    setRecords([]);
    localStorage.removeItem('neuromotion_assessment_records');
  };

  const openRecord = (record) => {
    if (record.assessment_type === 'tremor') setTremorData(record.results);
    if (record.assessment_type === 'tapping') setTappingData(record.results);
    setActivePage(record.assessment_type === 'voice' ? 'history' : 'report');
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setLocalDemo(false);
    localStorage.removeItem('neuromotion_local_demo');
  };

  const continueLocalDemo = () => {
    localStorage.setItem('neuromotion_local_demo', 'yes');
    setRecords(loadLocalAssessmentRecords());
    setTremorData(readLocal('neuromotion_tremor_session', null));
    setTappingData(readLocal('neuromotion_tapping_session', null));
    const history = readLocal('neuromotion_history', []);
    setSessionHistory(Array.isArray(history) ? history : []);
    setLocalDemo(true);
  };

  if (!authReady) return <div className="min-h-screen bg-[#FAF9F4] flex items-center justify-center text-sm text-[#817D70]">Loading your account…</div>;
  if (supabaseConfigured && !session && !localDemo) return <LoginPage configured onContinueLocal={continueLocalDemo} />;
  if (!supabaseConfigured && !localDemo) return <LoginPage configured={false} onContinueLocal={continueLocalDemo} />;

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
              {activePage === 'voice' && 'Voice Signal Assessment'}
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
            {session?.user?.email && <span className="hidden max-w-48 truncate text-[10px] text-[#817D70] sm:inline">{session.user.email}</span>}
            {session ? <button onClick={signOut} className="text-xs font-semibold text-[#817D70] hover:text-[#C66D5B] px-3 py-1.5 rounded-lg border border-[#EAE6D9] bg-white">Sign out</button> : <span className="rounded-lg border border-[#E9BD4B] bg-[#FFF9E5] px-2.5 py-1.5 text-[10px] font-semibold text-[#65521C]">Browser-only demo</span>}
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1">
          {(recordError || syncMessage) && <div className={`mx-6 mt-4 rounded-xl border px-4 py-3 text-xs ${recordError || syncMessage.includes('failed') ? 'border-[#E3B6AA] bg-[#FFF5F2] text-[#8B4535]' : 'border-[#EAE6D9] bg-[#FAF9F4] text-[#65521C]'}`} role="status">{recordError || syncMessage}</div>}
          {activePage === 'dashboard' && (
            <Dashboard
              tremorData={tremorData}
              tappingData={tappingData}
              sessionHistory={sessionHistory}
              records={records}
              accountEmail={session?.user?.email}
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

          {activePage === 'voice' && <VoiceAssessment onAssessmentCompleted={handleAssessmentCompleted} />}

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

          {activePage === 'history' && <MyHistory records={records} loading={recordsLoading} onOpenRecord={openRecord} />}

          {activePage === 'about' && (
            <AboutMethodology setActivePage={setActivePage} />
          )}
        </main>
      </div>
    </div>
  );
}
