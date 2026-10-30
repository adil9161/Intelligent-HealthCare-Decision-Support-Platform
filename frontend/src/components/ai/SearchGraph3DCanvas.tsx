import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { SearchStep } from '../../types';
import {
  Compass,
  Maximize2,
  RotateCcw,
  Eye,
  Target,
  Sparkles,
  Info,
  Navigation,
} from 'lucide-react';

interface Node3DMeta {
  id: string;
  label: string;
  level: number;
  stageName: string;
  type: string;
  base_cost: number;
  description: string;
  target_dept?: string;
  position: [number, number, number];
}

interface SearchGraph3DCanvasProps {
  graphNodes: any[];
  graphEdges: any[];
  currentStep: SearchStep | null;
  optimalPath: string[];
  inspectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  isReducedMotion?: boolean;
}

// 3D Spatial Stage Positioning Matrix
const NODE_3D_POSITIONS: Record<string, [number, number, number]> = {
  // Stage 0: Intake Presentation
  triage_intake: [-9.5, 0, 0],

  // Stage 1: Acuity Streams (Curved Arc)
  triage_acuity_crit: [-5.0, 3.2, 0.8],
  triage_acuity_acute: [-5.0, 0.0, 0.0],
  triage_acuity_amb: [-5.0, -3.2, -0.8],

  // Stage 2: Stat Diagnostics & Labs (Vertical Fan)
  diag_ecg_trop: [-0.5, 4.0, 1.2],
  diag_ct_neuro: [-0.5, 2.4, 0.6],
  diag_fast_usg: [-0.5, 0.8, 0.0],
  diag_cxr_abg: [-0.5, -0.8, -0.4],
  diag_ortho_xr: [-0.5, -2.4, -0.8],
  diag_cmp_labs: [-0.5, -4.0, -1.2],

  // Stage 3: Specialized Inpatient Departments
  dept_cardio: [4.5, 4.0, 1.0],
  dept_neuro: [4.5, 2.4, 0.5],
  dept_trauma: [4.5, 0.8, 0.0],
  dept_pulmo: [4.5, -0.8, -0.4],
  dept_ortho: [4.5, -2.4, -0.8],
  dept_genmed: [4.5, -4.0, -1.0],

  // Stage 4: Critical Care Destinations
  dest_cath_lab: [9.5, 3.2, 0.6],
  dest_icu: [9.5, 1.0, 0.2],
  dest_inpatient_ward: [9.5, -1.2, -0.3],
  dest_outpatient: [9.5, -3.4, -0.6],
};

// Reusable Shared Geometries
const NODE_SPHERE_GEOMETRY = new THREE.SphereGeometry(0.48, 24, 24);
const RING_GEOMETRY = new THREE.RingGeometry(0.65, 0.82, 32);

// Smooth Camera Rig Controller
const CameraRig: React.FC<{
  targetFocus: [number, number, number] | null;
  controlsRef: React.RefObject<any>;
}> = ({ targetFocus, controlsRef }) => {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (targetFocus && controlsRef.current) {
      const targetVec = new THREE.Vector3(...targetFocus);
      // Interpolate target of OrbitControls
      controlsRef.current.target.lerp(targetVec, Math.min(1, delta * 3.5));

      // Calculate desired camera position offset
      const desiredCamPos = new THREE.Vector3(
        targetVec.x,
        targetVec.y + 1.2,
        targetVec.z + 7.5
      );
      camera.position.lerp(desiredCamPos, Math.min(1, delta * 2.5));
      controlsRef.current.update();
    }
  });

  return null;
};

