'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Smartphone, Zap, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { TRANSLATIONS } from '@/lib/translations';
import { MEDICAL_DATA_TRANSLATIONS } from '@/lib/medicalTranslations';

const LANGUAGES = [
  { code: 'English', name: 'English' },
  { code: 'Hindi', name: 'हिन्दी (Hindi)' },
  { code: 'Bengali', name: 'বাংলা (Bengali)' },
  { code: 'Telugu', name: 'తెలుగు (Telugu)' },
  { code: 'Tamil', name: 'தமிழ் (Tamil)' },
  { code: 'Marathi', name: 'मраঠী (Marathi)' },
  { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
  { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'Malayalam', name: 'മലയാളം (Malayalam)' },
  { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'Odia', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'Urdu', name: 'اردو (Urdu)' }
];

export default function Home() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [nfcStatus, setNfcStatus] = useState('nfc_scanner_ready');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('swasthyatap_lang');
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    localStorage.setItem('swasthyatap_lang', newLang);
  };

  const formatUnderscores = (str: string): string => {
    if (!str) return '';
    let clean = str;
    if (clean.endsWith('_label')) {
      clean = clean.slice(0, -6);
    } else if (clean.endsWith('_filter')) {
      clean = clean.slice(0, -7);
    }
    if (!clean.includes('_')) {
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean
      .split('_')
      .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
      .join(' ');
  };

  const translate = (key: string, fallback: string): string => {
    const lang = selectedLanguage || 'English';
    const medDict = MEDICAL_DATA_TRANSLATIONS[lang] || MEDICAL_DATA_TRANSLATIONS['English'] || {};
    if (medDict[key]) return medDict[key];
    const normalizedKey = key.toLowerCase().trim();
    if (medDict[normalizedKey]) return medDict[normalizedKey];

    const dict = TRANSLATIONS[selectedLanguage] || TRANSLATIONS['English'] || {};
    if (dict[key]) return dict[key];
    if (dict[normalizedKey]) return dict[normalizedKey];

    return formatUnderscores(fallback || key);
  };

  const renderNfcStatus = (): string => {
    if (nfcStatus === 'nfc_scanner_ready') return translate('nfc_scanner_ready', 'NFC Scanner Ready');
    if (nfcStatus === 'nfc_scanner_active') return translate('nfc_read_success', 'NFC Scanner Active — Tap card to phone');
    if (nfcStatus === 'card_scanned_success') return translate('card_scanned_success', 'Card scanned successfully! Redirecting...');
    if (nfcStatus === 'nfc_blocked') return translate('no_camera', 'NFC Access Blocked/Unavailable');
    if (nfcStatus === 'nfc_unsupported') return translate('nfc_offline_online_test', 'Web NFC not supported on this device/browser');
    return nfcStatus;
  };

  useEffect(() => {
    // Check if Web NFC is supported
    if ('NDEFReader' in window) {
      setIsNfcSupported(true);
      const reader = new (window as any).NDEFReader();
      let active = true;

      const startNfcScan = async () => {
        try {
          await reader.scan();
          setNfcStatus('nfc_scanner_active');
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
                    setNfcStatus('card_scanned_success');
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
          setNfcStatus('nfc_blocked');
        }
      };

      startNfcScan();
      return () => {
        active = false;
      };
    } else {
      setIsNfcSupported(false);
      setNfcStatus('nfc_unsupported');
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
            {translate('SwasthyaTap', 'SwasthyaTap')}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Dropdown Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline-block">🌐 {translate('select_lang', 'Language')}:</span>
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="px-3 py-1.5 text-xs font-extrabold bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-health-blue-500 transition cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold text-slate-650 dark:text-slate-300 hover:text-health-blue-650 dark:hover:text-health-blue-400 transition"
          >
            {translate('staff_dashboard_login', 'Staff Dashboard Login')}
          </Link>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Info Side */}
          <motion.div
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-health-blue-105 dark:bg-health-blue-950/20 text-health-blue-750 dark:text-health-blue-400 rounded-full text-xs font-bold border border-health-blue-200/30 dark:border-health-blue-900/30">
              <Smartphone className="h-3.5 w-3.5" /> {translate('emergency_nfc_access', 'Instant Emergency Profile')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              {translate('tap_nfc', 'Tap to Scan.')} <br />
              <span className="bg-gradient-to-r from-health-blue-600 to-health-teal-650 dark:from-health-blue-400 dark:to-health-teal-400 bg-clip-text text-transparent">
                {translate('ob_title_1', 'Instantly Save Lives.')}
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              {translate('ob_desc_1', 'SwasthyaTap resolves tapped physical NFC medical cards to critical health profile summaries in high-stress emergency scenarios.')} 
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400 shrink-0">
                  <ShieldAlert className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{translate('critical_allergies_detected', 'Critical Warnings')}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">{translate('allergies_sub', 'Instant allergy and condition records.')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{translate('secure_header', '100% Secure')}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">{translate('secure_sub', 'Tokens hashed before lookup.')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Simulator Panel Side */}
          <motion.div
            className="lg:col-span-6 flex justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
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
                {translate('nfc_simulator_title', 'SwasthyaTap Card Reader')}
              </h2>
              <p className="mt-2 text-xs text-slate-450 dark:text-slate-400 text-center max-w-xs font-medium">
                {renderNfcStatus()}
              </p>

              <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50 my-6"></div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    {translate('scan_or_enter_code', 'Simulate Scan — Enter Card Token')}
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
                    translate('verify', 'Verify NFC Card')
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                  {translate('nfc_simulator_desc', 'Hint: Try')} <code className="px-1.5 py-0.5 bg-slate-200/85 dark:bg-slate-900 rounded border border-slate-300/40 dark:border-slate-700/40 text-slate-650 dark:text-slate-350 select-all">test-token-123</code>
                </span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full py-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} {translate('SwasthyaTap', 'SwasthyaTap')}. {translate('sec_footer', 'Built for secure emergency medical access.')}
      </footer>
    </div>
  );
}
