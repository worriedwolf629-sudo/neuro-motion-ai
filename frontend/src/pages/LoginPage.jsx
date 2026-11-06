import React, { useState } from 'react';
import { Activity, ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import FlowingRibbon from '../components/FlowingRibbon';

export default function LoginPage({ configured, onContinueLocal }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const requestSignIn = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSending(true);
    try {
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo }
      });
      if (signInError) throw signInError;
      setMessage('Sign-in link sent. Check your email, then open the link in this browser.');
    } catch (signInError) {
      setError(signInError.message || 'Could not send the sign-in link. Check the email and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#FAF9F4] px-5 py-10 flex items-center justify-center overflow-hidden">
      {/* Signature Flowing Ribbon Layer */}
      <FlowingRibbon position="full" opacity={0.8} className="absolute inset-0 pointer-events-none" />

      <section className="card-flowing w-full max-w-md rounded-3xl p-8 relative z-10 bg-white/95">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E9BD4B] bg-[#F4D66D] shadow-xs"><Activity className="h-6 w-6 text-[#292820]" /></div>
          <div><h1 className="font-heading text-lg font-extrabold text-[#292820]">NeuroMotion AI</h1><p className="text-[10px] uppercase tracking-[0.18em] text-[#817D70]">Personal assessment records</p></div>
        </div>

        <h2 className="text-2xl font-bold font-heading text-[#292820]">Sign in to your dashboard</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#817D70]">Your past assessment measurements and comparisons are available only to your account.</p>

        {configured ? (
          <>
          <form onSubmit={requestSignIn} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-[#292820]" htmlFor="account-email">Account email</label>
            <div className="flex items-center gap-2 rounded-2xl border border-[#EAE6D9] bg-[#FFFFFF] px-4"><Mail className="h-4 w-4 text-[#817D70]" /><input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent py-3 text-sm text-[#292820] outline-none placeholder:text-[#B1AA98]" /></div>
            <button disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E9BD4B] bg-gradient-to-r from-[#F4D66D] to-[#E9BD4B] px-5 py-3.5 text-sm font-bold text-[#292820] shadow-xs hover:shadow transition active:scale-95 disabled:cursor-wait disabled:opacity-60">{sending ? 'Sending link…' : 'Email me a sign-in link'} <ArrowRight className="h-4 w-4" /></button>
            <div className="flex items-start gap-2 rounded-2xl bg-[#FAF9F4] p-3.5 text-[11px] leading-relaxed text-[#817D70] border border-[#EAE6D9]"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#789879]" /><p>We’ll email you a one-time sign-in link. The first sign-in creates your account; future assessments are saved to that account.</p></div>
            {message && <p role="status" className="text-xs text-[#39734A]">{message}</p>}
            {error && <p role="alert" className="text-xs text-[#B55C4A]">{error}</p>}
          </form>
          <button onClick={onContinueLocal} className="mt-4 w-full rounded-full border border-[#EAE6D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#817D70] hover:bg-[#FAF9F4] shadow-xs transition">Use this browser only instead</button>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-[#817D70]">Browser-only records are not linked to your account or backed up online.</p>
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#E9BD4B] bg-[#FFF9E5] p-4 text-xs leading-relaxed text-[#65521C]">
              <strong className="block text-[#292820]">Cloud sign-in needs project setup</strong>
              <span className="mt-1 block">Add the Supabase project URL and publishable key to this deployment, then run the database migration. No secret service key belongs in the website.</span>
            </div>
            <button onClick={onContinueLocal} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#EAE6D9] bg-white px-5 py-3 text-sm font-bold text-[#292820] hover:bg-[#FAF9F4] shadow-xs transition active:scale-95">Continue in this browser only <ArrowRight className="h-4 w-4" /></button>
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#817D70]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#789879]" />Browser-only mode does not sync, authenticate, or back up assessments to a database.</p>
          </div>
        )}
        <p className="mt-7 border-t border-[#EAE6D9] pt-4 text-[10px] leading-relaxed text-[#817D70]">Video and audio are analyzed in your browser and are not stored by account history.</p>
      </section>
    </main>
  );
}
