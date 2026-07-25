'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ChevronUp, ChevronDown, Check, Shield, AlertTriangle, Info,
  Phone, Eye, FileText, Bell, Lock, Circle, ExternalLink, Download,
  Activity, Heart, Pill, ShieldCheck, UserCheck, X, Printer, Search, Filter
} from 'lucide-react';
import { IPrescription, IMedicalReport } from '@/models/Citizen';

// Key translation dictionary for localized/database keys
const TRANSLATION_MAP: Record<string, string> = {
  // Navigation / Tabs
  nav_profile: "Profile Overview",
  reports_label: "Medical Reports",
  prescriptions_label: "Prescriptions",

  // Report Titles
  cbc_report: "Complete Blood Count (CBC)",
  lipid_profile: "Lipid Profile",
  thyroid_report: "Thyroid Profile (T3, T4, TSH)",
  chest_xray: "Chest X-Ray (PA View)",
  
  // Issuers / Labs / Doctors
  lab_name_city: "City Diagnostic Labs",
  lab_name_apollo: "Apollo Diagnostics",
  dr_amit_shah: "Dr. Amit Shah (MD, Cardiology)",
  dr_patel: "Dr. Patel (General Physician)",
  dr_singh: "Dr. Singh (Endocrinologist)",
  apollo_pharmacy: "Apollo Pharmacy",
  city_labs: "City Diagnostic Labs",

  // Statuses
  verified_report: "VERIFIED",
  verified: "VERIFIED",
  active: "ACTIVE",
  completed: "COMPLETED",
  
  // Generic
  none: "None"
};

function translate(key?: string): string {
  if (!key) return 'None';
  return TRANSLATION_MAP[key] || key;
}

