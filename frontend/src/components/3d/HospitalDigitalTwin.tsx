import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { HeartPulse, Bed, Users, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface DepartmentPod {
  id: string;
  name: string;
  code: string;
  position: [number, number, number];
  color: string;
  status: 'Normal' | 'Warning' | 'Critical';
  bedsTotal: number;
  bedsAvail: number;
  staffCount: number;
  floor: string;
}

const PODS: DepartmentPod[] = [
  {
    id: 'trauma',
    name: 'Emergency Trauma Bay',
    code: 'EMER',
    position: [0, 0, 3],
    color: '#ef4444',
    status: 'Critical',
    bedsTotal: 25,
    bedsAvail: 4,
    staffCount: 12,
    floor: 'Ground Floor',
  },
  {
    id: 'cardio',
    name: 'Cardiology Care Center',
    code: 'CARD',
    position: [-3.5, 0.5, 0],
    color: '#0ea5e9',
    status: 'Normal',
    bedsTotal: 35,
    bedsAvail: 11,
    staffCount: 8,
    floor: 'Floor 2 - Wing A',
  },
  {
    id: 'icu',
    name: 'Critical Care ICU',
    code: 'ICU',
    position: [3.5, 0.8, 0],
    color: '#f59e0b',
    status: 'Critical',
    bedsTotal: 40,
    bedsAvail: 3,
    staffCount: 15,
    floor: 'Floor 3 - Critical',
  },
  {
    id: 'neuro',
    name: 'Neurology Stroke Unit',
    code: 'NEUR',
    position: [-2.2, 1.4, -3],
    color: '#8b5cf6',
    status: 'Normal',
    bedsTotal: 28,
    bedsAvail: 9,
    staffCount: 7,
    floor: 'Floor 3 - Wing B',
  },
  {
    id: 'pulmo',
    name: 'Pulmonology & Respiratory Care',
    code: 'PULM',
    position: [2.2, 1.4, -3],
    color: '#06b6d4',
    status: 'Warning',
    bedsTotal: 30,
    bedsAvail: 6,
    staffCount: 6,
    floor: 'Floor 2 - Wing C',
  },
  {
    id: 'pedi',
    name: 'Pediatrics & NICU',
    code: 'PEDI',
    position: [0, 1.8, -4.5],
    color: '#10b981',
    status: 'Normal',
    bedsTotal: 30,
    bedsAvail: 8,
    staffCount: 9,
    floor: 'Floor 1 - Wing A',
  },
];

// Interactive 3D Department Block
const BuildingBlock: React.FC<{
  pod: DepartmentPod;
  isSelected: boolean;
  onSelect: (pod: DepartmentPod) => void;
}> = ({ pod, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      if (pod.status === 'Critical') {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15 + 1.0;
        meshRef.current.scale.set(pulse, pulse * 1.2, pulse);
      } else if (hovered || isSelected) {
        meshRef.current.scale.set(1.15, 1.3, 1.15);
      } else {
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group position={pod.position}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pod);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[1.8, 1.2, 1.8]} />
          <meshStandardMaterial
            color={pod.color}
            roughness={0.2}
            metalness={0.8}
            emissive={pod.color}
            emissiveIntensity={hovered || isSelected ? 0.6 : pod.status === 'Critical' ? 0.8 : 0.25}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* 3D Label */}
        <Text
          position={[0, 1.1, 0]}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#0f172a"
        >
          {pod.code}
        </Text>
      </Float>

      {/* Base Pedestal Ring */}
      <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 32]} />
        <meshBasicMaterial
          color={pod.color}
          transparent
          opacity={hovered || isSelected ? 0.9 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Scene Foundation & Central Grid (Light Theme Matched)
const HospitalGround = () => {
  return (
    <group>
      <gridHelper args={[24, 24, '#0d9488', '#cbd5e1']} position={[0, -0.7, 0]} />
      {/* Central Core Hub */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.8, 2.2, 0.6, 32]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.3}
          metalness={0.5}
          emissive="#0d9488"
          emissiveIntensity={0.2}
        />
      </mesh>
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.24}
        color="#0f766e"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        CENTRAL TRIAGE ATRIUM
      </Text>
    </group>
  );
};

