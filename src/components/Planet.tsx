import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import type { Mesh, Group } from 'three'
import { useSimStore } from '../store/useSimStore'

interface PlanetProps {
  name: string
  radius: number
  position: [number, number, number]
  texturePath: string
  highResTexturePath?: string
  // axial tilt in radians (applied on the outer group, independent from spin)
  tilt?: number
  // angular speed in rad/s (scene time). Negative = retrograde.
  rotationSpeed?: number
}

const PLANET_COLORS: Record<string, string> = {
  mercury: '#b5b5b5',
  venus:   '#e8cda0',
  mars:    '#c1440e',
  jupiter: '#c88b3a',
  saturn:  '#e4d191',
  uranus:  '#7de8e8',
  neptune: '#5b5ddf',
}

function PlanetMesh({
  name,
  radius,
  position,
  texturePath,
  highResTexturePath,
  tilt = 0,
  rotationSpeed = 0.15,
}: PlanetProps) {
  const groupRef    = useRef<Group>(null)
  const meshRef     = useRef<Mesh>(null)
  const qualityTier = useSimStore((s) => s.qualityTier)
  const selectBody  = useSimStore((s) => s.selectBody)
  const resolvedPath = qualityTier === 'high' && highResTexturePath ? highResTexturePath : texturePath
  const texture = useLoader(TextureLoader, resolvedPath)

  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * rotationSpeed
  })

  // group: world position + axial tilt (unchanged every frame → no conflict)
  // mesh:  self-rotation around local Y (accumulates via useFrame)
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[tilt, 0, 0]}
      onClick={(e) => { e.stopPropagation(); selectBody(name) }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, qualityTier === 'high' ? 48 : 32, qualityTier === 'high' ? 48 : 32]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
      </mesh>
    </group>
  )
}

function PlanetPlaceholder({ name, radius, position, tilt = 0 }: PlanetProps) {
  const selectBody = useSimStore((s) => s.selectBody)
  return (
    <group
      position={position}
      rotation={[tilt, 0, 0]}
      onClick={(e) => { e.stopPropagation(); selectBody(name) }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color={PLANET_COLORS[name] ?? '#888'} roughness={0.9} />
      </mesh>
    </group>
  )
}

export default function Planet(props: PlanetProps) {
  const qualityTier = useSimStore((s) => s.qualityTier)
  if (qualityTier === 'low') return <PlanetPlaceholder {...props} />
  return <PlanetMesh {...props} />
}
