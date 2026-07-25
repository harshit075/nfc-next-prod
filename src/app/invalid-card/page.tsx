'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Invalid Card Page.
 * Displayed when an scanned NFC token is invalid, expired, or non-existent.
 */
export default function InvalidCard(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-xl text-center border border-red-500/20 dark:border-red-500/10"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
          Invalid Card Scanned
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          The scanned NFC token is invalid, deactivated, or expired. Please contact SwasthyaTap administration support if this persists.
        </p>
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
