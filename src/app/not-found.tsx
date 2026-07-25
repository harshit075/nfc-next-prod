'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';

/**
 * NotFound Page Component.
 * Custom 404 page for unmatched routes.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-xl text-center border border-white/20"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-health-teal-550/10 text-health-teal-600 dark:text-health-teal-400">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-4xl font-black text-health-teal-605 dark:text-health-teal-500">
          404
        </h1>
        <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          The requested page does not exist or has been relocated.
        </p>
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-health-teal-600 text-white text-sm font-semibold hover:bg-health-teal-750 shadow transition cursor-pointer"
          >
            <Home className="h-4 w-4" /> Go Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
