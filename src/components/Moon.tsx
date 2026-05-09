import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { useSimStore } from '../store/useSimStore'
import { BODY_RADII_SCENE } from '../lib/constants'



const RADIUS = BODY_RADII_SCENE.moon

interface MoonProps {
  earthPosition: [number, number, number]
  moonPosition: [number, number, number]
}

export default function Moon({ moonPosition }: MoonProps) {
  const qualityTier = useSimStore((s) => s.qualityTier)
  const selectBody  = useSimStore((s) => s.selectBody)

  if (qualityTier === 'low') {
    return (
      <mesh
        position={moonPosition}
        onClick={(e) => { e.stopPropagation(); selectBody('moon') }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[RADIUS, 16, 16]} />
        <meshStandardMaterial color="#888" roughness={0.95} />
      </mesh>
    )
  }

  return <MoonTextured position={moonPosition} />
}

function MoonTextured({ position }: { position: [number, number, number] }) {
  const meshRef     = useRef<Mesh>(null)
  const qualityTier = useSimStore((s) => s.qualityTier)
  const selectBody  = useSimStore((s) => s.selectBody)
  const texture     = useLoader(TextureLoader, '/textures/8k_moon.jpg')

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      onClick={(e) => { e.stopPropagation(); selectBody('moon') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <sphereGeometry args={[RADIUS, qualityTier === 'high' ? 32 : 24, qualityTier === 'high' ? 32 : 24]} />
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
    </mesh>
  )
}
