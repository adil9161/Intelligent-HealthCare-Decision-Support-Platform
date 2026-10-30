import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural DNA Double Helix with translucent glowing materials
const DnaDoubleHelix: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate DNA geometry nodes and rungs
  const { strandA, strandB, rungs } = useMemo(() => {
    const numPoints = 50;
    const radius = 1.6;
    const height = 9.0;
    const turns = 2.5;

    const sA: [number, number, number][] = [];
    const sB: [number, number, number][] = [];
    const rPairs: Array<{ p1: [number, number, number]; p2: [number, number, number] }> = [];

    for (let i = 0; i < numPoints; i++) {
      const t = (i / (numPoints - 1)) * Math.PI * 2 * turns;
      const y = (i / (numPoints - 1)) * height - height / 2;

      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;

      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      sA.push([x1, y, z1]);
      sB.push([x2, y, z2]);

      // Add connecting rungs every 2 points
      if (i % 2 === 0) {
        rPairs.push({ p1: [x1, y, z1], p2: [x2, y, z2] });
      }
    }

    return { strandA: sA, strandB: sB, rungs: rPairs };
  }, []);

  // Slow continuous rotation around Y-axis
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[1.5, 0, 0]}>
      {/* Strand A Nodes (Teal / Cyan) */}
      {strandA.map((pos, idx) => (
        <mesh key={`a-${idx}`} position={pos}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#2dd4bf"
            emissive="#14b8a6"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Strand B Nodes (Soft White / Coral Glow) */}
      {strandB.map((pos, idx) => (
        <mesh key={`b-${idx}`} position={pos}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#ff6b6b"
            emissive="#f43f5e"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Connecting Rungs (Translucent Base-Pair Cylinders) */}
      {rungs.map((pair, idx) => {
        const p1 = new THREE.Vector3(...pair.p1);
        const p2 = new THREE.Vector3(...pair.p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dist = p1.distanceTo(p2);

        // Compute orientation quaternion
        const orientation = new THREE.Matrix4();
        const up = new THREE.Vector3(0, 1, 0);
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        orientation.lookAt(p1, p2, up);

        return (
          <group key={`rung-${idx}`} position={[mid.x, mid.y, mid.z]}>
            <mesh
              quaternion={new THREE.Quaternion().setFromRotationMatrix(orientation)}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.025, 0.025, dist, 8]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#5eead4' : '#ff8787'}
                emissive={idx % 2 === 0 ? '#0d9488' : '#e11d48'}
                emissiveIntensity={0.4}
                transparent
                opacity={0.65}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Ambient Floating Bio-Data Particle Field
const FloatingParticleField: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const teal = new THREE.Color('#2dd4bf');
    const coral = new THREE.Color('#ff6b6b');
    const white = new THREE.Color('#f8fafc');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const pick = Math.random();
      const chosen = pick > 0.65 ? coral : pick > 0.25 ? teal : white;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Camera parallax responder that gently follows mouse coordinates
const CameraMouseParallax: React.FC = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    const targetX = mouse.current.x * 0.8;
    const targetY = mouse.current.y * 0.5;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export const DnaHelixHeroScene: React.FC<{ isReducedMotion?: boolean }> = ({
  isReducedMotion = false,
}) => {
  if (isReducedMotion) {
    // Elegant fallback gradient when user prefers reduced motion
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-teal-950 via-teal-900/60 to-midnight-950 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-[500px] h-[500px] rounded-full bg-radial from-teal-500/20 via-coral-500/10 to-transparent blur-3xl opacity-60" />
      </div>
    );
  }

  return (
    <div className="w-full h-full absolute inset-0 pointer-events-auto" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]} // optimize for 60fps on mid-range laptops
      >
        {/* Soft Ambient & Directional Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 8, 5]} intensity={1.2} color="#ccfbf1" />
        <directionalLight position={[-6, -4, -3]} intensity={0.8} color="#fecdd3" />
        <pointLight position={[0, 0, 4]} intensity={0.9} color="#2dd4bf" distance={10} />

        {/* 3D Scene Elements */}
        <DnaDoubleHelix />
        <FloatingParticleField />
        <CameraMouseParallax />
      </Canvas>
    </div>
  );
};