export const HospitalDigitalTwin: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState<DepartmentPod>(PODS[0]);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-black text-[#172033] dark:text-white tracking-tight font-heading">
              Hospital Campus 3D Digital Twin
            </h2>
          </div>
          <p className="text-xs text-[#526176] dark:text-slate-400 mt-1 font-body">
            Real-time interactive spatial twin powered by React Three Fiber (R3F). Click pods to inspect live acuity, bed occupancy, and alert states.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">WebGL Accelerated</Badge>
          <Badge variant="emergency" pulse>Live Sensors</Badge>
        </div>
      </div>

      {/* Main 3D Canvas / Twin Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[520px] p-0 relative overflow-hidden rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm group">
          {/* Canvas Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700/60 text-xs text-[#172033] dark:text-slate-200 pointer-events-none shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
            <span>Interactive: Drag to Rotate • Scroll to Zoom</span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 text-[11px] bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700/60 text-[#526176] dark:text-slate-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Red = &lt;10% Reserve Alert</span>
            </div>
          </div>

          {/* 3D Scene */}
          {!hasWebGLError ? (
            <Canvas
              camera={{ position: [0, 7, 10], fov: 45 }}
              onError={() => setHasWebGLError(true)}
              className="cursor-grab active:cursor-grabbing w-full h-full"
            >
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 15, 10]} intensity={1.2} />
              <directionalLight position={[-10, 10, -5]} intensity={0.6} />

              <Suspense fallback={null}>
                <HospitalGround />
                {PODS.map((pod) => (
                  <BuildingBlock
                    key={pod.id}
                    pod={pod}
                    isSelected={selectedPod.id === pod.id}
                    onSelect={setSelectedPod}
                  />
                ))}
              </Suspense>

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={5}
                maxDistance={18}
              />
            </Canvas>
          ) : (
            // Fallback Isometric Hospital Model if WebGL disabled
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-slate-950">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 dark:bg-teal-950/60 dark:border-teal-700 mb-4">
                <HeartPulse className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[#172033] dark:text-white">Campus Pod Map</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 max-w-md w-full">
                {PODS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPod(p)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPod.id === p.id
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm'
                        : 'bg-white border-gray-200 text-[#526176] hover:border-teal-400'
                    }`}
                  >
                    <p className="text-xs font-bold">{p.code}</p>
                    <p className="text-[11px] text-[#8492A6] truncate">{p.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Department Telemetry Panel */}
        <div className="rounded-[18px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Department Node Telemetry
              </span>
              <Badge
                variant={
                  selectedPod.status === 'Critical'
                    ? 'emergency'
                    : selectedPod.status === 'Warning'
                    ? 'warning'
                    : 'success'
                }
                pulse={selectedPod.status === 'Critical'}
              >
                {selectedPod.status}
              </Badge>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold text-[#172033] dark:text-white flex items-center gap-2 font-heading">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: selectedPod.color }}
                />
                {selectedPod.name}
              </h3>
              <p className="text-xs text-[#526176] dark:text-slate-400 mt-1">{selectedPod.floor}</p>
            </div>

            <div className="mt-6 space-y-4">
              {/* Bed Occupancy Meter */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#526176] dark:text-slate-300 font-medium">
                    <Bed className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Bed Allocation
                  </span>
                  <span className="font-mono font-bold text-[#172033] dark:text-white">
                    {selectedPod.bedsAvail} / {selectedPod.bedsTotal} Available
                  </span>
                </div>
                <div className="mt-2.5 w-full h-2 bg-gray-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (selectedPod.bedsAvail / selectedPod.bedsTotal) < 0.1
                        ? 'bg-rose-500'
                        : (selectedPod.bedsAvail / selectedPod.bedsTotal) < 0.2
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${(selectedPod.bedsAvail / selectedPod.bedsTotal) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#8492A6] dark:text-slate-400 mt-1.5 flex justify-between">
                  <span>
                    Availability:{' '}
                    {Math.round((selectedPod.bedsAvail / selectedPod.bedsTotal) * 100)}%
                  </span>
                  {(selectedPod.bedsAvail / selectedPod.bedsTotal) < 0.1 && (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">&lt;10% Rule Breached</span>
                  )}
                </p>
              </div>

              {/* Staffing Load */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <div>
                    <p className="text-xs font-semibold text-[#172033] dark:text-slate-200">On-Duty Medical Staff</p>
                    <p className="text-[11px] text-[#8492A6] dark:text-slate-400">Specialists, Surgeons, Nurses</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-[#172033] dark:text-white">
                  {selectedPod.staffCount}
                </span>
              </div>

              {/* Clinical Protocol */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50">
                <p className="text-xs font-semibold text-[#172033] dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Triage Readiness
                </p>
                <p className="text-xs text-[#526176] dark:text-slate-400 mt-1 leading-relaxed">
                  Mapped to decision graph node <code className="text-teal-700 dark:text-teal-300 font-mono font-bold bg-teal-50 dark:bg-slate-800 px-1 py-0.5 rounded">dept_{selectedPod.id}</code>. A* search dynamically computes transit minutes based on this node's live occupancy weight.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/60 text-center">
            <p className="text-[11px] text-[#8492A6] dark:text-slate-400">
              Select other pods in 3D scene or click below:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              {PODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPod(p)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedPod.id === p.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-[#526176] dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