// 3D Node Orb Component
const Node3DOrb: React.FC<{
  node: Node3DMeta;
  isCurrent: boolean;
  isInFrontier: boolean;
  isExplored: boolean;
  isInPath: boolean;
  isInspected: boolean;
  onSelect: (id: string) => void;
}> = ({
  node,
  isCurrent,
  isInFrontier,
  isExplored,
  isInPath,
  isInspected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Derive visual colors based on search states
  const { nodeColor, emissiveColor, emissiveIntensity, scaleMult } = useMemo(() => {
    if (isCurrent) {
      return {
        nodeColor: '#06b6d4',      // Bright Cyan
        emissiveColor: '#22d3ee',
        emissiveIntensity: 0.95,
        scaleMult: 1.35,
      };
    }
    if (isInPath) {
      return {
        nodeColor: '#0d9488',      // Vivid Teal
        emissiveColor: '#14b8a6',
        emissiveIntensity: 0.85,
        scaleMult: 1.25,
      };
    }
    if (isInFrontier) {
      return {
        nodeColor: '#f59e0b',      // Amber Frontier
        emissiveColor: '#fbbf24',
        emissiveIntensity: 0.7,
        scaleMult: 1.15,
      };
    }
    if (isExplored) {
      return {
        nodeColor: '#8b5cf6',      // Lavender Explored
        emissiveColor: '#a78bfa',
        emissiveIntensity: 0.5,
        scaleMult: 1.05,
      };
    }
    if (node.level === 0) {
      return {
        nodeColor: '#10b981',      // Emerald Intake
        emissiveColor: '#34d399',
        emissiveIntensity: 0.6,
        scaleMult: 1.15,
      };
    }
    if (node.level === 4) {
      return {
        nodeColor: '#3b82f6',      // Blue Goal Terminal
        emissiveColor: '#60a5fa',
        emissiveIntensity: 0.65,
        scaleMult: 1.2,
      };
    }
    // Neutral Unvisited
    return {
      nodeColor: '#94a3b8',
      emissiveColor: '#cbd5e1',
      emissiveIntensity: 0.15,
      scaleMult: 1.0,
    };
  }, [isCurrent, isInPath, isInFrontier, isExplored, node.level]);

  // Subtle continuous pulsation for active nodes
  useFrame((state) => {
    if (meshRef.current) {
      let targetScale = scaleMult;
      if (hovered || isInspected) {
        targetScale = scaleMult * 1.2;
      }
      if (isCurrent) {
        const pulse = Math.sin(state.clock.elapsedTime * 5.0) * 0.12 + 1.0;
        targetScale = scaleMult * pulse;
      }
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.15
      );
    }

    if (ringRef.current && (isCurrent || isInspected || isInPath)) {
      ringRef.current.rotation.z += 0.02;
    }
  });

  const acronym = useMemo(() => {
    if (node.label.length <= 14) return node.label;
    return node.label
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }, [node.label]);

  return (
    <group position={node.position}>
      {/* 3D Sphere Node */}
      <mesh
        ref={meshRef}
        geometry={NODE_SPHERE_GEOMETRY}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={nodeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.25}
          metalness={0.7}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Outer Selection / Status Aura Ring */}
      {(isCurrent || isInspected || isInPath || hovered) && (
        <mesh ref={ringRef} geometry={RING_GEOMETRY} position={[0, 0, 0]}>
          <meshBasicMaterial
            color={isCurrent ? '#06b6d4' : isInPath ? '#0d9488' : '#8b5cf6'}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Floating 3D Text Label */}
      <Text
        position={[0, 0.85, 0]}
        fontSize={0.26}
        color={hovered || isInspected ? '#0f172a' : '#334155'}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.035}
        outlineColor="#ffffff"
      >
        {acronym}
      </Text>

      {/* Base Cost Badge in 3D */}
      <Text
        position={[0, -0.75, 0]}
        fontSize={0.2}
        color="#0d9488"
        anchorX="center"
        anchorY="top"
        outlineWidth={0.025}
        outlineColor="#ffffff"
      >
        {node.base_cost}m
      </Text>
    </group>
  );
};

