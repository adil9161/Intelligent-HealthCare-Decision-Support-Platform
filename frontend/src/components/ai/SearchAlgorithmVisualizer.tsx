import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { aiService } from '../../services/aiService';
import { SearchGraphResponse, SearchStep } from '../../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  GitFork,
  CheckCircle2,
  ListOrdered,
  BookOpen,
  ArrowRight,
  Layers,
  Award,
  Clock,
  Activity,
  Zap,
  Compass,
  Info,
  Check,
  ShieldCheck,
  ChevronRight,
  Sliders,
  ExternalLink,
  RefreshCw,
  X,
  Sparkles,
  HelpCircle,
  FileText,
  AlertTriangle,
  Box,
} from 'lucide-react';
import { SearchGraph3DCanvas } from './SearchGraph3DCanvas';

interface ComparisonData {
  target_department: string;
  start_node: string;
  goal_node: string;
  all_algorithms_under_200ms: boolean;
  max_execution_time_ms: number;
  algorithms: {
    BFS: AlgorithmComparisonItem;
    DFS: AlgorithmComparisonItem;
    GREEDY: AlgorithmComparisonItem;
    ASTAR: AlgorithmComparisonItem;
  };
}

interface AlgorithmComparisonItem {
  name: string;
  type: string;
  path: string[];
  path_labels: string[];
  total_path_cost_min: number;
  nodes_expanded: number;
  execution_time_ms: number;
  path_score: number;
  is_optimal: boolean;
  academic_notes: string;
}

interface GraphNodeMeta {
  id: string;
  label: string;
  level: number;
  stageName: string;
  type: string;
  base_cost: number;
  description: string;
  target_dept?: string;
}

