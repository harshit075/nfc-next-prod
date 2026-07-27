'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  RefreshCw, Plus, Trash2, 
  FileText, ArrowRight, Save, Check 
} from 'lucide-react';
import PatientSummaryCard from '@/components/hospital/PatientSummaryCard';

import type { Variants } from 'framer-motion';

const sectionVariants: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, delay: i * 0.07, ease: 'easeOut' },
  }),
};

interface MedicineRow {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function CreatePrescriptionPage() {
  const router = useRouter();

  // Form State
  const [prescriptionId, setPrescriptionId] = useState('RX-2026-891');
  const [date, setDate] = useState('2026-06-24');
  const [hospitalName, setHospitalName] = useState('Apollo Speciality Hospital');
  const [doctorName, setDoctorName] = useState('Dr. Amit Shah');
  const [qualification, setQualification] = useState('MD (Cardiology), FACC');
  const [status, setStatus] = useState('Active');
  
  const [diagnosis, setDiagnosis] = useState('Mild Hypertension & Preventive Checkup');
  const [doctorNotes, setDoctorNotes] = useState('Low sodium diet, Regular exercise. Next follow up after 30 days.');

  // Medications state
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    {
      id: '1',
      name: 'Telmisartan 40mg',
      dosage: '1 Tablet',
      frequency: 'Once Daily (Morning)',
      duration: '30 Days',
      instructions: 'After breakfast',
    },
    {
      id: '2',
      name: 'Amlodipine 5mg',
      dosage: '1 Tablet',
      frequency: 'Once Daily (Night)',
      duration: '30 Days',
      instructions: 'After dinner',
    },
    {
      id: '3',
      name: 'Multivitamin Complex',
      dosage: '1 Capsule',
      frequency: 'Once Daily',
      duration: '15 Days',
      instructions: 'After meal',
    },
  ]);

  const generateNewRxId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `RX-2026-${randomNum}`;
    setPrescriptionId(newId);
    toast.success(`Generated new Rx ID: ${newId}`);
  };

  const handleAddMedicine = () => {
    const newMed: MedicineRow = {
      id: Date.now().toString(),
      name: 'Paracetamol 500mg',
      dosage: '1 Tablet',
      frequency: 'Twice Daily',
      duration: '5 Days',
      instructions: 'After meal',
    };
    setMedicines([...medicines, newMed]);
    toast.info('Added new medicine row');
  };

  const handleRemoveMedicine = (id: string) => {
    if (medicines.length <= 1) {
      toast.warning('Prescription must have at least one medicine');
      return;
    }
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof MedicineRow, value: string) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSaveDraft = () => {
    toast.success('Prescription draft saved successfully');
  };

  const handleGeneratePDF = () => {
    toast.info('Generating Prescription PDF...');
    setTimeout(() => {
      toast.success('PDF generated and ready for download!');
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis');
      return;
    }
    toast.success('Prescription saved and assigned to patient profile!');
    setTimeout(() => {
      router.push('/hospital/reports/upload');
    }, 1200);
  };

  return (
    <motion.div
      className="space-y-6 pb-12"
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumb */}
      <motion.div variants={sectionVariants} custom={0} className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/hospital" className="hover:text-slate-900 transition">Prescriptions</Link>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">Create Prescription</span>
      </motion.div>

      {/* Patient Summary */}
      <motion.div variants={sectionVariants} custom={1}>
        <PatientSummaryCard />
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Prescription Details */}
        <motion.div variants={sectionVariants} custom={2} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-900">
            Prescription Details
          </h3>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Prescription ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Prescription ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={generateNewRxId}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-teal-600 transition cursor-pointer"
                  title="Generate new Rx ID"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Hospital Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hospital Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Apollo Speciality Hospital">Apollo Speciality Hospital</option>
                <option value="Max Super Speciality Hospital">Max Super Speciality Hospital</option>
                <option value="Fortis Healthcare">Fortis Healthcare</option>
                <option value="AIIMS New Delhi">AIIMS New Delhi</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Doctor Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Doctor Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Dr. Amit Shah">Dr. Amit Shah</option>
                <option value="Dr. Priya Verma">Dr. Priya Verma</option>
                <option value="Dr. Vikram Roy">Dr. Vikram Roy</option>
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Qualification <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                </select>
                <span className="absolute left-3 top-3.5 w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>

          {/* Row 3: Diagnosis & Doctor Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Diagnosis <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={200}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Enter diagnosis..."
                  required
                />
                <span className="absolute right-3 bottom-2 text-[10px] text-slate-400 font-semibold">
                  {diagnosis.length}/200
                </span>
              </div>
            </div>

            {/* Doctor Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Doctor Notes
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={200}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Enter special instructions or diet notes..."
                />
                <span className="absolute right-3 bottom-2 text-[10px] text-slate-400 font-semibold">
                  {doctorNotes.length}/200
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Medications Table */}
        <motion.div variants={sectionVariants} custom={3} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Medications
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4 w-36">Dosage</th>
                  <th className="py-3 px-4 w-48">Frequency</th>
                  <th className="py-3 px-4 w-32">Duration</th>
                  <th className="py-3 px-4">Instructions</th>
                  <th className="py-3 px-4 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {medicines.map((med, index) => (
                  <tr key={med.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <select
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        <option value="Telmisartan 40mg">Telmisartan 40mg</option>
                        <option value="Amlodipine 5mg">Amlodipine 5mg</option>
                        <option value="Multivitamin Complex">Multivitamin Complex</option>
                        <option value="Metformin 500mg">Metformin 500mg</option>
                        <option value="Paracetamol 650mg">Paracetamol 650mg</option>
                        <option value="Atorvastatin 10mg">Atorvastatin 10mg</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(med.id, 'dosage', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        <option value="1 Tablet">1 Tablet</option>
                        <option value="2 Tablets">2 Tablets</option>
                        <option value="1 Capsule">1 Capsule</option>
                        <option value="5 ml">5 ml</option>
                        <option value="10 ml">10 ml</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        <option value="Once Daily (Morning)">Once Daily (Morning)</option>
                        <option value="Once Daily (Night)">Once Daily (Night)</option>
                        <option value="Once Daily">Once Daily</option>
                        <option value="Twice Daily">Twice Daily</option>
                        <option value="Thrice Daily">Thrice Daily</option>
                        <option value="As Needed">As Needed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(med.id, 'duration', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleUpdateMedicine(med.id, 'instructions', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Medicine"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Medicine Button */}
          <div>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="inline-flex items-center gap-2 px-4 py-2 border border-teal-600/60 text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medicine</span>
            </button>
          </div>
        </motion.div>

        {/* Bottom Actions Bar */}
        <motion.div variants={sectionVariants} custom={4} className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-2"
            >
              <Save className="h-4 w-4 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePDF}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Generate PDF</span>
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>Preview &amp; Save Prescription</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
