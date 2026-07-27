'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, Users, FileText, FileCheck, Calendar, CreditCard, 
  BarChart3, DollarSign, UserCheck, Settings, HelpCircle, Building2 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',       href: '/hospital',                          icon: LayoutGrid },
  { name: 'Patients',        href: '/hospital/patients',                  icon: Users },
  { name: 'Prescriptions',   href: '/hospital/prescriptions/create',      icon: FileText },
  { name: 'Medical Reports', href: '/hospital/reports/upload',            icon: FileCheck },
  { name: 'Appointments',    href: '/hospital/appointments',              icon: Calendar },
  { name: 'NFC Cards',       href: '/hospital/nfc-cards',                 icon: CreditCard },
  { name: 'Analytics',       href: '/hospital/analytics',                 icon: BarChart3 },
  { name: 'Billing',         href: '/hospital/billing',                   icon: DollarSign },
  { name: 'Users & Staff',   href: '/hospital/staff',                     icon: UserCheck },
  { name: 'Settings',        href: '/hospital/settings',                  icon: Settings },
  { name: 'Help & Support',  href: '/hospital/help',                      icon: HelpCircle },
];

export default function HospitalSidebar() {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) =>
    pathname === item.href ||
    (item.name === 'Prescriptions' && pathname.includes('prescriptions')) ||
    (item.name === 'Medical Reports' && pathname.includes('reports'));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] flex flex-col justify-between p-4 shrink-0">
      {/* Navigation Items */}
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold group outline-none"
            >
              {/* Animated background pill */}
              {active && (
                <motion.span
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-xl bg-teal-50/90 border border-teal-200/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              {/* Hover background (non-active) */}
              {!active && (
                <span className="absolute inset-0 rounded-xl bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              )}

              {/* Active left accent bar */}
              {active && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r-full bg-teal-700"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              <Icon
                className={`relative h-4 w-4 shrink-0 transition-colors duration-150 ${
                  active ? 'text-[#0F766E]' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span
                className={`relative transition-colors duration-150 ${
                  active ? 'text-[#0F766E]' : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Hospital Profile Card */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover-lift cursor-pointer">
          <div className="h-9 w-9 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">
              Apollo Speciality Hospital
            </p>
            <p className="text-[10px] text-slate-500 font-semibold truncate">
              New Delhi, India
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
