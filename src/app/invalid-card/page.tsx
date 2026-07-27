'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TRANSLATIONS } from '@/lib/translations';
import { MEDICAL_DATA_TRANSLATIONS } from '@/lib/medicalTranslations';

const LANGUAGES = [
  { code: 'English', name: 'English' },
  { code: 'Hindi', name: 'हिन्दी (Hindi)' },
  { code: 'Bengali', name: 'বাংলা (Bengali)' },
  { code: 'Telugu', name: 'తెలుగు (Telugu)' },
  { code: 'Tamil', name: 'தமிழ் (Tamil)' },
  { code: 'Marathi', name: 'मраठী (Marathi)' },
  { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
  { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'Malayalam', name: 'മലയാളം (Malayalam)' },
  { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'Odia', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'Urdu', name: 'اردو (Urdu)' }
];

export default function InvalidCard(): React.JSX.Element {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('swasthyatap_lang');
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  const translate = (key: string, fallback: string): string => {
    const lang = selectedLanguage || 'English';
    const medDict = MEDICAL_DATA_TRANSLATIONS[lang] || MEDICAL_DATA_TRANSLATIONS['English'] || {};
    if (medDict[key]) return medDict[key];
    const normalizedKey = key.toLowerCase().trim();
    if (medDict[normalizedKey]) return medDict[normalizedKey];

    const dict = TRANSLATIONS[selectedLanguage] || TRANSLATIONS['English'] || {};
    if (dict[key]) return dict[key];
    if (dict[normalizedKey]) return dict[normalizedKey];

    return fallback;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-xl border border-red-500/20 dark:border-red-500/10"
      >
        <div className="flex justify-end mb-4">
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const newLang = e.target.value;
              setSelectedLanguage(newLang);
              localStorage.setItem('swasthyatap_lang', newLang);
            }}
            className="px-2.5 py-1.5 text-xs font-extrabold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none transition cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white font-outfit">
          {translate('invalid_card_title', 'Invalid Card Scanned')}
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {translate('invalid_card_desc', 'The scanned NFC token is invalid, deactivated, or expired. Please contact SwasthyaTap administration support if this persists.')}
        </p>
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" /> {translate('back_to_login', 'Back to Login Portal')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