export const SearchAlgorithmVisualizer: React.FC = () => {
  // Navigation & View mode tabs
  const [activeTab, setActiveTab] = useState<'visualizer' | 'comparison' | 'theory'>('visualizer');
  const [canvasDimension, setCanvasDimension] = useState<'2d' | '3d'>('3d');

  // Algorithm & Target Selection
  const [selectedAlgo, setSelectedAlgo] = useState<'BFS' | 'DFS' | 'GREEDY' | 'ASTAR'>('ASTAR');
  const [selectedGoalDept, setSelectedGoalDept] = useState<string>('Cardiology');
  const [patientSeverity, setPatientSeverity] = useState<number>(8.5);

  // Graph Data & Algorithm Execution States
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [searchResult, setSearchResult] = useState<SearchGraphResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Node Inspector & Tooltip Selection
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>('dept_cardio');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Multi-Algorithm Live Comparison Data
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Node layout coordinates organized by hierarchical stages (0 to 4)
  const nodeLayoutPositions: Record<string, { x: number; y: number }> = {
    // Stage 0: Intake
    triage_intake: { x: 55, y: 230 },

    // Stage 1: Acuity Streams
    triage_acuity_crit: { x: 235, y: 105 },
    triage_acuity_acute: { x: 235, y: 230 },
    triage_acuity_amb: { x: 235, y: 355 },

    // Stage 2: Diagnostics
    diag_ecg_trop: { x: 445, y: 75 },
    diag_ct_neuro: { x: 445, y: 145 },
    diag_fast_usg: { x: 445, y: 215 },
    diag_cxr_abg: { x: 445, y: 285 },
    diag_ortho_xr: { x: 445, y: 355 },
    diag_cmp_labs: { x: 445, y: 425 },

    // Stage 3: Clinical Departments
    dept_cardio: { x: 675, y: 75 },
    dept_neuro: { x: 675, y: 145 },
    dept_trauma: { x: 675, y: 215 },
    dept_pulmo: { x: 675, y: 285 },
    dept_ortho: { x: 675, y: 355 },
    dept_genmed: { x: 675, y: 425 },

    // Stage 4: Stabilized Destinations
    dest_cath_lab: { x: 895, y: 85 },
    dest_icu: { x: 895, y: 195 },
    dest_inpatient_ward: { x: 895, y: 325 },
    dest_outpatient: { x: 895, y: 425 },
  };

  const stageHeaders = [
    { num: 0, label: 'Stage 0: Intake', desc: 'Presentation & Vitals', x: 55, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { num: 1, label: 'Stage 1: Acuity Stream', desc: 'ESI Resuscitation Triage', x: 235, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { num: 2, label: 'Stage 2: Diagnostics & Labs', desc: 'Investigation Modalities', x: 445, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { num: 3, label: 'Stage 3: Candidate Dept', desc: 'Specialized Medical Units', x: 675, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { num: 4, label: 'Stage 4: Care Destination', desc: 'Stabilization & Transfer', x: 895, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  // Load initial graph structure
  useEffect(() => {
    aiService.getGraphStructure().then((res) => {
      setGraphData(res);
    });
  }, []);

  // Fetch search algorithm results on selection changes
  useEffect(() => {
    runSearch();
  }, [selectedAlgo, selectedGoalDept, patientSeverity]);

  // Load comparison data when switching to comparison tab
  useEffect(() => {
    if (activeTab === 'comparison' || !comparisonData) {
      loadComparison();
    }
  }, [activeTab, selectedGoalDept, patientSeverity]);

  const runSearch = async () => {
    setIsLoading(true);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await aiService.executeSearchGraph({
        algorithm: selectedAlgo,
        goal_department: selectedGoalDept,
        patient_severity: Number(patientSeverity),
      });
      setSearchResult(res);
      setCurrentStepIndex(res.execution_trace.length - 1); // default to final state
    } catch (err: any) {
      console.error(`Search graph error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparison = async () => {
    setIsLoadingComparison(true);
    try {
      const res = await aiService.compareAlgorithms(selectedGoalDept, Number(patientSeverity));
      setComparisonData(res);
    } catch (err) {
      console.error('Error fetching algorithm comparison:', err);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  // Playback timer with speed multiplier
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(120, Math.round(900 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (!searchResult || prev >= searchResult.execution_trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, searchResult, playbackSpeed]);

  const currentStep: SearchStep | null =
    searchResult && searchResult.execution_trace[currentStepIndex]
      ? searchResult.execution_trace[currentStepIndex]
      : null;

  // Clinical Scenario Presets
  const applyPreset = (preset: {
    dept: string;
    severity: number;
    algo: 'BFS' | 'DFS' | 'GREEDY' | 'ASTAR';
  }) => {
    setSelectedGoalDept(preset.dept);
    setPatientSeverity(preset.severity);
    setSelectedAlgo(preset.algo);
    setIsPlaying(false);
  };

  // Lookups & Graph Utilities
  const isNodeInPath = (nodeId: string) => searchResult?.optimal_path.includes(nodeId);
  const isCurrentNode = (nodeId: string) => currentStep?.current_node === nodeId;
  const isNodeInFrontier = (nodeId: string) => currentStep?.frontier_queue.includes(nodeId);
  const isNodeExplored = (nodeId: string) => currentStep?.explored_set.includes(nodeId);

  const inspectedNode = useMemo(() => {
    if (!inspectedNodeId || !graphData.nodes) return null;
    return graphData.nodes.find((n) => n.id === inspectedNodeId) || null;
  }, [inspectedNodeId, graphData.nodes]);

  const hoveredNode = useMemo(() => {
    if (!hoveredNodeId || !graphData.nodes) return null;
    return graphData.nodes.find((n) => n.id === hoveredNodeId) || null;
  }, [hoveredNodeId, graphData.nodes]);

  const outgoingEdgesOfInspected = useMemo(() => {
    if (!inspectedNodeId || !graphData.edges) return [];
    return graphData.edges.filter((e) => e.from === inspectedNodeId);
  }, [inspectedNodeId, graphData.edges]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 dark:bg-teal-950/60 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#172033] dark:text-white tracking-tight font-heading flex items-center gap-2">
                <span>Healthcare Decision Graph Search Visualizer</span>
                <Badge variant="info">Unit 2 & 4 Core AI</Badge>
              </h2>
              <p className="text-xs text-[#526176] dark:text-slate-400 mt-0.5 font-body">
                Heuristic clinical decision networks • Informed A* & Greedy Search vs. Uninformed BFS & DFS traversals under uncertainty.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'visualizer'
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'text-[#526176] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Interactive Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'text-[#526176] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4-Algorithm Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'theory'
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'text-[#526176] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Theory</span>
          </button>
        </div>
      </div>

      {/* Clinical Scenario Quick Presets */}
      <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8492A6] mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Clinical Presets:
          </span>
          <button
            onClick={() => applyPreset({ dept: 'Cardiology', severity: 9.5, algo: 'ASTAR' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              selectedGoalDept === 'Cardiology' && patientSeverity >= 9.0
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-[#526176] border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            🫀 Acute STEMI (Cardio / Sev 9.5)
          </button>
          <button
            onClick={() => applyPreset({ dept: 'Neurology', severity: 9.0, algo: 'ASTAR' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              selectedGoalDept === 'Neurology'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-[#526176] border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            🧠 Stroke FAST Alert (Neuro / Sev 9.0)
          </button>
          <button
            onClick={() => applyPreset({ dept: 'Pulmonology', severity: 8.5, algo: 'ASTAR' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              selectedGoalDept === 'Pulmonology'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-[#526176] border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            🫁 Hypoxemic ARDS (Pulmo / Sev 8.5)
          </button>
          <button
            onClick={() => applyPreset({ dept: 'Emergency', severity: 9.8, algo: 'ASTAR' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              selectedGoalDept === 'Emergency'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-[#526176] border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            🩸 Polytrauma Resuscitation (Trauma / Sev 9.8)
          </button>
          <button
            onClick={() => applyPreset({ dept: 'General Medicine', severity: 3.5, algo: 'BFS' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              selectedGoalDept === 'General Medicine'
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold shadow-xs'
                : 'bg-gray-50 hover:bg-gray-100 text-[#526176] border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            🩺 Ambulatory OPD (GenMed / Sev 3.5)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: INTERACTIVE GRAPH EXPLORER & LIVE STEP-BY-STEP TRACE
         ========================================================================= */}
      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          {/* Controls Bar: Algorithm Tabs, Target Dept, Severity & Playback */}
          <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Algorithm Switcher */}
              <div>
                <span className="text-[11px] text-[#8492A6] font-semibold uppercase tracking-wider block mb-1.5">
                  Traversal Algorithm:
                </span>
                <div className="flex flex-wrap items-center bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                  {(['ASTAR', 'GREEDY', 'BFS', 'DFS'] as const).map((algo) => (
                    <button
                      key={algo}
                      onClick={() => setSelectedAlgo(algo)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedAlgo === algo
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-[#526176] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      {algo === 'ASTAR'
                        ? 'A* (Optimal Cost + Heuristic)'
                        : algo === 'GREEDY'
                        ? 'Greedy Best-First (h only)'
                        : algo === 'BFS'
                        ? 'BFS (Level-Order)'
                        : 'DFS (Depth-First)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Department & Patient Severity */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <span className="text-[11px] text-[#8492A6] font-semibold uppercase tracking-wider block mb-1">
                    Goal Care Unit:
                  </span>
                  <select
                    value={selectedGoalDept}
                    onChange={(e) => setSelectedGoalDept(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-[#172033] dark:text-white font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="Cardiology">Cardiology Care Center</option>
                    <option value="Neurology">Neurology Stroke Unit</option>
                    <option value="Pulmonology">Pulmonology & Resuscitation</option>
                    <option value="Emergency">Emergency Trauma Bay</option>
                    <option value="Orthopedics">Orthopedics Center</option>
                    <option value="General Medicine">General Internal Medicine</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[#8492A6] font-semibold uppercase tracking-wider">
                      Severity:
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                      {patientSeverity.toFixed(1)} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={patientSeverity}
                    onChange={(e) => setPatientSeverity(Number(e.target.value))}
                    className="w-28 accent-teal-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Stepper, Slider Scrubber & Speed Controls */}
            {searchResult && (
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Playback Button Group */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(0);
                    }}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#526176] dark:text-slate-300 transition-colors"
                    title="Reset to Step 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentStepIndex === 0}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#526176] dark:text-slate-300 disabled:opacity-40 transition-colors"
                    title="Previous Step"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play Traversal'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex((prev) =>
                        Math.min(searchResult.execution_trace.length - 1, prev + 1)
                      );
                    }}
                    disabled={currentStepIndex >= searchResult.execution_trace.length - 1}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#526176] dark:text-slate-300 disabled:opacity-40 transition-colors"
                    title="Next Step"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Step Scrubber Slider */}
                <div className="flex-1 w-full max-w-md flex items-center gap-3 px-2">
                  <span className="text-xs font-mono font-semibold text-[#8492A6] shrink-0">
                    Step {currentStepIndex + 1}/{searchResult.execution_trace.length}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={searchResult.execution_trace.length - 1}
                    value={currentStepIndex}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentStepIndex(Number(e.target.value));
                    }}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>

                {/* Speed Multiplier Selector */}
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                  {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        playbackSpeed === spd
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-[#526176] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive SVG Canvas & Side Inspector Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SVG Decision Graph (8 or 9 cols) */}
            <div className="lg:col-span-8 xl:col-span-9 rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden">
              {/* Graph Legend & Status Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#526176] dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                    <span>Optimal Path</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-300 animate-pulse" />
                    <span>Current Frontier Node</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-teal-100 border border-teal-500" />
                    <span>Explored / Closed</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-white border border-gray-300" />
                    <span>Unvisited</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-2xs">
                    <button
                      onClick={() => setCanvasDimension('2d')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                        canvasDimension === '2d'
                          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-bold'
                          : 'text-[#526176] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>2D Schematic</span>
                    </button>
                    <button
                      onClick={() => setCanvasDimension('3d')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                        canvasDimension === '3d'
                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                          : 'text-[#526176] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>3D Spatial</span>
                    </button>
                  </div>

                  <Badge variant="info">
                    Evaluation: f(n) = g(n) + h(n)
                  </Badge>
                </div>
              </div>

              {/* Canvas: 3D Spatial Canvas or 2D Schematic */}
              {canvasDimension === '3d' ? (
                <div className="my-2">
                  <SearchGraph3DCanvas
                    graphNodes={graphData.nodes}
                    graphEdges={graphData.edges}
                    currentStep={currentStep}
                    optimalPath={searchResult?.optimal_path || []}
                    inspectedNodeId={inspectedNodeId}
                    onSelectNode={(id) => setInspectedNodeId(id)}
                  />
                </div>
              ) : (
              <div className="w-full overflow-x-auto py-2">
                <svg viewBox="0 0 980 480" className="w-full min-w-[850px] h-auto select-none">
                  <defs>
                    <linearGradient id="optimalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>

                    {/* Subtle grid pattern */}
                    <pattern id="lightGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.45" />
                    </pattern>
                  </defs>

                  {/* Canvas Subtle Grid Background */}
                  <rect width="980" height="480" fill="url(#lightGrid)" />

                  {/* Stage Columns Headers */}
                  {stageHeaders.map((stg) => (
                    <g key={stg.num}>
                      <rect
                        x={stg.x - 45}
                        y={8}
                        width={90}
                        height={24}
                        rx={6}
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth={1}
                      />
                      <text
                        x={stg.x}
                        y={24}
                        fill="#475569"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="Plus Jakarta Sans"
                        textAnchor="middle"
                      >
                        {stg.label}
                      </text>
                    </g>
                  ))}

                  {/* Edges */}
                  {graphData.edges.map((edge, idx) => {
                    const u = nodeLayoutPositions[edge.from];
                    const v = nodeLayoutPositions[edge.to];
                    if (!u || !v) return null;

                    const isEdgeInOptimal =
                      searchResult?.optimal_path &&
                      searchResult.optimal_path.indexOf(edge.from) !== -1 &&
                      searchResult.optimal_path.indexOf(edge.to) ===
                        searchResult.optimal_path.indexOf(edge.from) + 1;

                    const isEdgeInspected =
                      inspectedNodeId === edge.from || inspectedNodeId === edge.to;

                    return (
                      <g key={idx}>
                        <line
                          x1={u.x}
                          y1={u.y}
                          x2={v.x}
                          y2={v.y}
                          stroke={isEdgeInOptimal ? '#0284c7' : isEdgeInspected ? '#14b8a6' : '#cbd5e1'}
                          strokeWidth={isEdgeInOptimal ? 3.5 : isEdgeInspected ? 2.5 : 1.2}
                          strokeDasharray={isEdgeInOptimal ? 'none' : '4 4'}
                          opacity={isEdgeInOptimal ? 1.0 : isEdgeInspected ? 0.9 : 0.5}
                          className="transition-all duration-300"
                        />
                        {/* Edge cost label */}
                        <rect
                          x={(u.x + v.x) / 2 - 12}
                          y={(u.y + v.y) / 2 - 10}
                          width={24}
                          height={14}
                          rx={3}
                          fill={isEdgeInOptimal ? '#e0f2fe' : '#ffffff'}
                          stroke={isEdgeInOptimal ? '#0284c7' : '#e2e8f0'}
                          strokeWidth={1}
                        />
                        <text
                          x={(u.x + v.x) / 2}
                          y={(u.y + v.y) / 2}
                          fill={isEdgeInOptimal ? '#0369a1' : '#64748b'}
                          fontSize="8"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {edge.cost}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {Object.entries(nodeLayoutPositions).map(([nodeId, pos]) => {
                    const inPath = isNodeInPath(nodeId);
                    const isCurr = isCurrentNode(nodeId);
                    const inFrontier = isNodeInFrontier(nodeId);
                    const isExplored = isNodeExplored(nodeId);
                    const isInspected = inspectedNodeId === nodeId;

                    let fillColor = '#ffffff';
                    let strokeColor = '#94a3b8';
                    let textColor = '#172033';
                    let strokeW = 1.8;

                    if (isCurr) {
                      fillColor = '#fef3c7';
                      strokeColor = '#f59e0b';
                      textColor = '#92400e';
                      strokeW = 3.5;
                    } else if (inPath) {
                      fillColor = '#e0f2fe';
                      strokeColor = '#0284c7';
                      textColor = '#0369a1';
                      strokeW = 3.0;
                    } else if (inFrontier) {
                      fillColor = '#d1fae5';
                      strokeColor = '#10b981';
                      textColor = '#065f46';
                      strokeW = 2.5;
                    } else if (isExplored) {
                      fillColor = '#f0fdfa';
                      strokeColor = '#0d9488';
                      textColor = '#115e59';
                      strokeW = 2.0;
                    }

                    if (isInspected) {
                      strokeColor = '#8b5cf6';
                      strokeW = 3.5;
                    }

                    const rawLabel = nodeId.replace(/^(triage_|diag_|dept_|dest_)/, '').toUpperCase();

                    return (
                      <g
                        key={nodeId}
                        className="cursor-pointer group"
                        onClick={() => setInspectedNodeId(nodeId)}
                        onMouseEnter={() => setHoveredNodeId(nodeId)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      >
                        {/* Outer Selection Aura if inspected */}
                        {isInspected && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={26}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            opacity={0.8}
                          />
                        )}

                        {/* Current Node Pulse Aura */}
                        {isCurr && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={24}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            opacity={0.5}
                            className="animate-ping origin-center"
                          />
                        )}

                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isCurr || inPath ? 18 : 14}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={strokeW}
                          className="transition-all duration-200 group-hover:scale-110"
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 3.5}
                          fill={textColor}
                          fontSize="8.5"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {rawLabel.slice(0, 4)}
                        </text>

                        {/* Subtitle description below node */}
                        <text
                          x={pos.x}
                          y={pos.y + 24}
                          fill={inPath ? '#0284c7' : isInspected ? '#8b5cf6' : '#526176'}
                          fontSize="8"
                          fontWeight={inPath || isInspected ? 'bold' : '500'}
                          fontFamily="Plus Jakarta Sans"
                          textAnchor="middle"
                        >
                          {rawLabel.replace(/_/g, ' ')}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              )}

              {/* Active Step Mathematical Telemetry Console */}
              {currentStep && (
                <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[#8492A6] block text-[11px] uppercase tracking-wider font-sans font-bold">
                      Current Evaluation:
                    </span>
                    <p className="text-[#172033] dark:text-white font-bold text-sm truncate">
                      {currentStep.current_node_label}
                    </p>
                    <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold font-mono">
                      ID: {currentStep.current_node}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[#8492A6] block text-[11px] uppercase tracking-wider font-sans font-bold">
                      Mathematical Cost:
                    </span>
                    <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                      f(n) = {currentStep.f_cost.toFixed(1)}
                    </p>
                    <span className="text-[10px] text-[#526176] dark:text-slate-400 font-mono">
                      g={currentStep.g_cost.toFixed(1)}m + h={currentStep.h_cost.toFixed(1)}m
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[#8492A6] block text-[11px] uppercase tracking-wider font-sans font-bold">
                      Frontier / Open Queue ({currentStep.frontier_queue.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
                      {currentStep.frontier_queue.length > 0 ? (
                        currentStep.frontier_queue.map((f, i) => (
                          <span
                            key={i}
                            onClick={() => setInspectedNodeId(f)}
                            className="cursor-pointer px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-slate-700 font-bold hover:border-teal-400"
                          >
                            {f.replace(/^(triage_|diag_|dept_|dest_)/, '')}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#8492A6] text-[11px]">Goal Reached / Closed</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[#8492A6] block text-[11px] uppercase tracking-wider font-sans font-bold">
                      Step Decision Log:
                    </span>
                    <p className="text-[#172033] dark:text-slate-300 text-[11px] leading-snug font-sans">
                      {currentStep.decision_log}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Node Inspector Drawer Panel (Right 4 or 3 cols) */}
            <div className="lg:col-span-4 xl:col-span-3 rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <h3 className="text-sm font-bold text-[#172033] dark:text-white font-heading">
                      Node Inspector
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800">
                    Interactive
                  </span>
                </div>

                {inspectedNode ? (
                  <div className="mt-4 space-y-3.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8492A6]">Node Checkpoint</span>
                      <h4 className="text-base font-extrabold text-[#172033] dark:text-white font-heading mt-0.5">
                        {inspectedNode.label}
                      </h4>
                      <span className="text-xs font-mono text-teal-700 dark:text-teal-300 font-bold">
                        {inspectedNode.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                        <span className="text-[10px] text-[#8492A6] uppercase block font-semibold">Hierarchy</span>
                        <p className="font-bold text-[#172033] dark:text-white mt-0.5">
                          Stage {inspectedNode.level}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                        <span className="text-[10px] text-[#8492A6] uppercase block font-semibold">Base Transit</span>
                        <p className="font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                          {inspectedNode.base_cost} minutes
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                      <span className="text-[10px] text-[#8492A6] uppercase font-semibold block mb-1">
                        Clinical Role & Function
                      </span>
                      <p className="text-xs text-[#526176] dark:text-slate-300 leading-relaxed font-body">
                        {inspectedNode.description}
                      </p>
                    </div>

                    {/* Outgoing Connectors */}
                    <div>
                      <span className="text-[11px] font-bold text-[#8492A6] uppercase tracking-wider block mb-1.5">
                        Outgoing Pathways ({outgoingEdgesOfInspected.length}):
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {outgoingEdgesOfInspected.map((edge, idx) => (
                          <div
                            key={idx}
                            onClick={() => setInspectedNodeId(edge.to)}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-teal-950/40 border border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs cursor-pointer transition-colors"
                          >
                            <span className="font-medium text-[#172033] dark:text-slate-200 truncate pr-2">
                              → {edge.to.replace(/^(triage_|diag_|dept_|dest_)/, '')}
                            </span>
                            <span className="font-mono font-bold text-teal-700 dark:text-teal-300 text-[11px] shrink-0">
                              +{edge.cost}m
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-[#8492A6]">
                    <Compass className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <span>Click on any node in the graph above to inspect its clinical delay, heuristic, and connecting edges.</span>
                  </div>
                )}
              </div>

              {/* Status summary at bottom */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 text-[11px] text-[#8492A6] flex items-center justify-between font-mono">
                <span>Admissible Heuristic</span>
                <span className="text-emerald-700 font-bold">h(n) ≤ h*(n)</span>
              </div>
            </div>
          </div>

          {/* Clinical Hop-by-Hop Sequential Pathway Ribbon */}
          {searchResult && searchResult.optimal_path.length > 0 && (
            <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Optimal Clinical Decision Pathway ({searchResult.algorithm})</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
                    Total Transit Delay: {searchResult.total_path_cost} minutes
                  </span>
                  <span className="text-xs font-mono text-[#8492A6]">
                    {searchResult.optimal_path.length} hops
                  </span>
                </div>
              </div>

              {/* Pathway Sequence Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-body">
                {searchResult.optimal_path_labels.map((stepLabel, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      onClick={() => setInspectedNodeId(searchResult.optimal_path[idx])}
                      className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50/80 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-teal-200 dark:border-slate-700 text-xs font-semibold text-teal-900 dark:text-teal-200 transition-colors"
                    >
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{stepLabel}</span>
                    </div>
                    {idx < searchResult.optimal_path_labels.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: MULTI-ALGORITHM BENCHMARK MATRIX (Side-by-Side Comparison)
         ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Header Action & Status Bar */}
          <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#172033] dark:text-white font-heading flex items-center gap-2">
                <span>Multi-Algorithm Comparative Benchmark</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Target: {selectedGoalDept}
                </span>
              </h3>
              <p className="text-xs text-[#526176] dark:text-slate-400 mt-1 font-body">
                Evaluates search latency (&lt;200ms quality bar), path delay efficiency, node expansion footprint, and clinical inference score.
              </p>
            </div>

            <button
              onClick={loadComparison}
              disabled={isLoadingComparison}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingComparison ? 'animate-spin' : ''}`} />
              <span>Rerun 4-Algorithm Benchmark</span>
            </button>
          </div>

          {/* 4 Cards: One for each Algorithm */}
          {comparisonData && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1: A* Search (The Champion) */}
              <div className="rounded-[18px] bg-white dark:bg-slate-900 border-2 border-teal-500 dark:border-teal-500/80 p-5 shadow-md relative overflow-hidden space-y-3">
                <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Optimal Guarantee
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-600" />
                  <h4 className="font-extrabold text-[#172033] dark:text-white text-base">A* Search</h4>
                </div>
                <p className="text-xs text-[#526176] dark:text-slate-400 font-body">
                  Informed cost + admissible heuristic balance.
                </p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Total Delay:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {comparisonData.algorithms.ASTAR.total_path_cost_min} mins
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Nodes Expanded:</span>
                    <span className="font-bold text-[#172033] dark:text-white">
                      {comparisonData.algorithms.ASTAR.nodes_expanded} nodes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Execution Time:</span>
                    <span className="font-bold text-emerald-700">
                      {comparisonData.algorithms.ASTAR.execution_time_ms} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Inference Score:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {comparisonData.algorithms.ASTAR.path_score}%
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 leading-snug">
                  <strong>Clinical Verdict:</strong> Recommended for all critical triage routing.
                </div>
              </div>

              {/* Card 2: Greedy Best-First Search */}
              <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h4 className="font-extrabold text-[#172033] dark:text-white text-base">Greedy Best-First</h4>
                </div>
                <p className="text-xs text-[#526176] dark:text-slate-400 font-body">
                  Heuristic only h(n); disregards accumulated transit cost.
                </p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Total Delay:</span>
                    <span className="font-bold text-amber-600">
                      {comparisonData.algorithms.GREEDY.total_path_cost_min} mins
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Nodes Expanded:</span>
                    <span className="font-bold text-[#172033] dark:text-white">
                      {comparisonData.algorithms.GREEDY.nodes_expanded} nodes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Execution Time:</span>
                    <span className="font-bold text-emerald-700">
                      {comparisonData.algorithms.GREEDY.execution_time_ms} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Inference Score:</span>
                    <span className="font-bold text-amber-600">
                      {comparisonData.algorithms.GREEDY.path_score}%
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                  <strong>Clinical Verdict:</strong> Fast but can be lured into local minima delays.
                </div>
              </div>

              {/* Card 3: Breadth-First Search (BFS) */}
              <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-blue-500" />
                  <h4 className="font-extrabold text-[#172033] dark:text-white text-base">BFS Search</h4>
                </div>
                <p className="text-xs text-[#526176] dark:text-slate-400 font-body">
                  Uninformed level-order; guarantees fewest hops, not lowest delay.
                </p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Total Delay:</span>
                    <span className="font-bold text-blue-600">
                      {comparisonData.algorithms.BFS.total_path_cost_min} mins
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Nodes Expanded:</span>
                    <span className="font-bold text-[#172033] dark:text-white">
                      {comparisonData.algorithms.BFS.nodes_expanded} nodes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Execution Time:</span>
                    <span className="font-bold text-emerald-700">
                      {comparisonData.algorithms.BFS.execution_time_ms} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Inference Score:</span>
                    <span className="font-bold text-blue-600">
                      {comparisonData.algorithms.BFS.path_score}%
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 leading-snug">
                  <strong>Clinical Verdict:</strong> High node expansion; optimal only for unweighted hops.
                </div>
              </div>

              {/* Card 4: Depth-First Search (DFS) */}
              <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-rose-500" />
                  <h4 className="font-extrabold text-[#172033] dark:text-white text-base">DFS Search</h4>
                </div>
                <p className="text-xs text-[#526176] dark:text-slate-400 font-body">
                  Deep exploratory LIFO; risks picking lengthy detour pathways.
                </p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Total Delay:</span>
                    <span className="font-bold text-rose-600">
                      {comparisonData.algorithms.DFS.total_path_cost_min} mins
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Nodes Expanded:</span>
                    <span className="font-bold text-[#172033] dark:text-white">
                      {comparisonData.algorithms.DFS.nodes_expanded} nodes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Execution Time:</span>
                    <span className="font-bold text-emerald-700">
                      {comparisonData.algorithms.DFS.execution_time_ms} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8492A6]">Inference Score:</span>
                    <span className="font-bold text-rose-600">
                      {comparisonData.algorithms.DFS.path_score}%
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-900 dark:text-rose-200 leading-snug">
                  <strong>Clinical Verdict:</strong> Suboptimal in acute medicine; potential dangerous delays.
                </div>
              </div>
            </div>
          )}

          {/* Deep Comparative Analysis Table */}
          {comparisonData && (
            <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-[#172033] dark:text-white font-heading">
                  Algorithm Characteristics Matrix (Academic Syllabus Reference)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 text-[#526176] dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-slate-700">
                      <th className="py-3 px-4">Algorithm</th>
                      <th className="py-3 px-4">Search Strategy</th>
                      <th className="py-3 px-4">Evaluation Function</th>
                      <th className="py-3 px-4">Time Complexity</th>
                      <th className="py-3 px-4">Space Complexity</th>
                      <th className="py-3 px-4">Completeness</th>
                      <th className="py-3 px-4">Optimality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-body">
                    <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-teal-700 dark:text-teal-300">A* Search</td>
                      <td className="py-3 px-4">Informed (Cost + Heuristic)</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#172033] dark:text-white">f(n) = g(n) + h(n)</td>
                      <td className="py-3 px-4 font-mono">O(b^d) worst-case</td>
                      <td className="py-3 px-4 font-mono">O(b^d) keeps all in memory</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">Yes</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">Yes (if h admissible)</td>
                    </tr>
                    <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-300">Greedy Best-First</td>
                      <td className="py-3 px-4">Informed (Heuristic Only)</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#172033] dark:text-white">f(n) = h(n)</td>
                      <td className="py-3 px-4 font-mono">O(b^m) worst-case</td>
                      <td className="py-3 px-4 font-mono">O(b^m)</td>
                      <td className="py-3 px-4 text-amber-700 font-bold">No (in loops)</td>
                      <td className="py-3 px-4 text-rose-700 font-bold">No</td>
                    </tr>
                    <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-blue-700 dark:text-blue-300">Breadth-First (BFS)</td>
                      <td className="py-3 px-4">Uninformed (FIFO Queue)</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#172033] dark:text-white">f(n) = depth(n)</td>
                      <td className="py-3 px-4 font-mono">O(b^d)</td>
                      <td className="py-3 px-4 font-mono">O(b^d)</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">Yes</td>
                      <td className="py-3 px-4 text-amber-700 font-bold">Only if step costs equal</td>
                    </tr>
                    <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-bold text-rose-700 dark:text-rose-300">Depth-First (DFS)</td>
                      <td className="py-3 px-4">Uninformed (LIFO Stack)</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#172033] dark:text-white">None (depth bound)</td>
                      <td className="py-3 px-4 font-mono">O(b^m)</td>
                      <td className="py-3 px-4 font-mono">O(b*m) linear memory</td>
                      <td className="py-3 px-4 text-rose-700 font-bold">No (infinite graphs)</td>
                      <td className="py-3 px-4 text-rose-700 font-bold">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ACADEMIC THEORY & HEURISTIC ADMISSIBILITY PROOF
         ========================================================================= */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          {/* Card: Heuristic Admissibility & Consistency */}
          <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#172033] dark:text-white font-heading">
                  Clinical Heuristic Function Formulation & Admissibility Proof
                </h3>
                <p className="text-xs text-[#526176] dark:text-slate-400">
                  Course: Artificial Intelligence • Unit 2 (Informed Search) & Unit 4 (Knowledge Representation)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#526176] dark:text-slate-300 leading-relaxed font-body">
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#172033] dark:text-white font-heading flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>1. Admissible Heuristic Condition: h(n) ≤ h*(n)</span>
                </h4>
                <p>
                  In computer science and artificial intelligence, a heuristic function <code className="text-teal-700 font-mono font-bold bg-teal-50 px-1 py-0.5 rounded">h(n)</code> is defined as <em>admissible</em> if it never overestimates the true cost <code className="font-mono font-bold">h*(n)</code> of reaching the goal from node <em>n</em>.
                </p>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono text-xs text-[#172033] dark:text-white">
                  <strong>h(n) = (Goal_Stage - Node_Stage) × Min_Hop_Delay</strong>
                  <p className="text-[11px] text-[#8492A6] mt-1 font-sans">
                    Where Min_Hop_Delay is bounded from below by the fastest diagnostic transport speed (5.0 minutes). Thus, h(n) is guaranteed admissible.
                  </p>
                </div>
                <p>
                  Because <code className="text-teal-700 font-mono font-bold">h(n)</code> is strictly admissible, <strong>A* tree-search is guaranteed to return an optimal pathway</strong> with minimal cumulative procedural delays.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#172033] dark:text-white font-heading flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>2. Dynamic Clinical Penalty Factor</span>
                </h4>
                <p>
                  Our healthcare engine integrates patient acuity directly into the heuristic calculation:
                </p>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono text-xs text-[#172033] dark:text-white">
                  <strong>h_clinical(n) = h_stage(n) + Acuity_Mismatch_Penalty</strong>
                  <p className="text-[11px] text-[#8492A6] mt-1 font-sans">
                    For critical patients (Severity ≥ 8.0), routes passing through ambulatory clinics accumulate a virtual heuristic delay penalty (+35m), steering the A* priority queue toward resuscitation pathways.
                  </p>
                </div>
                <p>
                  This ensures that algorithmic traversal mirrors human clinical intuition without violating the monotonicity requirement on search graphs.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Exclusion Rationale: Minimax & Alpha-Beta Pruning */}
          <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#172033] dark:text-white font-heading">
                  Evaluation and Explicit Exclusion of Minimax Search
                </h3>
                <p className="text-xs text-[#526176] dark:text-slate-400">
                  Academic Justification Requirement for B.Tech CSE AI Curriculum
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-[#172033] dark:text-white text-sm font-heading">
                  1. Zero-Sum Fallacy
                </h4>
                <p className="text-[#526176] dark:text-slate-300 leading-relaxed font-body">
                  Minimax assumes an adversarial zero-sum game where an intelligent opponent actively tries to minimize the agent's utility. In clinical care, biology and pathophysiology are non-adversarial natural phenomena, not calculating game agents.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-[#172033] dark:text-white text-sm font-heading">
                  2. Stochastic Uncertainty
                </h4>
                <p className="text-[#526176] dark:text-slate-300 leading-relaxed font-body">
                  Human disease progression is governed by physiological uncertainty and stochastic variation. Buchanan & Shortliffe Certainty Factors (CF) and Fuzzy Urgency Sets handle this domain far more effectively than deterministic game tree alternations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-[#172033] dark:text-white text-sm font-heading">
                  3. Ethical CDSS Mandate
                </h4>
                <p className="text-[#526176] dark:text-slate-300 leading-relaxed font-body">
                  Medical AI is legally and ethically an advisory decision support system (CDSS) for human doctors. Treating patient management as a competitive game violates clinical safety governance and ISO healthcare AI standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
