import React, { useState, useEffect } from 'react';
import { Patient, UrgencyLevel, VitalsData } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { aiService } from '../../services/aiService';
import {
  X,
  HeartPulse,
  Plus,
  Check,
  Search,
  Activity,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patientData: Partial<Patient>) => Promise<void>;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState('Male');
  const [contact, setContact] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [softWarning, setSoftWarning] = useState<string | null>(null);

  const [severity, setSeverity] = useState<number>(6.5);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent');
  const [provisionalDisease, setProvisionalDisease] = useState('');
  const [department, setDepartment] = useState('Emergency');
  const [bedNumber, setBedNumber] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('Dr. Mohd. Nazim');
  const [triageNotes, setTriageNotes] = useState('');

  // Vitals
  const [bp, setBp] = useState('125/82');
  const [heartRate, setHeartRate] = useState<number>(80);
  const [spo2, setSpo2] = useState<number>(97);
  const [temperature, setTemperature] = useState<number>(98.6);

  // Symptoms catalog & filter
  const [symptomCatalog, setSymptomCatalog] = useState<string[]>([]);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      aiService
        .getSymptomsCatalog()
        .then((res) => {
          setSymptomCatalog(res.symptoms || []);
        })
        .catch(() => {
          setSymptomCatalog([
            'Chest Pain (Retrosternal / Crushing)',
            'Pain Radiating to Left Arm / Jaw',
            'Diaphoresis (Profuse Cold Sweats)',
            'Sudden Unilateral Facial Droop',
            'Unilateral Arm or Leg Weakness (Hemiparesis)',
            'Slurred Speech / Dysphasia',
            'Thunderclap Severe Sudden Headache',
            'Severe Shortness of Breath / Dyspnea at Rest',
            'Low SpO2 Saturation (<92%)',
            'Stridor / Audible High-Pitched Wheezing',
            'Central Cyanosis (Bluish Lips/Nails)',
            'Massive External Hemorrhage / Arterial Bleed',
            'Compound Open Fracture with Exposed Bone',
            'Hematemesis (Vomiting Coffee-Ground Blood)',
            'Severe Rigid Board-like Abdominal Guarding',
            'Oliguria or Complete Anuria (<100ml urine in 24h)',
            'Moderate Intermittent Fever with Chills (<3 days)',
            'Mild Dyspepsia / Heartburn',
          ]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAddCustomSymptom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSym = customSymptomInput.trim();
    if (!cleanSym) return;

    if (selectedSymptoms.includes(cleanSym)) {
      setCustomSymptomInput('');
      return;
    }

    // Check if symptom exists in catalog
    const isKnown = symptomCatalog.some(
      (s) =>
        s.toLowerCase().includes(cleanSym.toLowerCase()) ||
        cleanSym.toLowerCase().includes(s.toLowerCase())
    );

    if (!isKnown) {
      setSoftWarning(
        `Soft Warning: "${cleanSym}" is uncataloged in the primary clinical knowledge base. AegisHealth AI will evaluate using correlated heuristics and remaining clinical markers without crashing.`
      );
    } else {
      setSoftWarning(null);
    }

    setSelectedSymptoms([...selectedSymptoms, cleanSym]);
    setCustomSymptomInput('');
  };

  const removeSymptom = (symToRemove: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symToRemove));
  };

  const filteredCatalog = symptomCatalog.filter((s) =>
    s.toLowerCase().includes(symptomSearch.toLowerCase())
  );

  // Dynamic Fuzzy Severity Labels & Colors
  const getSeverityMeta = (val: number) => {
    if (val >= 8.5) {
      return {
        label: 'Critical: Resuscitation Risk (ESI 1/2)',
        color: 'text-rose-700 dark:text-coral-400 font-bold',
        bg: 'bg-rose-50 border-rose-200 dark:bg-coral-500/10 dark:border-coral-500/30',
      };
    }
    if (val >= 6.5) {
      return {
        label: 'Severe: Priority Specialist (ESI 2/3)',
        color: 'text-amber-800 dark:text-amber-400 font-bold',
        bg: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
      };
    }
    if (val >= 3.6) {
      return {
        label: 'Moderate: Acute Observation (ESI 3/4)',
        color: 'text-teal-700 dark:text-clinical-400',
        bg: 'bg-teal-50 border-teal-200 dark:bg-clinical-500/10 dark:border-clinical-500/30',
      };
    }
    return {
      label: 'Mild: Ambulatory OPD (ESI 5)',
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
    };
  };

  const sevMeta = getSeverityMeta(severity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (selectedSymptoms.length === 0) {
      alert('Please select or enter at least one presenting symptom for AI decision support.');
      return;
    }

    setIsSubmitting(true);
    try {
      const vitalsObj: VitalsData = {
        bp,
        heart_rate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temperature),
      };

      await onSubmit({
        name,
        age: Number(age),
        gender,
        contact,
        symptoms: selectedSymptoms,
        severity: Number(severity),
        urgency,
        disease: provisionalDisease || 'Under Evaluation',
        assigned_department: department,
        bed_number: bedNumber || undefined,
        assigned_doctor: assignedDoctor,
        vitals: vitalsObj,
        triage_notes: triageNotes,
        status: 'Triage Evaluated',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <GlassCard className="p-6 max-h-[90vh] overflow-y-auto border-gray-200 dark:border-clinical-500/30">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 dark:bg-clinical-500/20 dark:text-clinical-400 dark:border-clinical-500/40 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Intake & AI Triage Registration</span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 dark:bg-clinical-500/10 dark:text-clinical-300 dark:border-clinical-500/30">
                    Decision Support Only
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Executes forward-chaining rules, Buchanan Certainty Factors & A* graph search upon submit.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Demographic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Contact Phone / Caregiver
                </label>
                <input
                  type="text"
                  placeholder="+91 98XXX XXXXX"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400" /> Intake Vital Signs
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">BP (mmHg)</span>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">Heart Rate</span>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">SpO2 (%)</span>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">Temp (°F)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Severity Slider & Urgency Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
              {/* Severity Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-slate-300">
                  <span>Severity Rating (Fuzzy Scale):</span>
                  <span className={`font-mono font-bold text-sm ${sevMeta.color}`}>
                    {severity.toFixed(1)} / 10.0
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full mt-2 accent-teal-600 cursor-pointer"
                />
                <div className={`mt-2 p-1.5 rounded-lg border text-[11px] font-semibold text-center ${sevMeta.bg} ${sevMeta.color}`}>
                  {sevMeta.label}
                </div>
              </div>

              {/* Urgency Selector */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Clinical Urgency Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Emergency">Emergency (Immediate Resuscitation)</option>
                  <option value="Urgent">Urgent (&lt;30 mins)</option>
                  <option value="Semi-Urgent">Semi-Urgent (&lt;60 mins)</option>
                  <option value="Non-Urgent">Non-Urgent (Standard OPD)</option>
                </select>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2">
                  Emergency triggers immediate Tier 1 critical resuscitation protocols.
                </p>
              </div>
            </div>

            {/* Symptom Chips & Free-form Input */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400" />
                  <span>Presenting Symptoms ({selectedSymptoms.length} selected)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400 dark:text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={symptomSearch}
                    onChange={(e) => setSymptomSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Free-form custom symptom entry */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type any custom or uncataloged symptom here..."
                  value={customSymptomInput}
                  onChange={(e) => setCustomSymptomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSymptom();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomSymptom()}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-teal-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-clinical-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Chip</span>
                </button>
              </div>

              {/* Soft Warning Banner (Quality Bar Requirement) */}
              {softWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                    <span className="font-bold text-amber-900 dark:text-amber-300">Soft Warning Triggered:</span>{' '}
                    {softWarning}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoftWarning(null)}
                    className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-white ml-auto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Selected Symptom Chips */}
              {selectedSymptoms.length > 0 && (
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1.5">
                    Selected Presenting Symptoms:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map((sym) => {
                      const isUncataloged = !symptomCatalog.some(
                        (s) =>
                          s.toLowerCase().includes(sym.toLowerCase()) ||
                          sym.toLowerCase().includes(s.toLowerCase())
                      );
                      return (
                        <span
                          key={sym}
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            isUncataloged
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                              : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 dark:bg-clinical-500/10 dark:text-clinical-300 dark:border-clinical-500/30'
                          }`}
                        >
                          <span>{sym}</span>
                          {isUncataloged && (
                            <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 font-mono">
                              custom
                            </span>
                          )}
                          <X
                            className="w-3 h-3 cursor-pointer ml-0.5 hover:text-rose-600 dark:hover:text-white"
                            onClick={() => toggleSymptom(sym)}
                          />
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Symptom Catalog Grid */}
              <div>
                <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1">
                  Or select from standardized clinical knowledge catalog:
                </p>
                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-white dark:bg-slate-950/80 border border-gray-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {symptomCatalog
                    .filter((s) => s.toLowerCase().includes(symptomSearch.toLowerCase()))
                    .slice(0, 30)
                    .map((sym) => {
                      const isChecked = selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => toggleSymptom(sym)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left ${
                            isChecked
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-semibold'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white'
                          }`}
                        >
                          {sym}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Department & Operational Placement */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Initial Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Emergency">Emergency Trauma</option>
                  <option value="Cardiology">Cardiology Care</option>
                  <option value="Neurology">Neurology Stroke</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Provisional Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Acute STEMI"
                  value={provisionalDisease}
                  onChange={(e) => setProvisionalDisease(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Bed Allocation</label>
                <input
                  type="text"
                  placeholder="e.g. ICU-04 (Optional)"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Triage Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Triage Officer Clinical Notes</label>
              <textarea
                rows={2}
                placeholder="Observed clinical signs, prior medical history, allergies..."
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400 flex-shrink-0" />
                <span>Runs Buchanan CF, fuzzy scoring & A* routing on submit.</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Evaluating AI Triage...' : 'Admit & Run AI Triage'}
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
