'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  LogOut, User, Activity, FileText, Calendar, Heart, ShieldAlert,
  PhoneCall, MapPin, Pill, RefreshCw, Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'reports' | 'prescriptions' | 'timeline'>('profile');
  const [reportSearch, setReportSearch] = useState('');
  const [reportCategory, setReportCategory] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Queries
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data.data;
    },
    enabled: !!user,
  });

  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['reports', reportCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (reportCategory) params.append('category', reportCategory);
      const { data } = await api.get(`/reports?${params.toString()}`);
      return data.data;
    },
    enabled: !!user && activeTab === 'reports',
  });

  const { data: prescriptions, isLoading: prescriptionsLoading, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data } = await api.get('/prescriptions');
      return data.data;
    },
    enabled: !!user && activeTab === 'prescriptions',
  });

  const { data: timeline, isLoading: timelineLoading, refetch: refetchTimeline } = useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      const { data } = await api.get('/timeline');
      return data.data;
    },
    enabled: !!user && activeTab === 'timeline',
  });

  const handleRefresh = () => {
    if (activeTab === 'profile') refetchProfile();
    if (activeTab === 'reports') refetchReports();
    if (activeTab === 'prescriptions') refetchPrescriptions();
    if (activeTab === 'timeline') refetchTimeline();
    toast.success('Data refreshed successfully');
  };

  if (authLoading || !user || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-health-teal-600 border-t-transparent"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading medical dashboard...</p>
        </div>
      </div>
    );
  }

  // Filtered reports locally on search query
  const filteredReports = reports?.filter((r: any) => 
    r.title.toLowerCase().includes(reportSearch.toLowerCase()) || 
    r.doctorName.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.hospitalName.toLowerCase().includes(reportSearch.toLowerCase())
  ) || [];

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-health-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              ST
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">SwasthyaTap</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase">Patient Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-slate-250 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 text-sm font-semibold transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Left Column: Patient Profile Vitals */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center"
            >
              <div className="mx-auto w-24 h-24 rounded-full bg-health-teal-50 dark:bg-health-teal-950/30 flex items-center justify-center text-health-teal-600 dark:text-health-teal-400 mb-4 border border-health-teal-100 dark:border-health-teal-900/50">
                <User className="h-12 w-12" />
              </div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">{profile?.fullName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ID: {profile?.publicId}</p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                  <span className="text-lg font-extrabold text-red-600 dark:text-red-400">{profile?.bloodGroup}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gender</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 capitalize">{profile?.gender}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Contacts */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <PhoneCall className="h-4 w-4 text-health-teal-500" /> Contact Info
              </h3>
              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                {profile?.phone && (
                  <div className="flex items-start gap-3">
                    <PhoneCall className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Phone</p>
                      <p className="text-slate-850 dark:text-slate-200">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Address</p>
                      <p className="text-slate-850 dark:text-slate-200 leading-normal">{profile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Area: Navigation Tabs + Detail Panels */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
              {[
                { id: 'profile', label: 'Emergency Bio', icon: Activity },
                { id: 'reports', label: 'Lab Reports', icon: FileText },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                { id: 'timeline', label: 'Timeline', icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition cursor-pointer ${
                      activeTab === tab.id 
                        ? 'border-health-teal-600 text-health-teal-600 dark:border-health-teal-500 dark:text-health-teal-500' 
                        : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="min-h-[400px]">
              
              {/* Tab 1: Profile Vitals & Emergency */}
              {activeTab === 'profile' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Critical Allergies */}
                    <div className="bg-red-50/50 dark:bg-red-950/10 rounded-2xl p-6 border border-red-100 dark:border-red-950/30">
                      <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <ShieldAlert className="h-4 w-4" /> Critical Allergies
                      </h3>
                      {profile?.criticalAllergies && profile.criticalAllergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.criticalAllergies.map((allergy: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-red-100/70 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-900/50">
                              {formatUnderscores(allergy)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-red-600/70 dark:text-red-400/60 font-semibold">No critical allergies reported.</p>
                      )}
                    </div>

                    {/* Medical Conditions */}
                    <div className="bg-orange-50/50 dark:bg-orange-950/10 rounded-2xl p-6 border border-orange-100 dark:border-orange-950/30">
                      <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <Heart className="h-4 w-4" /> Active Conditions
                      </h3>
                      {profile?.medicalConditions && profile.medicalConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.medicalConditions.map((condition: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-orange-100/70 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-900/50">
                              {formatUnderscores(condition)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-orange-600/70 dark:text-orange-400/60 font-semibold">No active medical conditions reported.</p>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">
                      Emergency Contacts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.emergencyContacts?.map((contact: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{contact.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">{formatUnderscores(contact.relationship)}</p>
                          </div>
                          <a 
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-health-teal-50 dark:bg-health-teal-950/20 text-health-teal-650 dark:text-health-teal-400 rounded-lg text-xs font-bold hover:bg-health-teal-100 dark:hover:bg-health-teal-950/40 transition"
                          >
                            <PhoneCall className="h-3.5 w-3.5" /> Call
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Reports */}
              {activeTab === 'reports' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="space-y-6"
                >
                  {/* Filters & search */}
                  <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search reports by title, doctor, hospital..."
                        value={reportSearch}
                        onChange={(e) => setReportSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-health-teal-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-health-teal-500 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      <option value="lab">Laboratory</option>
                      <option value="imaging">Imaging (X-Ray, MRI)</option>
                      <option value="pathology">Pathology</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  {reportsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-health-teal-600 border-t-transparent"></div>
                    </div>
                  ) : filteredReports.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase bg-slate-50/50 dark:bg-slate-950/50">
                              <th className="py-4 px-6">Report</th>
                              <th className="py-4 px-6">Source</th>
                              <th className="py-4 px-6">Category</th>
                              <th className="py-4 px-6">Date</th>
                              <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold">
                            {filteredReports.map((report: any) => (
                              <tr key={report.publicId} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition">
                                <td className="py-4 px-6">
                                  <p className="font-bold text-slate-900 dark:text-white">{report.title}</p>
                                  {report.summary && <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{report.summary}</p>}
                                </td>
                                <td className="py-4 px-6">
                                  <p className="text-slate-800 dark:text-slate-200">Dr. {report.doctorName}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">{report.hospitalName}</p>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-bold uppercase">
                                    {report.category}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                                  {new Date(report.reportDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  {report.fileUrl ? (
                                    <a
                                      href={report.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-health-teal-600 text-white rounded-lg text-xs font-bold hover:bg-health-teal-700 transition"
                                    >
                                      Download
                                    </a>
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium">No Attachment</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-slate-400 font-medium">No medical reports match your search criteria.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Prescriptions */}
              {activeTab === 'prescriptions' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="space-y-6"
                >
                  {prescriptionsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-health-teal-600 border-t-transparent"></div>
                    </div>
                  ) : prescriptions && prescriptions.length > 0 ? (
                    <div className="space-y-6">
                      {prescriptions.map((p: any) => (
                        <div key={p.publicId} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 gap-4">
                            <div>
                              <span className="px-2.5 py-0.5 bg-health-emerald-50 dark:bg-health-emerald-950/20 text-health-emerald-650 dark:text-health-emerald-400 border border-health-emerald-150 dark:border-health-emerald-900/30 rounded-full text-xs font-extrabold tracking-wide uppercase">
                                Active Prescription
                              </span>
                              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">Diagnosis: {p.diagnosis}</h4>
                            </div>
                            <div className="text-left md:text-right text-xs font-semibold text-slate-500">
                              <p className="text-slate-700 dark:text-slate-350">Prescribed by Dr. {p.doctorName}</p>
                              <p className="text-slate-400 mt-0.5">{p.hospitalName}</p>
                              <p className="text-[10px] text-slate-400 uppercase mt-1">
                                Date: {new Date(p.prescribedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Prescribed Medicines</h5>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {p.medicines.map((m: any, idx: number) => (
                                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between gap-4">
                                  <div>
                                    <p className="font-extrabold text-slate-900 dark:text-white text-base">{m.name}</p>
                                    <p className="text-xs text-slate-400 mt-1 font-semibold">Dosage: {m.dosage} | Duration: {m.durationDays} Days</p>
                                    {m.instructions && <p className="text-xs text-health-teal-650 dark:text-health-teal-400 mt-1 font-semibold italic">Instructions: {m.instructions}</p>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {[
                                      { label: 'Morning', active: m.morning },
                                      { label: 'Afternoon', active: m.afternoon },
                                      { label: 'Night', active: m.night }
                                    ].map((sched) => (
                                      <span 
                                        key={sched.label}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                          sched.active 
                                            ? 'bg-health-teal-50 dark:bg-health-teal-950/20 text-health-teal-650 dark:text-health-teal-450 border-health-teal-200 dark:border-health-teal-900/50' 
                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-350 dark:text-slate-600 border-slate-100 dark:border-slate-900'
                                        }`}
                                      >
                                        {sched.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-slate-400 font-medium">No active prescriptions on record.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 4: Timeline */}
              {activeTab === 'timeline' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="space-y-6"
                >
                  {timelineLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-health-teal-600 border-t-transparent"></div>
                    </div>
                  ) : timeline && timeline.length > 0 ? (
                    <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-8 space-y-8">
                      {timeline.map((event: any) => (
                        <div key={event.publicId} className="relative">
                          {/* Dot indicator */}
                          <div className="absolute -left-12 top-1.5 h-8 w-8 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-850 shadow-sm">
                            <div className="h-3 w-3 rounded-full bg-health-teal-500"></div>
                          </div>
                          
                          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                              {new Date(event.eventDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </span>
                            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 capitalize">
                              {event.title}
                            </h4>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-bold uppercase mt-1">
                              Type: {event.eventType} {event.doctorName && `| Dr. ${event.doctorName}`} {event.hospitalName && `| ${event.hospitalName}`}
                            </p>
                            {event.description && (
                              <p className="text-slate-600 dark:text-slate-350 text-sm mt-3 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-slate-400 font-medium">No timeline events reported.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
