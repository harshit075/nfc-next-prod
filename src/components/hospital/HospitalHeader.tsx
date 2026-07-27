'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ChevronDown, HeartPulse, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LANGUAGES = [
  { code: 'English',   name: 'English' },
  { code: 'Hindi',     name: 'हिन्दी (Hindi)' },
  { code: 'Bengali',   name: 'বাংলা (Bengali)' },
  { code: 'Telugu',    name: 'తెలుగు (Telugu)' },
  { code: 'Tamil',     name: 'தமிழ் (Tamil)' },
  { code: 'Marathi',   name: 'मराठी (Marathi)' },
  { code: 'Gujarati',  name: 'ગુજરાતી (Gujarati)' },
];

export default function HospitalHeader() {
  const [selectedLang, setSelectedLang] = useState('English');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useAuth?.() ?? { logout: () => {} };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-6 py-3 flex items-center justify-between"
      style={{ willChange: 'transform' }}
    >
      {/* Brand Logo */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-md">
            <HeartPulse className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            SwasthyaTap
          </span>
        </div>
        <span className="px-2.5 py-0.5 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 rounded-md tracking-wide">
          Hospital Portal
        </span>
      </motion.div>

      {/* Right Controls */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Language Selector */}
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer hover:border-teal-400 transition-all"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        {/* Verified Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
          <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
          <span>Verified</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
            >
              5
            </motion.span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer outline-none"
          >
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?fit=crop&w=120&h=120&q=80"
              alt="Dr. Amit Shah"
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">Dr. Amit Shah</p>
              <p className="text-[10px] text-slate-500 font-semibold">Cardiologist</p>
            </div>
            <motion.div animate={{ rotate: showUserMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </motion.div>
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50"
                style={{ willChange: 'opacity, transform' }}
              >
                <button
                  onClick={() => { logout?.(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </header>
  );
}
