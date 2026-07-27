'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, HeartPulse } from 'lucide-react';
import { TRANSLATIONS } from '@/lib/translations';
import { MEDICAL_DATA_TRANSLATIONS } from '@/lib/medicalTranslations';

const LANGUAGES = [
  { code: 'English', name: 'English' },
  { code: 'Hindi',   name: 'हिन्दी (Hindi)' },
  { code: 'Bengali', name: 'বাংলা (Bengali)' },
  { code: 'Telugu',  name: 'తెలుగు (Telugu)' },
  { code: 'Tamil',   name: 'தமிழ் (Tamil)' },
  { code: 'Marathi', name: 'मराठी (Marathi)' },
  { code: 'Gujarati',  name: 'ગુજરાતી (Gujarati)' },
  { code: 'Kannada',   name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'Malayalam', name: 'മലയാളം (Malayalam)' },
  { code: 'Punjabi',   name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'Odia',      name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'Urdu',      name: 'اردو (Urdu)' },
];

function LoginForm() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  useEffect(() => {
    const savedLang = localStorage.getItem('swasthyatap_lang');
    if (savedLang) setSelectedLanguage(savedLang);
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

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (searchParams.get('expired')) {
      toast.error('Session expired. Please login again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(translate('msg_enter_fields', 'Please enter both email and password.'));
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success(translate('msg_success', 'Successfully logged in!'));
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || translate('msg_fail', 'Login failed. Please verify credentials.');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Full-screen smooth loading state
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute h-14 w-14 rounded-full bg-teal-500/20 animate-ping" />
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-400 tracking-wide animate-pulse">
            Authenticating…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-teal-400/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-blue-400/8 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl border border-white/20"
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Language selector */}
        <div className="flex justify-end mb-4">
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const newLang = e.target.value;
              setSelectedLanguage(newLang);
              localStorage.setItem('swasthyatap_lang', newLang);
            }}
            className="px-2.5 py-1.5 text-xs font-extrabold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none transition cursor-pointer hover:border-teal-400"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Logo + title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-health-teal-600 dark:text-health-teal-500 tracking-tight">
            {translate('login_title', 'SwasthyaTap')}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
            {translate('login_sub', 'Secure Health Portal Authentication')}
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.35 }}
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              {translate('email_addr', 'Email Address')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white shadow-inner placeholder-slate-400"
              placeholder="doctor@swasthyatap.com"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              {translate('password_label', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white shadow-inner"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-sm shadow-lg hover:shadow-teal-500/25 disabled:opacity-60 cursor-pointer overflow-hidden"
            style={{ transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isSubmitting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating…
                </motion.span>
              ) : (
                <motion.span
                  key="login"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  {translate('btn_auth', 'Authenticate')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative flex items-center justify-center">
          <span className="absolute h-14 w-14 rounded-full bg-teal-500/20 animate-ping" />
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
