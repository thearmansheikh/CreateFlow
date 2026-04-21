"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"

function Particles({ count = 600 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null!)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30

      const t = Math.random()
      colors[i * 3] = 0.49 * (1 - t) + 0.02 * t
      colors[i * 3 + 1] = 0.36 * (1 - t) + 0.71 * t
      colors[i * 3 + 2] = 0.93 * (1 - t) + 0.83 * t

      sizes[i] = Math.random() * 3 + 1
    }

    return { positions, colors, sizes }
  }, [count])

  const positionGeometry = useMemo(
    () => new THREE.BufferAttribute(particles.positions, 3),
    [particles.positions]
  )
  const colorGeometry = useMemo(
    () => new THREE.BufferAttribute(particles.colors, 3),
    [particles.colors]
  )

  const elapsedRef = useRef(0)

  useFrame((_, delta) => {
    elapsedRef.current += delta
    const time = elapsedRef.current
    meshRef.current.rotation.y = time * 0.02
    meshRef.current.rotation.x = Math.sin(time * 0.01) * 0.1
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry
        attributes-position={positionGeometry}
        attributes-color={colorGeometry}
      />
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function FloatingOrbs() {
  return (
    <>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[4, 2, -3]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={2} transparent opacity={0.7} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh position={[-5, -1, -4]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} transparent opacity={0.7} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh position={[2, -3, -2]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={1.5} transparent opacity={0.5} />
        </mesh>
      </Float>
    </>
  )
}

function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null!)

  const lineGeometry = useMemo(() => {
    const positions: number[] = []
    for (let i = -10; i <= 10; i++) {
      positions.push(i, -10, -5, i, 10, -5)
      positions.push(-10, i, -5, 10, i, -5)
    }
    return new THREE.BufferAttribute(new Float32Array(positions), 3)
  }, [])

  const elapsedRef2 = useRef(0)

  useFrame((_, delta) => {
    elapsedRef2.current += delta
    if (linesRef.current) {
      linesRef.current.rotation.z = elapsedRef2.current * 0.01
    }
  })

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry attributes-position={lineGeometry} />
      <lineBasicMaterial color="#7c3aed" transparent opacity={0.04} />
    </lineSegments>
  )
}

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.1} />
        <Particles count={500} />
        <FloatingOrbs />
        <ConnectionLines />
      </Canvas>
    </div>
  )
}