// 3D Connecting Edge with Animated Energy Conduit
const Edge3DConduit: React.FC<{
  fromPos: [number, number, number];
  toPos: [number, number, number];
  isPathEdge: boolean;
  isActiveEdge: boolean;
}> = ({ fromPos, toPos, isPathEdge, isActiveEdge }) => {
  const particleRef = useRef<THREE.Mesh>(null);

  // Animate traveling energy packet along active or path edges
  useFrame((state) => {
    if (particleRef.current && (isPathEdge || isActiveEdge)) {
      const speed = isPathEdge ? 1.4 : 2.2;
      const t = (state.clock.elapsedTime * speed) % 1.0;
      const x = fromPos[0] + (toPos[0] - fromPos[0]) * t;
      const y = fromPos[1] + (toPos[1] - fromPos[1]) * t;
      const z = fromPos[2] + (toPos[2] - fromPos[2]) * t;
      particleRef.current.position.set(x, y, z);
    }
  });

  const edgeColor = isPathEdge
    ? '#0d9488' // Teal Path
    : isActiveEdge
    ? '#06b6d4' // Cyan Active
    : '#cbd5e1'; // Subtle Slate

  const edgeWidth = isPathEdge ? 3.5 : isActiveEdge ? 2.5 : 1.2;

  return (
    <group>
      {/* 3D Connecting Line */}
      <Line
        points={[fromPos, toPos]}
        color={edgeColor}
        lineWidth={edgeWidth}
        transparent
        opacity={isPathEdge ? 0.95 : isActiveEdge ? 0.85 : 0.4}
      />

      {/* Traveling Energy Pulse Particle */}
      {(isPathEdge || isActiveEdge) && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshBasicMaterial
            color={isPathEdge ? '#2dd4bf' : '#38bdf8'}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
    </group>
  );
};

// Stage Spatial Boundary Columns
const StageColumns3D: React.FC = () => {
  const stages = [
    { name: 'Stage 0: Intake', x: -9.5, color: '#0d9488' },
    { name: 'Stage 1: Acuity', x: -5.0, color: '#f59e0b' },
    { name: 'Stage 2: Diagnostics', x: -0.5, color: '#6366f1' },
    { name: 'Stage 3: Clinical Dept', x: 4.5, color: '#3b82f6' },
    { name: 'Stage 4: Destination', x: 9.5, color: '#10b981' },
  ];

  return (
    <group position={[0, -5.2, 0]}>
      {/* Subtle floor grid for spatial depth */}
      <gridHelper args={[26, 26, '#94a3b8', '#e2e8f0']} position={[0, -0.2, 0]} />

      {stages.map((stg, idx) => (
        <group key={idx} position={[stg.x, 0, 0]}>
          {/* Stage floor marker ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.4, 1.55, 32]} />
            <meshBasicMaterial color={stg.color} transparent opacity={0.35} />
          </mesh>
          {/* Stage 3D Header Text */}
          <Text
            position={[0, 0.4, 2.2]}
            fontSize={0.36}
            color="#475569"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#ffffff"
          >
            {stg.name}
          </Text>
        </group>
      ))}
    </group>
  );
};

export const SearchGraph3DCanvas: React.FC<SearchGraph3DCanvasProps> = ({
  graphNodes,
  graphEdges,
  currentStep,
  optimalPath,
  inspectedNodeId,
  onSelectNode,
  isReducedMotion = false,
}) => {
  const controlsRef = useRef<any>(null);
  const [cameraFocus, setCameraFocus] = useState<[number, number, number] | null>(null);

  // Restore cursor on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Map graph nodes with 3D positions
  const mappedNodes3D: Node3DMeta[] = useMemo(() => {
    return (graphNodes || []).map((node) => ({
      ...node,
      position: NODE_3D_POSITIONS[node.id] || [0, 0, 0],
    }));
  }, [graphNodes]);

  // Build edge positions
  const mappedEdges3D = useMemo(() => {
    if (!graphEdges || graphEdges.length === 0) return [];
    return graphEdges
      .map((edge) => {
        const fromPos = NODE_3D_POSITIONS[edge.from];
        const toPos = NODE_3D_POSITIONS[edge.to];
        if (!fromPos || !toPos) return null;

        // Check if edge is in the optimal path
        const fromIdx = optimalPath.indexOf(edge.from);
        const toIdx = optimalPath.indexOf(edge.to);
        const isPathEdge =
          fromIdx !== -1 && toIdx !== -1 && toIdx === fromIdx + 1;

        // Check if edge connects from current step node
        const isActiveEdge = currentStep?.current_node === edge.from;

        return {
          id: `${edge.from}-${edge.to}`,
          fromPos,
          toPos,
          isPathEdge,
          isActiveEdge,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      fromPos: [number, number, number];
      toPos: [number, number, number];
      isPathEdge: boolean;
      isActiveEdge: boolean;
    }>;
  }, [graphEdges, optimalPath, currentStep]);

  // Focus presets
  const handleFocusStart = () => {
    setCameraFocus(NODE_3D_POSITIONS['triage_intake']);
  };

  const handleFocusActive = () => {
    if (currentStep?.current_node && NODE_3D_POSITIONS[currentStep.current_node]) {
      setCameraFocus(NODE_3D_POSITIONS[currentStep.current_node]);
    }
  };

  const handleFocusGoal = () => {
    const goalId = optimalPath[optimalPath.length - 1] || 'dest_cath_lab';
    if (NODE_3D_POSITIONS[goalId]) {
      setCameraFocus(NODE_3D_POSITIONS[goalId]);
    }
  };

  const handleResetCamera = () => {
    setCameraFocus([0, 0, 0]);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 via-white to-teal-50/20 border border-gray-200 dark:border-slate-800 shadow-inner">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 2.5, 17.5], fov: 46 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Ambient & Directed Clinical Illumination */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[10, 15, 12]} intensity={1.4} color="#f0fdfa" />
          <directionalLight position={[-10, 10, -8]} intensity={0.6} color="#e0f2fe" />
          <pointLight position={[0, 0, 10]} intensity={0.5} />

          {/* Camera Controls with Smooth Damping */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.08}
            maxDistance={32}
            minDistance={4}
            maxPolarAngle={Math.PI / 1.9}
            minPolarAngle={Math.PI / 6}
          />

          <CameraRig targetFocus={cameraFocus} controlsRef={controlsRef} />

          {/* Spatial Stage Foundation & Floor Headers */}
          <StageColumns3D />

          {/* 3D Graph Edges */}
          {mappedEdges3D.map((edge) => (
            <Edge3DConduit
              key={edge.id}
              fromPos={edge.fromPos}
              toPos={edge.toPos}
              isPathEdge={edge.isPathEdge}
              isActiveEdge={edge.isActiveEdge}
            />
          ))}

          {/* 3D Graph Nodes */}
          {mappedNodes3D.map((node) => (
            <Node3DOrb
              key={node.id}
              node={node}
              isCurrent={currentStep?.current_node === node.id}
              isInFrontier={Boolean(currentStep?.frontier_queue?.includes(node.id))}
              isExplored={Boolean(currentStep?.explored_set?.includes(node.id))}
              isInPath={optimalPath.includes(node.id)}
              isInspected={inspectedNodeId === node.id}
              onSelect={(id) => {
                onSelectNode(id);
                if (NODE_3D_POSITIONS[id]) {
                  setCameraFocus(NODE_3D_POSITIONS[id]);
                }
              }}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Floating 3D HUD & Camera Preset Controls */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
        <div className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-gray-200 text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-teal-600" />
          <span>Interactive 3D Spatial Graph</span>
        </div>

        <button
          onClick={handleResetCamera}
          className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-teal-50 backdrop-blur-md border border-gray-200 hover:border-teal-300 text-xs font-semibold text-gray-700 hover:text-teal-800 shadow-xs transition-colors flex items-center gap-1"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-3 h-3 text-gray-500" />
          <span>Reset</span>
        </button>

        <button
          onClick={handleFocusStart}
          className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-teal-50 backdrop-blur-md border border-gray-200 hover:border-teal-300 text-xs font-semibold text-gray-700 hover:text-teal-800 shadow-xs transition-colors flex items-center gap-1"
          title="Focus Triage Reception"
        >
          <Navigation className="w-3 h-3 text-teal-600" />
          <span>Start</span>
        </button>

        <button
          onClick={handleFocusActive}
          className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-cyan-50 backdrop-blur-md border border-gray-200 hover:border-cyan-300 text-xs font-semibold text-gray-700 hover:text-cyan-800 shadow-xs transition-colors flex items-center gap-1"
          title="Focus Active Traversal Step"
        >
          <Sparkles className="w-3 h-3 text-cyan-600" />
          <span>Active</span>
        </button>

        <button
          onClick={handleFocusGoal}
          className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-blue-50 backdrop-blur-md border border-gray-200 hover:border-blue-300 text-xs font-semibold text-gray-700 hover:text-blue-800 shadow-xs transition-colors flex items-center gap-1"
          title="Focus Destination Intervention Unit"
        >
          <Target className="w-3 h-3 text-blue-600" />
          <span>Goal</span>
        </button>
      </div>

      {/* Spatial Legend & Instructions Pill */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-gray-500 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-200" /> Current Step
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Optimal Path
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Frontier
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Explored
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-[10px] text-gray-400">
          Left Click + Drag: Rotate • Right Click: Pan • Scroll: Zoom
        </span>
      </div>
    </div>
  );
};

