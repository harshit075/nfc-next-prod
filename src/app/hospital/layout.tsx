'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import HospitalHeader from '@/components/hospital/HospitalHeader';
import HospitalSidebar from '@/components/hospital/HospitalSidebar';

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <HospitalHeader />
      <div className="flex flex-1">
        <HospitalSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: 0.28,
                ease: [0.23, 1, 0.32, 1],
              }}
              style={{ willChange: 'opacity, transform' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
