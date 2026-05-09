import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, DoubleSide } from 'three'
import type { Mesh } from 'three'
import { useSimStore } from '../store/useSimStore'
import { BODY_RADII_SCENE } from '../lib/constants'

const RADIUS     = BODY_RADII_SCENE.saturn
const TILT       = 26.7 * (Math.PI / 180)   // Saturn axial tilt
const RING_INNER = RADIUS * 1.22             // Starts just outside the body (D-ring)
const RING_OUTER = RADIUS * 2.45             // Outer edge (A-ring)

interface SaturnProps {
  position: [number, number, number]
}

function SaturnFull({ position }: SaturnProps) {
  const meshRef     = useRef<Mesh>(null)
  const qualityTier = useSimStore((s) => s.qualityTier)
  const selectBody  = useSimStore((s) => s.selectBody)
  const bodyTex = useLoader(TextureLoader, '/textures/8k_saturn.jpg')
  // RGBA PNG: alpha channel carries ring transparency — no separate alphaMap needed
  const ringTex = useLoader(TextureLoader, '/textures/8k_saturn_ring_alpha.png')

  useFrame((_state, delta) => {
    // Saturn rotates in ~10.7h → visually faster than Earth (0.15)
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.33
  })

  return (
    <group
      position={position}
      rotation={[TILT, 0, 0]}
      onClick={(e) => { e.stopPropagation(); selectBody('saturn') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >

      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[RADIUS, qualityTier === 'high' ? 64 : 48, qualityTier === 'high' ? 64 : 48]} />
        <meshStandardMaterial map={bodyTex} roughness={0.85} metalness={0} />
      </mesh>

      {/* Rings: flat in the equatorial plane (rotated 90° from the group tilt) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[RING_INNER, RING_OUTER, qualityTier === 'high' ? 256 : 128]} />
        <meshStandardMaterial
          map={ringTex}
          side={DoubleSide}
          transparent
          depthWrite={false}
          roughness={1}
          metalness={0}
        />
      </mesh>

    </group>
  )
}

function SaturnSimple({ position }: SaturnProps) {
  const selectBody = useSimStore((s) => s.selectBody)
  return (
    <group
      position={position}
      rotation={[TILT, 0, 0]}
      onClick={(e) => { e.stopPropagation(); selectBody('saturn') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <mesh >
        <sphereGeometry args={[RADIUS, 16, 16]} />
        <meshStandardMaterial color="#e4d191" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RING_INNER, RING_OUTER, 64]} />
        <meshStandardMaterial
          color="#c8b560"
          side={DoubleSide}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function Saturn({ position }: SaturnProps) {
  const qualityTier = useSimStore((s) => s.qualityTier)
  if (qualityTier === 'low') return <SaturnSimple position={position} />
  return <SaturnFull position={position} />
}
