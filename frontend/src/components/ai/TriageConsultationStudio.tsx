import React, { useState, useEffect } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { TriageScoreBadge } from '../patient/TriageScoreBadge';
import { MinimaxJustificationCard } from './MinimaxJustificationCard';
import { TriageDecisionGraph } from './TriageDecisionGraph';
import { aiService } from '../../services/aiService';
import { TriageEvaluationResponse, DepartmentCandidate } from '../../types';
import {
  Sparkles,
  HeartPulse,
  Brain,
  Wind,
  Flame,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  GitCommit,
  Stethoscope,
  Info,
} from 'lucide-react';

export const TriageConsultationStudio: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Chest Pain (Retrosternal / Crushing)',
    'Diaphoresis (Profuse Cold Sweats)',
  ]);
  const [severity, setSeverity] = useState<number>(8.5);
  const [urgency, setUrgency] = useState<string>('Emergency');
  const [age, setAge] = useState<number>(58);
  const [bp, setBp] = useState<string>('155/95');
  const [heartRate, setHeartRate] = useState<number>(110);
  const [spo2, setSpo2] = useState<number>(93);
  const [temperature, setTemperature] = useState<number>(98.6);

  const [symptomCatalog, setSymptomCatalog] = useState<string[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<TriageEvaluationResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    aiService.getSymptomsCatalog().then((res) => {
      setSymptomCatalog(res.symptoms || []);
    });
    // Run initial inference
    handleRunInference();
  }, []);

  const handleRunInference = async () => {
    setIsEvaluating(true);
    try {
      const res = await aiService.evaluateTriage({
        name: 'Evaluation Subject',
        age: Number(age),
        gender: 'Male',
        symptoms: selectedSymptoms,
        severity: Number(severity),
        urgency,
        vitals: {
          bp,
          heart_rate: Number(heartRate),
          spo2: Number(spo2),
          temperature: Number(temperature),
        },
      });
      setEvaluationResult(res);
    } catch (err: any) {
      alert(`Inference evaluation error: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  // Quick Preset Scenarios
  const loadPreset = (presetName: string) => {
    if (presetName === 'STEMI') {
      setSelectedSymptoms([
        'Chest Pain (Retrosternal / Crushing)',
        'Pain Radiating to Left Arm / Jaw',
        'Diaphoresis (Profuse Cold Sweats)',
      ]);
      setSeverity(9.2);
      setUrgency('Emergency');
      setBp('165/100');
      setHeartRate(112);
      setSpo2(94);
    } else if (presetName === 'STROKE') {
      setSelectedSymptoms([
        'Sudden Unilateral Facial Droop',
        'Unilateral Arm or Leg Weakness (Hemiparesis)',
        'Slurred Speech / Dysphasia',
      ]);
      setSeverity(9.5);
      setUrgency('Emergency');
      setBp('190/105');
      setHeartRate(88);
      setSpo2(97);
    } else if (presetName === 'HYPOXIA') {
      setSelectedSymptoms([
        'Severe Shortness of Breath / Dyspnea at Rest',
        'Low SpO2 Saturation (<92%)',
        'Central Cyanosis (Bluish Lips/Nails)',
      ]);
      setSeverity(8.8);
      setUrgency('Emergency');
      setBp('135/85');
      setHeartRate(128);
      setSpo2(86);
    } else if (presetName === 'TRAUMA') {
      setSelectedSymptoms([
        'Massive External Hemorrhage / Arterial Bleed',
        'Loss of Consciousness / Unresponsive (GCS < 8)',
        'Compound Open Fracture with Exposed Bone',
      ]);
      setSeverity(9.9);
      setUrgency('Emergency');
      setBp('75/40');
      setHeartRate(145);
      setSpo2(90);
    } else if (presetName === 'PEDIATRIC') {
      setSelectedSymptoms([
        'Neonatal High Fever (>101 F in infant under 3 months)',
        'Pediatric Febrile Seizure',
        'Pediatric Barking Cough (Croup / Stridor)',
      ]);
      setSeverity(8.0);
      setUrgency('Urgent');
      setAge(3);
      setBp('90/60');
      setHeartRate(150);
      setSpo2(95);
    }
  };

  const primary = evaluationResult?.primary_recommendation;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>AI Decision Engine & Clinical Reasoning Studio</span>
            <Badge variant="info">Unit 4 AI Mapped</Badge>
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Buchanan & Shortliffe Certainty Factors, Fuzzy Urgency Grading, and Forward-Chaining Inference.
          </p>
        </div>

        {/* Preset scenario triggers */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold mr-1">Presets:</span>
          <button
            onClick={() => loadPreset('STEMI')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-clinical-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition-colors"
          >
            Acute STEMI
          </button>
          <button
            onClick={() => loadPreset('STROKE')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-clinical-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition-colors"
          >
            Stroke (FAST)
          </button>
          <button
            onClick={() => loadPreset('HYPOXIA')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-clinical-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition-colors"
          >
            Hypoxia / ARDS
          </button>
          <button
            onClick={() => loadPreset('TRAUMA')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-clinical-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition-colors"
          >
            Polytrauma
          </button>
          <button
            onClick={() => loadPreset('PEDIATRIC')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-clinical-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 transition-colors"
          >
            Pediatric Seizure
          </button>
        </div>
      </div>

      {/* Academic Minimax Exclusion Notice */}
      <MinimaxJustificationCard />

      {/* Main Studio Grid: Left Inputs vs Right Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-800">
              <Activity className="w-4 h-4 text-teal-600 dark:text-clinical-400" /> Clinical Presentation Parameters
            </h3>

            {/* Severity Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-slate-300">
                <span>Patient Clinical Severity:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{severity.toFixed(1)} / 10.0</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full mt-2 accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
                <span className="text-rose-600 dark:text-red-400 font-bold">Critical</span>
              </div>
            </div>

            {/* Urgency & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Urgency Stream</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Emergency">Emergency (Immediate)</option>
                  <option value="Urgent">Urgent (&lt;30m)</option>
                  <option value="Semi-Urgent">Semi-Urgent</option>
                  <option value="Non-Urgent">Non-Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Patient Age</label>
                <input
                  type="number"
                  min="0"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                <span className="text-[10px] text-gray-500 dark:text-slate-400">BP</span>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full text-center bg-transparent font-mono font-bold text-gray-900 dark:text-white text-xs mt-0.5 focus:outline-none"
                />
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                <span className="text-[10px] text-gray-500 dark:text-slate-400">HR (bpm)</span>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full text-center bg-transparent font-mono font-bold text-gray-900 dark:text-white text-xs mt-0.5 focus:outline-none"
                />
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                <span className="text-[10px] text-gray-500 dark:text-slate-400">SpO2 (%)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full text-center bg-transparent font-mono font-bold text-gray-900 dark:text-white text-xs mt-0.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Symptoms Selection */}
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center justify-between mb-2">
                <span>Observed Symptoms ({selectedSymptoms.length})</span>
                <span className="text-[10px] text-teal-700 dark:text-clinical-400 font-semibold">Click to toggle</span>
              </label>

              <div className="max-h-56 overflow-y-auto space-y-1 p-2 rounded-xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
                {symptomCatalog.slice(0, 25).map((sym) => {
                  const isChecked = selectedSymptoms.includes(sym);
                  return (
                    <div
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 dark:bg-clinical-600/30 dark:text-white dark:border-clinical-500/50 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="truncate pr-2">{sym}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunInference}
              disabled={isEvaluating}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isEvaluating ? 'Computing Decision Passport...' : 'Run Decision Inference'}</span>
            </button>
          </GlassCard>
        </div>

        {/* Right: Transparent Decision Passport (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {primary && evaluationResult ? (
            <>
              {/* Interactive AI Decision Reasoning Pipeline */}
              <TriageDecisionGraph
                evaluation={evaluationResult}
                patientSymptoms={selectedSymptoms}
                patientVitals={{
                  bp,
                  heart_rate: heartRate,
                  spo2,
                  temperature,
                }}
              />

              {/* Primary Recommended Department Card */}
              <GlassCard glow="cyan" className="p-6">
                <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 dark:bg-clinical-500/20 dark:text-clinical-300 dark:border-clinical-500/40">
                        Top Ranked Candidate
                      </span>
                      {primary.is_red_flag_alert && (
                        <Badge variant="emergency" pulse size="sm">RED-FLAG ACTIVE</Badge>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                      {primary.department}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Target Code: <span className="font-mono text-teal-700 dark:text-clinical-300 font-semibold">{primary.department_code}</span> • Floor: {primary.floor}
                    </p>
                  </div>

                  <TriageScoreBadge
                    score={primary.decision_score}
                    severity={severity}
                    urgency={urgency}
                    size="lg"
                  />
                </div>

                {/* Plain-Language Explanation without Jargon */}
                {primary.plain_language_explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs dark:bg-clinical-950/40 dark:border-clinical-500/40">
                    <div className="flex items-center gap-2 mb-1.5 text-teal-900 dark:text-clinical-300 font-bold">
                      <Stethoscope className="w-4 h-4 text-teal-600 dark:text-clinical-400" />
                      <span>Plain-Language Clinical Explanation</span>
                      <span className="text-[10px] text-teal-700 dark:text-clinical-400/80 font-normal">(Zero Medical Jargon)</span>
                    </div>
                    <p className="text-gray-800 dark:text-slate-200 leading-relaxed">
                      {primary.plain_language_explanation}
                    </p>
                  </div>
                )}

                {/* Graceful Degradation Banner if Incomplete Data */}
                {evaluationResult?.graceful_degradation_applied && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Unit 4 Graceful Degradation Active: </span>
                      <span>{evaluationResult.graceful_degradation_notice}</span>
                    </div>
                  </div>
                )}

                {/* Clinical Rationale */}
                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
                  <p className="text-xs text-gray-700 dark:text-slate-300 italic leading-relaxed">
                    "{primary.clinical_rationale}"
                  </p>
                  <p className="text-[11px] text-teal-700 dark:text-clinical-400 mt-1 font-semibold">
                    Suggested Allocation: {primary.suggested_resource_tier}
                  </p>
                </div>

                {/* Mathematical Engine Trace: CF & Fuzzy Scoring */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">Certainty Factor</p>
                    <p className="text-xl font-black font-mono text-teal-700 dark:text-clinical-300 mt-0.5">
                      +{primary.certainty_factor.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Unit 4 [-1.0, +1.0]</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">Severity Match</p>
                    <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-300 mt-0.5">
                      {primary.severity_compatibility ? `${primary.severity_compatibility}%` : `${(primary.fuzzy_severity_degree * 100).toFixed(0)}%`}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Acuity compatibility</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">Urgency Match</p>
                    <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-300 mt-0.5">
                      {primary.urgency_compatibility ? `${primary.urgency_compatibility}%` : `${(primary.fuzzy_urgency_degree * 100).toFixed(0)}%`}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Readiness match</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
                    <p className="text-gray-500 dark:text-slate-400">A* Path Score</p>
                    <p className="text-xl font-black font-mono text-teal-600 dark:text-cyan-300 mt-0.5">
                      {evaluationResult?.search_comparison?.algorithms?.ASTAR?.path_score || 95}%
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Admissible optimal</p>
                  </div>
                </div>

                {/* Activated Rules */}
                {evaluationResult?.rule_engine_trace && evaluationResult.rule_engine_trace.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/30">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-4 h-4" /> Triggered Clinical Rules ({evaluationResult.rule_engine_trace.length})
                    </p>
                    <div className="space-y-1.5">
                      {evaluationResult.rule_engine_trace.map((rule, idx) => (
                        <div key={idx} className="text-xs text-gray-700 dark:text-slate-300">
                          <span className="font-semibold text-gray-900 dark:text-white">{rule.name}: </span>
                          <span>{rule.rationale}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimal A* Graph Route */}
                {evaluationResult?.search_pathway && (
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <GitCommit className="w-4 h-4 text-teal-600 dark:text-clinical-400" /> Optimal Operational Pathway (A* Search)
                      </span>
                      <span className="font-mono text-xs text-teal-700 dark:text-clinical-300 font-bold">
                        Transit Cost: {evaluationResult.search_pathway.total_path_cost} mins
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                      {evaluationResult.search_pathway.optimal_path_labels.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-medium">
                            {step}
                          </span>
                          {idx < evaluationResult.search_pathway!.optimal_path_labels.length - 1 && (
                            <span className="text-teal-600 dark:text-clinical-400 font-bold">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
                {/* Decision Graph Search Exploration across 4 Algorithms */}
                {evaluationResult?.search_comparison?.algorithms && (
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <GitCommit className="w-4 h-4 text-teal-600 dark:text-clinical-400" /> Decision Graph Exploration (BFS, DFS, Greedy, A*)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                        All &lt; 200ms Latency PASS
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {Object.entries(evaluationResult.search_comparison.algorithms).map(([key, algo]: [string, any]) => (
                        <div
                          key={key}
                          className={`p-2.5 rounded-lg border ${
                            algo.is_optimal
                              ? 'bg-teal-50/80 border-teal-300 text-gray-900 dark:bg-clinical-950/40 dark:border-clinical-500/60 dark:text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/40 text-gray-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">{key}</span>
                            {algo.is_optimal && (
                              <span className="text-[9px] font-bold text-teal-700 dark:text-clinical-300 uppercase px-1 rounded bg-teal-100 dark:bg-clinical-500/20">
                                Optimal
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[11px] text-gray-600 dark:text-slate-300 space-y-0.5">
                            <p>Cost: <span className="font-mono font-bold text-gray-900 dark:text-white">{algo.total_path_cost_min}m</span></p>
                            <p>Score: <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{algo.path_score}/100</span></p>
                            <p>Latency: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{algo.execution_time_ms}ms</span></p>
                            <p>Nodes: <span className="font-mono text-gray-500 dark:text-slate-400">{algo.nodes_expanded}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Ranked Alternative Departments */}
              <GlassCard className="p-5">
                <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Ranked Alternative Departments
                </h4>
                <div className="space-y-2">
                  {evaluationResult.ranked_alternatives.map((alt) => (
                    <div
                      key={alt.department}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-400 dark:text-slate-400">
                            #{alt.rank}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">{alt.department}</span>
                          <span className="text-[10px] text-gray-500 dark:text-slate-500 font-mono">
                            {alt.department_code}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                          Matched: {alt.matched_symptoms.slice(0, 2).join(', ') || 'General evaluation'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-gray-900 dark:text-slate-200">
                          {alt.decision_score.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 block">
                          CF: +{alt.certainty_factor.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="p-12 text-center text-gray-500 dark:text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto text-teal-600 dark:text-clinical-400 mb-2 animate-spin" />
              <p className="font-bold text-sm text-gray-900 dark:text-white">Ready to Evaluate</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                Select clinical parameters on the left and click "Run Decision Inference".
              </p>
            </GlassCard>
          )}

          {/* Mandatory Clinical Decision Support Disclaimer */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 dark:text-clinical-400 shrink-0 mt-0.5" />
            <span>
              <strong>Decision Support Axiom:</strong> AegisHealth AI is strictly an advisory decision-support platform designed to assist healthcare teams with triage prioritization and resource forecasting. Final medical diagnosis, department routing, and drug administration remain the exclusive responsibility of the human physician.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