export default function CardProfileViewer() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [activeTab, setActiveTab] = useState<'profile' | 'reports' | 'prescriptions'>('profile');

  // Search & Filter States
  const [rxSearchQuery, setRxSearchQuery] = useState('');
  const [rxStatusFilter, setRxStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [reportSearchQuery, setReportSearchQuery] = useState('');

  // Selected items for modal view
  const [selectedReport, setSelectedReport] = useState<IMedicalReport | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<IPrescription | null>(null);

  // Accordion open/close states
  const [medsExpanded, setMedsExpanded] = useState(true);
  const [conditionsExpanded, setConditionsExpanded] = useState(true);
  const [contactsExpanded, setContactsExpanded] = useState(true);
  const [insuranceExpanded, setInsuranceExpanded] = useState(true);

  // Fetch citizen data
  const { data: citizen, isLoading, isError } = useQuery({
    queryKey: ['cardProfile', token],
    queryFn: async () => {
      const { data } = await axios.get(`/api/card/${token}`);
      return data.data;
    },
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#018086] border-t-transparent"></div>
          <p className="text-[#64748B] font-bold text-sm">Loading SwasthyaTap Profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !citizen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-md text-center border border-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-[#0F172A]">Profile Not Found</h1>
          <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
            The profile could not be loaded. Please ensure the NFC card is registered and correctly configured.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const parseList = (val?: string): string[] => {
    if (!val || val.toLowerCase() === 'none') return [];
    return val.split(',').map(s => s.trim()).filter(Boolean);
  };

  const allergies = parseList(citizen.allergies);
  const medications = parseList(citizen.medications);
  const conditions = parseList(citizen.chronicConditions);

  // Heart + ECG SVG Logo
  const HeartEcgLogo = () => (
    <svg viewBox="0 0 100 100" className="w-[24px] h-[24px] text-[#018086] shrink-0">
      <path d="M50,85 C10,55 5,25 28,15 C42,10 50,26 50,26 C50,26 58,10 72,15 C90,25 90,55 50,85 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25,45 L38,45 L42,52 L47,30 L53,60 L57,45 L75,45" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // Filter Prescriptions
  const filteredPrescriptions = (citizen.prescriptions || []).filter((rx: IPrescription) => {
    const matchesSearch = 
      (rx.doctorName || '').toLowerCase().includes(rxSearchQuery.toLowerCase()) ||
      (rx.hospitalName || '').toLowerCase().includes(rxSearchQuery.toLowerCase()) ||
      (rx.diagnosis || '').toLowerCase().includes(rxSearchQuery.toLowerCase()) ||
      (rx.rxList || []).some((m: any) => (m.medicineName || '').toLowerCase().includes(rxSearchQuery.toLowerCase()));

    const matchesStatus = 
      rxStatusFilter === 'all' || 
      (rx.status || 'Active').toLowerCase() === rxStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Filter Reports
  const filteredReports = (citizen.medicalReports || []).filter((report: IMedicalReport) => {
    const titleStr = translate(report.title_key).toLowerCase();
    const doctorStr = translate(report.doctor_key).toLowerCase();
    const issuerStr = translate(report.issuer_key).toLowerCase();
    const query = reportSearchQuery.toLowerCase();

    return titleStr.includes(query) || doctorStr.includes(query) || issuerStr.includes(query);
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans antialiased text-[#0F172A] pb-12">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeartEcgLogo />
            <div>
              <span className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0F172A] font-outfit">
                SwasthyaTap
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 bg-teal-50 text-[#0F766E] border border-teal-200 rounded-md font-bold">
                NFC Public Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-600 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Token Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full text-[#15803D] text-xs font-bold shadow-xs">
              <Check className="h-3.5 w-3.5 text-[#16A34A] stroke-[3]" />
              <span>{translate('verified')}</span>
            </div>
          </div>
        </div>

        {/* 2. Sub Tab Switcher */}
        <div className="bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-start gap-2 md:gap-8 overflow-x-auto">
            {(['profile', 'reports', 'prescriptions'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 px-3 md:px-5 text-xs md:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'border-[#0F766E] text-[#0F766E]' 
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {translate(tab === 'profile' ? 'nav_profile' : tab === 'reports' ? 'reports_label' : 'prescriptions_label')}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Desktop / Tablet Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDEBAR: Personal Details, Allergies, Actions (4 Cols on Desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-5">
                
                {/* Personal Profile Card */}
                <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar with Security Overlay */}
                    <div className="relative shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150&q=80"
                        alt="Citizen Photo"
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#0F766E] object-cover shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#0F766E] rounded-full border-2 border-white">
                        <Shield className="h-3.5 w-3.5 text-white fill-current" />
                      </div>
                    </div>
                    {/* Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] truncate leading-tight font-outfit">
                        {citizen.fullName}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs md:text-sm font-semibold text-[#475569]">
                          {citizen.age ? `${citizen.age} Years Old` : 'Unknown Age'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold">
                          ID: {citizen.profileId || 'CIT-8921'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[1px] bg-[#E2E8F0]" />

                  {/* Blood Group Metric */}
                  <div className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 text-[#DC2626] fill-current">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold text-[#64748B] tracking-wider uppercase block">
                          Blood Group Metric
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Emergency Telemetry</span>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-center shadow-2xs">
                      <span className="text-lg md:text-xl font-black text-[#DC2626]">
                        {citizen.bloodGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Critical Allergies Box */}
                <div className="bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] p-5 rounded-3xl border border-[#FECDD3] space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#E11D48]" />
                    <span className="text-xs font-extrabold text-[#9F1239] tracking-wider uppercase">
                      Critical Allergies Detected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergies.length > 0 ? (
                      allergies.map((allergy, i) => (
                        <div key={i} className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#FDA4AF] rounded-full shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                          <span className="text-xs font-bold text-[#9F1239] uppercase">
                            {allergy}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm font-medium text-[#64748B] italic">None reported</span>
                    )}
                  </div>
                </div>

                {/* Emergency Actions Panel */}
                <div className="space-y-3">
                  {/* Alert Family SOS */}
                  <button
                    onClick={() => alert('Simulating emergency alert broadcasts to family contacts...')}
                    className="w-full bg-gradient-to-r from-[#B91C1C] to-[#EF4444] rounded-2xl p-4 flex items-center justify-between text-white border border-white/10 shadow-md hover:brightness-105 transition cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-white/20 rounded-full shrink-0 group-hover:scale-105 transition">
                        <Bell className="h-6 w-6 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-base font-black tracking-tight leading-tight">ALERT FAMILY</h3>
                        <p className="text-xs font-medium text-white/85 mt-0.5">Send instant SOS broadcasts</p>
                      </div>
                    </div>
                    <span className="text-white/80 font-bold shrink-0 text-lg group-hover:translate-x-1 transition">➔</span>
                  </button>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => alert('Calling Emergency Services 108...')}
                      className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] rounded-2xl p-3.5 flex items-center gap-3 text-white border border-white/10 shadow-sm hover:brightness-105 transition cursor-pointer text-left"
                    >
                      <div className="p-2 bg-white/20 rounded-full shrink-0">
                        <Phone className="h-4.5 w-4.5 text-white fill-current stroke-none" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold leading-tight">Call 108</h4>
                        <p className="text-[10.5px] font-medium text-white/85 mt-0.5">Ambulance</p>
                      </div>
                    </button>

                    <button
                      onClick={() => alert('Preparing secure hospital telemetry stream...')}
                      className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] rounded-2xl p-3.5 flex items-center gap-3 text-white border border-white/10 shadow-sm hover:brightness-105 transition cursor-pointer text-left"
                    >
                      <div className="p-2 bg-white/20 rounded-full shrink-0">
                        <span className="text-sm font-bold text-white">🏥</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold leading-tight">Share Data</h4>
                        <p className="text-[10.5px] font-medium text-white/85 mt-0.5">With Hospital</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* HIPAA Disclaimer Footer */}
                <div className="pt-1 flex items-center justify-center gap-2 text-center text-[#64748B]">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <p className="text-xs font-semibold leading-normal">
                    Telemetry data encrypted • SwasthyaTap NFC • HIPAA + DPDP Compliant
                  </p>
                </div>

              </div>

              {/* RIGHT MAIN AREA: Read Banner & Medical Accordion Sections (8 Cols on Desktop) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                
                {/* Card Read Confirmation Banner */}
                <div className="bg-gradient-to-r from-[#059669] to-[#10B981] rounded-3xl p-5 shadow-sm border border-[#059669]/10 flex flex-col sm:flex-row sm:items-center justify-between text-white gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full shrink-0">
                      <Check className="h-5 w-5 text-white stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold tracking-wide">
                        Card Read Successfully
                      </h3>
                      <p className="text-xs text-white/85 font-medium hidden sm:block">
                        Direct hardware authentication verified
                      </p>
                    </div>
                  </div>
                  <div className="self-end sm:self-auto px-3 py-1 bg-white/15 rounded-xl backdrop-blur-xs">
                    <span className="text-xs font-semibold text-white/95">
                      26 Jun 2025, 09:41 AM
                    </span>
                  </div>
                </div>

                {/* Medical Data Cards (2 Column Sub-Grid on Tablet/Desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Card 1: Active Medications */}
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
                    <div className="flex flex-1">
                      <div className="w-1.5 bg-[#0F766E] shrink-0" />
                      <div className="flex-1 flex flex-col">
                        <button
                          onClick={() => setMedsExpanded(!medsExpanded)}
                          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-teal-50 text-[#0F766E] rounded-xl font-bold text-sm">💊</span>
                            <span className="text-base font-bold text-[#0F172A]">Active Medications</span>
                          </div>
                          {medsExpanded ? <ChevronUp className="h-5 w-5 text-[#64748B]" /> : <ChevronDown className="h-5 w-5 text-[#64748B]" />}
                        </button>
                        {medsExpanded && (
                          <div className="border-t border-[#F1F5F9] divide-y divide-[#F1F5F9] flex-1">
                            {medications.length > 0 ? (
                              medications.map((med, i) => (
                                <div key={i} className="p-4 flex items-center justify-between text-xs font-semibold">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                                    <span className="font-bold text-[#1E293B] text-sm">{med}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-[#E0F2FE] text-[#0369A1] rounded-md font-bold text-[11px]">
                                      As Prescribed
                                    </span>
                                    <span className="text-[#64748B] font-semibold text-xs">Daily</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-xs text-[#64748B] italic">No active prescriptions</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Medical Conditions */}
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
                    <div className="flex flex-1">
                      <div className="w-1.5 bg-[#DC2626] shrink-0" />
                      <div className="flex-1 flex flex-col">
                        <button
                          onClick={() => setConditionsExpanded(!conditionsExpanded)}
                          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-rose-50 text-[#DC2626] rounded-xl font-bold text-sm">❤️</span>
                            <span className="text-base font-bold text-[#0F172A]">Medical Conditions</span>
                          </div>
                          {conditionsExpanded ? <ChevronUp className="h-5 w-5 text-[#64748B]" /> : <ChevronDown className="h-5 w-5 text-[#64748B]" />}
                        </button>
                        {conditionsExpanded && (
                          <div className="border-t border-[#F1F5F9] divide-y divide-[#F1F5F9] flex-1">
                            {conditions.length > 0 ? (
                              conditions.map((condition, i) => (
                                <div key={i} className="p-4 flex items-center justify-between text-xs font-semibold">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border-2 border-amber-500" />
                                    <span className="font-bold text-[#1E293B] text-sm">{condition}</span>
                                  </div>
                                  <span className="px-2.5 py-1 bg-orange-50 text-[#F97316] rounded-md font-bold text-[11px]">
                                    Monitored
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-xs text-[#64748B] italic">No conditions reported</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Emergency Contacts */}
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
                    <div className="flex flex-1">
                      <div className="w-1.5 bg-[#16A34A] shrink-0" />
                      <div className="flex-1 flex flex-col">
                        <button
                          onClick={() => setContactsExpanded(!contactsExpanded)}
                          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-emerald-50 text-[#16A34A] rounded-xl font-bold text-sm">📞</span>
                            <span className="text-base font-bold text-[#0F172A]">Emergency Contacts</span>
                          </div>
                          {contactsExpanded ? <ChevronUp className="h-5 w-5 text-[#64748B]" /> : <ChevronDown className="h-5 w-5 text-[#64748B]" />}
                        </button>
                        {contactsExpanded && (
                          <div className="border-t border-[#F1F5F9] divide-y divide-[#F1F5F9] flex-1">
                            {citizen.emergencyContacts && citizen.emergencyContacts.length > 0 ? (
                              citizen.emergencyContacts.map((contact: any, i: number) => (
                                <div key={i} className="p-4 flex items-center justify-between gap-3 text-xs">
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-[#1E293B] text-sm">{contact.name} ({contact.relation})</p>
                                    <p className="text-[#64748B] font-semibold text-xs">{contact.phone}</p>
                                  </div>
                                  <a
                                    href={`tel:${contact.phone}`}
                                    className="px-3.5 py-1.5 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-[#16A34A] font-extrabold tracking-wide text-xs hover:bg-emerald-50 transition cursor-pointer shrink-0"
                                  >
                                    CALL
                                  </a>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-xs text-[#64748B] italic">No contacts registered</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Insurance */}
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
                    <div className="flex flex-1">
                      <div className="w-1.5 bg-[#2563EB] shrink-0" />
                      <div className="flex-1 flex flex-col">
                        <button
                          onClick={() => setInsuranceExpanded(!insuranceExpanded)}
                          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-[#2563EB] rounded-xl font-bold text-sm">🛡️</span>
                            <span className="text-base font-bold text-[#0F172A]">Insurance Coverage</span>
                          </div>
                          {insuranceExpanded ? <ChevronUp className="h-5 w-5 text-[#64748B]" /> : <ChevronDown className="h-5 w-5 text-[#64748B]" />}
                        </button>
                        {insuranceExpanded && (
                          <div className="border-t border-[#F1F5F9] p-4 flex items-center justify-between text-xs flex-1">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-xl shrink-0">
                                <Shield className="h-6 w-6 fill-current" />
                              </div>
                              <div>
                                <p className="font-bold text-[#1E293B] text-sm truncate max-w-[160px] md:max-w-[200px]">
                                  {citizen.insuranceCompany || 'No Active Insurance'}
                                </p>
                                <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#E0F2FE] text-[#0369A1] rounded-md font-bold text-[10px]">
                                  {citizen.insuranceCompany ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-[#94A3B8] font-extrabold uppercase tracking-wide">Policy No</p>
                              <p className="text-xs font-bold text-[#334155] mt-0.5">{citizen.insurancePolicyNumber || 'N/A'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] rounded-3xl p-6 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white/20 rounded-2xl shrink-0">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">Medical Diagnostic Reports</h3>
                  <p className="text-xs md:text-sm text-white/90 font-medium">Encrypted clinical file storage retrieved from NFC tag</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/15 rounded-xl border border-white/20 text-xs font-bold shrink-0">
                {filteredReports.length} Available Documents
              </div>
            </div>

            {/* Search Input for Reports */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports by title, doctor name, or lab..."
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] shadow-2xs transition"
              />
            </div>

            {/* Reports Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.length > 0 ? (
                filteredReports.map((report: IMedicalReport, i: number) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-[#0F172A] text-base leading-tight">
                            {translate(report.title_key)}
                          </h4>
                          <p className="text-xs text-[#0F766E] font-bold mt-1">
                            👨‍⚕️ {translate(report.doctor_key)}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-[#DCFCE7] text-[#15803D] border border-emerald-200 rounded-lg font-extrabold text-[10.5px] shrink-0">
                          {translate(report.status_key)}
                        </span>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span>🏥 {translate(report.issuer_key)}</span>
                        <span>📅 {report.date}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 py-2.5 px-4 bg-[#F0FDF4] hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[#0F766E] text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        View Full Details
                      </button>
                      <button
                        onClick={() => alert(`Downloading verified PDF for ${translate(report.title_key)}...`)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-bold transition cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-sm font-semibold text-[#64748B]">
                  No matching medical reports found
                </div>
              )}
            </div>

          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#0284C7] to-[#0369A1] rounded-3xl p-6 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white/20 rounded-2xl shrink-0">
                  <Pill className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">Digital Prescriptions</h3>
                  <p className="text-xs md:text-sm text-white/90 font-medium">Verified doctor prescriptions and Rx medication logs from database</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/15 rounded-xl border border-white/20 text-xs font-bold shrink-0">
                {filteredPrescriptions.length} Prescriptions Listed
              </div>
            </div>

            {/* Search Bar + Filter Pills Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor name, hospital, diagnosis, or medicine..."
                  value={rxSearchQuery}
                  onChange={(e) => setRxSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] shadow-2xs transition"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shrink-0">
                {(['all', 'active', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRxStatusFilter(st)}
                    className={`px-3.5 py-2 text-xs font-extrabold uppercase rounded-xl transition cursor-pointer ${
                      rxStatusFilter === st 
                        ? 'bg-[#0284C7] text-white shadow-2xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescriptions Grid - Separate Cards in Formal Rx Pad Format */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((rx: IPrescription, i: number) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0284C7]" />

                    {/* Prescription Letterhead Header */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-[#0284C7] font-outfit">Rx</span>
                          <div>
                            <h4 className="font-extrabold text-[#0F172A] text-lg leading-tight">
                              {rx.doctorName || 'Doctor Prescription'}
                            </h4>
                            <p className="text-xs font-semibold text-slate-500">{rx.qualification}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-extrabold text-xs shrink-0 ${
                          rx.status === 'Active' ? 'bg-[#E0F2FE] text-[#0369A1] border border-sky-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {rx.status || 'Active'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span className="font-bold text-[#0F766E]">🏥 {rx.hospitalName}</span>
                        <span className="font-semibold text-slate-500">📅 {rx.date}</span>
                      </div>

                      {/* Diagnosis Banner */}
                      <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-100">
                        <span className="text-[10px] font-extrabold text-[#0369A1] uppercase tracking-wider block">Clinical Diagnosis</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{rx.diagnosis || 'General Consultation'}</p>
                      </div>
                    </div>

                    {/* Prescribed Medicines Summary Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5 text-[#0284C7]" />
                          Prescribed Medicines ({rx.rxList ? rx.rxList.length : 0})
                        </span>
                      </div>
                      
                      <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                        {rx.rxList && rx.rxList.length > 0 ? (
                          rx.rxList.map((med: any, idx: number) => (
                            <div key={idx} className="p-3 flex items-center justify-between gap-2 bg-slate-50/40">
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">{med.medicineName}</span>
                                {med.instructions && <span className="text-[10.5px] text-slate-500">{med.instructions}</span>}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-[#0284C7] block text-xs">{med.dosage}</span>
                                <span className="text-[10.5px] text-slate-500 font-medium">{med.frequency}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-400 italic">No medicines attached</div>
                        )}
                      </div>
                    </div>

                    {/* Doctor Notes Preview */}
                    {rx.doctorNotes && (
                      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs">
                        <span className="font-bold text-amber-900 block text-[10.5px] uppercase">Doctor Notes:</span>
                        <p className="text-slate-700 font-medium mt-0.5 line-clamp-2">{rx.doctorNotes}</p>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="pt-2 flex items-center gap-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="flex-1 py-2.5 px-4 bg-[#F0F9FF] hover:bg-sky-100 border border-sky-200 rounded-xl text-[#0284C7] text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        View Rx Document
                      </button>
                      <button
                        onClick={() => alert(`Downloading signed Rx PDF for ${rx.doctorName}...`)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-900 rounded-xl text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        title="Download Rx PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-sm font-semibold text-[#64748B]">
                  No matching prescriptions found
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* ─── MODAL 1: REPORT VIEW MODAL ────────────────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 pr-8">
              <div className="p-3 bg-teal-50 border border-teal-200 text-[#0F766E] rounded-2xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {translate(selectedReport.title_key)}
                </h3>
                <p className="text-xs text-[#64748B] font-semibold mt-0.5">
                  {translate(selectedReport.issuer_key)} • {selectedReport.date}
                </p>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100" />

            {/* Report Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Doctor</span>
                <span className="font-bold text-slate-800">{translate(selectedReport.doctor_key)}</span>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Sample Type</span>
                <span className="font-bold text-slate-800">{(selectedReport as any).sampleType || 'Whole Blood / Clinical'}</span>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Lab Ref No.</span>
                <span className="font-bold text-slate-800">{(selectedReport as any).labRefNo || 'LAB-9901-X'}</span>
              </div>
            </div>

            {/* Test Parameters Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#0F766E]" />
                Test Parameter Results
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="bg-slate-100/70 p-3 grid grid-cols-12 font-bold text-slate-600">
                  <span className="col-span-5">Parameter</span>
                  <span className="col-span-3 text-center">Result</span>
                  <span className="col-span-4 text-right">Reference Range</span>
                </div>
                {((selectedReport as any).testParameters && (selectedReport as any).testParameters.length > 0) ? (
                  (selectedReport as any).testParameters.map((param: any, idx: number) => (
                    <div key={idx} className="p-3 grid grid-cols-12 items-center font-medium">
                      <span className="col-span-5 font-bold text-slate-800">{param.parameter}</span>
                      <span className="col-span-3 text-center font-extrabold text-[#0F766E]">{param.result}</span>
                      <span className="col-span-4 text-right text-slate-500">{param.normalRange}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 italic">Imaging diagnostic report details attached</div>
                )}
              </div>
            </div>

            {/* Doctor Remarks */}
            {(selectedReport as any).doctorRemarks && (
              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/80 text-xs space-y-1">
                <span className="font-extrabold text-[#0F766E] block uppercase tracking-wider text-[10.5px]">Pathologist Remarks</span>
                <p className="text-slate-700 font-medium leading-relaxed">{(selectedReport as any).doctorRemarks}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Downloading verified PDF report for ${translate(selectedReport.title_key)}...`)}
                className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL 2: PRESCRIPTION VIEW MODAL ─────────────────────────────────── */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPrescription(null)}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header: Rx Document Format */}
            <div className="flex items-start justify-between pr-8 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#0284C7] font-outfit">Rx</span>
                  <h3 className="text-xl font-bold text-[#0F172A]">{selectedPrescription.doctorName}</h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedPrescription.qualification}</p>
                <p className="text-xs text-[#0F766E] font-bold mt-0.5">{selectedPrescription.hospitalName}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-sky-50 text-[#0284C7] border border-sky-200 rounded-full font-bold text-xs">
                  {selectedPrescription.status || 'Active'}
                </span>
                <p className="text-xs text-slate-400 font-medium mt-1">Date: {selectedPrescription.date}</p>
              </div>
            </div>

            {/* Diagnosis Banner */}
            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 text-xs">
              <span className="text-[10.5px] font-bold text-[#0369A1] uppercase tracking-wider block">Clinical Diagnosis</span>
              <p className="text-base font-extrabold text-[#0F172A] mt-0.5">{selectedPrescription.diagnosis}</p>
            </div>

            {/* Prescribed Rx Medications Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Pill className="h-4 w-4 text-[#0284C7]" />
                Prescribed Medications (Rx)
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="bg-slate-100/70 p-3 grid grid-cols-12 font-bold text-slate-600">
                  <span className="col-span-4">Medicine</span>
                  <span className="col-span-3">Dosage</span>
                  <span className="col-span-3">Frequency</span>
                  <span className="col-span-2 text-right">Duration</span>
                </div>
                {selectedPrescription.rxList && selectedPrescription.rxList.length > 0 ? (
                  selectedPrescription.rxList.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 grid grid-cols-12 items-center font-medium">
                      <div className="col-span-4">
                        <p className="font-extrabold text-slate-900 text-xs">{item.medicineName}</p>
                        {item.instructions && <p className="text-[10px] text-slate-500 mt-0.5">{item.instructions}</p>}
                      </div>
                      <span className="col-span-3 font-semibold text-slate-700">{item.dosage}</span>
                      <span className="col-span-3 font-semibold text-[#0284C7]">{item.frequency}</span>
                      <span className="col-span-2 text-right font-bold text-slate-800">{item.duration}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 italic">No medications specified</div>
                )}
              </div>
            </div>

            {/* Doctor Advice / Notes */}
            {selectedPrescription.doctorNotes && (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-xs space-y-1">
                <span className="font-extrabold text-amber-800 block uppercase tracking-wider text-[10.5px]">Doctor Instructions & Advice</span>
                <p className="text-slate-800 font-medium leading-relaxed">{selectedPrescription.doctorNotes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Printer className="h-4 w-4" />
                Print Rx
              </button>
              <button
                onClick={() => alert(`Downloading signed PDF prescription Rx...`)}
                className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition"
              >
                <Download className="h-4 w-4" />
                Download Prescription PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
