'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  UploadCloud, FileText, X, ArrowRight, Check, Calendar as CalendarIcon 
} from 'lucide-react';
import PatientSummaryCard from '@/components/hospital/PatientSummaryCard';

interface UploadedFileItem {
  name: string;
  size: string;
  type: string;
}

export default function UploadReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [reportTitle, setReportTitle] = useState('Blood Test - CBC');
  const [issuer, setIssuer] = useState('Lal Pathlabs');
  const [doctor, setDoctor] = useState('Dr. Amit Shah');
  const [reportDate, setReportDate] = useState('2026-06-24');
  const [status, setStatus] = useState('Verified');

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<UploadedFileItem | null>({
    name: 'CBC_Report_24Jun2026.pdf',
    size: '1.2 MB',
    type: 'pdf',
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFile({
        name: file.name,
        size: `${sizeMb} MB`,
        type: file.name.split('.').pop() || 'file',
      });
      toast.success(`Attached file: ${file.name}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFile({
        name: file.name,
        size: `${sizeMb} MB`,
        type: file.name.split('.').pop() || 'file',
      });
      toast.success(`Attached file: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    toast.info('File removed');
  };

  const handleCancel = () => {
    router.push('/hospital/prescriptions/create');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      toast.error('Please enter a report title');
      return;
    }
    if (!uploadedFile) {
      toast.error('Please attach at least one report file');
      return;
    }
    toast.success('Medical report uploaded and verified successfully!');
    setTimeout(() => {
      router.push('/hospital/prescriptions/create');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/hospital" className="hover:text-slate-900 transition">
          Medical Reports
        </Link>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">Upload Medical Report</span>
      </div>

      {/* Patient Summary Header Card */}
      <PatientSummaryCard />

      <form onSubmit={handleSubmit}>
        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Report Information */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-5">
              <h3 className="text-base font-extrabold text-slate-900">
                Report Information
              </h3>

              {/* Report Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Report Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Blood Test - CBC"
                  required
                />
              </div>

              {/* Issuer / Lab / Center */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Issuer / Lab / Center <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Lal Pathlabs"
                  required
                />
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Doctor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="Dr. Amit Shah">Dr. Amit Shah</option>
                  <option value="Dr. Priya Verma">Dr. Priya Verma</option>
                  <option value="Dr. Vikram Roy">Dr. Vikram Roy</option>
                </select>
              </div>

              {/* Row: Report Date & Status */}
              <div className="grid grid-cols-2 gap-4">
                {/* Report Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Report Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer pl-8"
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <span className="absolute left-3 top-3.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button at bottom left */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Column: Upload Files */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-5">
              <h3 className="text-base font-extrabold text-slate-900">
                Upload Files
              </h3>

              {/* Dropzone Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50/40'
                    : 'border-slate-300/80 hover:border-teal-500 bg-slate-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />

                <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3 border border-teal-100">
                  <UploadCloud className="h-6 w-6 text-[#0F766E]" />
                </div>

                <p className="text-xs font-bold text-slate-700">
                  Drag &amp; drop files here
                </p>
                <p className="text-[11px] text-slate-400 font-semibold my-1">
                  or
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer my-1"
                >
                  Browse Files
                </button>

                <p className="text-[10px] text-slate-400 font-medium mt-3">
                  Supported: PDF, JPG, PNG, JPEG (Max 10MB each)
                </p>
              </div>

              {/* Uploaded File List Item */}
              {uploadedFile && (
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                      PDF
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {uploadedFile.size}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Report Button at bottom right */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>Upload Report</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
