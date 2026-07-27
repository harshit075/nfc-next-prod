'use client';

import React from 'react';
import { Eye } from 'lucide-react';

interface PatientSummaryProps {
  patient?: {
    name: string;
    publicId: string;
    age: number;
    gender: string;
    bloodGroup: string;
    phone: string;
    address: string;
    avatarUrl?: string;
  };
}

export default function PatientSummaryCard({ patient }: PatientSummaryProps) {
  const defaultPatient = {
    name: 'Rajesh Kumar',
    publicId: 'SWA123456',
    age: 45,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '9876543210',
    address: '123, Green Park, New Delhi - 110016',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=160&h=160&q=80',
  };

  const p = patient || defaultPatient;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
      {/* Left: Avatar + Details */}
      <div className="flex items-center gap-4">
        <img
          src={p.avatarUrl}
          alt={p.name}
          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
        />
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{p.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-semibold text-slate-600">
            <span className="text-slate-700 font-bold">{p.publicId}</span>
            <span className="text-slate-300">•</span>
            <span>{p.age} Y / {p.gender}</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-800">{p.bloodGroup}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">{p.phone}</span>
          </div>
        </div>
      </div>

      {/* Center: Address */}
      <div className="md:border-l md:border-slate-200 md:pl-6 text-left">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
        <p className="text-xs font-bold text-slate-800 mt-0.5 max-w-xs">{p.address}</p>
      </div>

      {/* Right: Action Button */}
      <div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
        >
          <Eye className="h-4 w-4 text-slate-500" />
          <span>View Full Profile</span>
        </button>
      </div>
    </div>
  );
}
