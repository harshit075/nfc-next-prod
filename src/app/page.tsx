'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Smartphone, Zap, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [nfcStatus, setNfcStatus] = useState('NFC Scanner Ready');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Web NFC is supported
    if ('NDEFReader' in window) {
      setIsNfcSupported(true);
      const reader = new (window as any).NDEFReader();
      let active = true;

      const startNfcScan = async () => {
        try {
          await reader.scan();
          setNfcStatus('NFC Scanner Active — Tap card to phone');
          reader.addEventListener('reading', ({ message, serialNumber }: any) => {
            if (!active) return;
            console.log(`NFC card read. Serial: ${serialNumber}`);
            
            // Search records for a card url
            for (const record of message.records) {
              if (record.recordType === 'url') {
                const textDecoder = new TextDecoder();
                const urlString = textDecoder.decode(record.data);
                try {
                  const url = new URL(urlString);
                  const pathParts = url.pathname.split('/');
                  const token = pathParts[pathParts.length - 1];
                  if (token) {
                    setNfcStatus('Card scanned successfully! Redirecting...');
                    router.push(`/card/${token}`);
                    break;
                  }
                } catch (e) {
                  console.error('Invalid URL in NFC tag payload', urlString);
                }
              }
            }
          });
        } catch (err: any) {
          console.error('Web NFC scan error:', err);
          setNfcStatus('NFC Access Blocked/Unavailable');
        }
      };

      startNfcScan();
      return () => {
        active = false;
      };
    } else {
      setIsNfcSupported(false);
      setNfcStatus('Web NFC not supported on this device/browser');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setIsLoading(true);
    router.push(`/card/${tokenInput.trim()}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-health-blue-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-health-teal-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-health-blue-500 to-health-teal-500 flex items-center justify-center shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-health-blue-650 via-health-teal-650 to-health-blue-650 dark:from-health-blue-400 dark:via-health-teal-400 dark:to-health-blue-400 bg-clip-text text-transparent">
            SwasthyaTap
          </span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 text-xs font-bold text-slate-650 dark:text-slate-300 hover:text-health-blue-650 dark:hover:text-health-blue-400 transition"
        >
          Staff Dashboard Login
        </Link>
      </header>

      {/* Main content grid */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Info Side */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-health-blue-105 dark:bg-health-blue-950/20 text-health-blue-750 dark:text-health-blue-400 rounded-full text-xs font-bold border border-health-blue-200/30 dark:border-health-blue-900/30">
              <Smartphone className="h-3.5 w-3.5" /> Instant Emergency Profile
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Tap to Scan. <br />
              <span className="bg-gradient-to-r from-health-blue-600 to-health-teal-650 dark:from-health-blue-400 dark:to-health-teal-400 bg-clip-text text-transparent">
                Instantly Save Lives.
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              SwasthyaTap resolves tapped physical NFC medical cards to critical health profile summaries in high-stress emergency scenarios. 
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400 shrink-0">
                  <ShieldAlert className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Critical Warnings</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Instant allergy and condition records.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">100% Secure</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Tokens hashed before lookup.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulator Panel Side */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center"
            >
              {/* Dynamic NFC scanner halo effect */}
              {isNfcSupported && (
                <div className="absolute top-6 right-6 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-health-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-health-teal-500"></span>
                </div>
              )}

              <div className="w-16 h-16 rounded-full bg-health-blue-50 dark:bg-health-blue-950/30 text-health-blue-650 dark:text-health-blue-400 flex items-center justify-center mb-6 border border-health-blue-100/50 dark:border-health-blue-900/30">
                <Smartphone className="h-8 w-8 animate-pulse" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                SwasthyaTap Card Reader
              </h2>
              <p className="mt-2 text-xs text-slate-450 dark:text-slate-400 text-center max-w-xs font-medium">
                {nfcStatus}
              </p>

              <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50 my-6"></div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Simulate Scan — Enter Card Token
                  </label>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="e.g. test-token-123"
                    className="w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold tracking-wide text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-health-blue-500 transition shadow-inner"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !tokenInput.trim()}
                  className="w-full py-3 bg-gradient-to-r from-health-blue-600 to-health-teal-600 hover:from-health-blue-650 hover:to-health-teal-650 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Verify NFC Card'
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                  Hint: Try <code className="px-1.5 py-0.5 bg-slate-200/85 dark:bg-slate-900 rounded border border-slate-300/40 dark:border-slate-700/40 text-slate-650 dark:text-slate-350 select-all">test-token-123</code>
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full py-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} SwasthyaTap. Built for secure emergency medical access.
      </footer>
    </div>
  );
}
