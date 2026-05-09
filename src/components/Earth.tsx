import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, AdditiveBlending, Color, ShaderMaterial, FrontSide } from 'three'
import type { Mesh } from 'three'
import { useSimStore } from '../store/useSimStore'
import { BODY_RADII_SCENE } from '../lib/constants'
import atmosphereVert from '../shaders/atmosphereVertex.glsl?raw'
import atmosphereFrag from '../shaders/atmosphereFragment.glsl?raw'

const RADIUS = BODY_RADII_SCENE.earth
const TILT   = 23.44 * (Math.PI / 180)

interface EarthProps {
  position: [number, number, number]
}

function Atmosphere() {
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader:   atmosphereVert,
        fragmentShader: atmosphereFrag,
        uniforms: {
          uColor:     { value: new Color(0.25, 0.55, 1.0) },
          uPower:     { value: 3.5 },
          uIntensity: { value: 1.2 },
        },
        transparent: true,
        depthWrite:  false,
        side:        FrontSide,
        blending:    AdditiveBlending,
      }),
    []
  )

  return (
    <mesh material={mat}>
      <sphereGeometry args={[RADIUS * 1.06, 48, 48]} />
    </mesh>
  )
}

function EarthFull({ position }: EarthProps) {
  const meshRef    = useRef<Mesh>(null)
  const cloudsRef  = useRef<Mesh>(null)
  const selectBody = useSimStore((s) => s.selectBody)

  const dayTex    = useLoader(TextureLoader, '/textures/8k_earth_daymap.jpg')
  const nightTex  = useLoader(TextureLoader, '/textures/8k_earth_nightmap.jpg')
  const cloudsTex = useLoader(TextureLoader, '/textures/8k_earth_clouds.jpg')

  useFrame((_state, delta) => {
    if (meshRef.current)   meshRef.current.rotation.y   += delta * 0.15
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.18
  })

  return (
    <group
      position={position}
      rotation={[TILT, 0, 0]}
      onClick={(e) => { e.stopPropagation(); selectBody('earth') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >

      {/* Surface: daymap + city-lights night side */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={dayTex}
          emissiveMap={nightTex}
          emissive={[1, 0.85, 0.6]}
          emissiveIntensity={0.35}
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* Clouds — 2% above surface for Z-fighting clearance */}
      <mesh ref={cloudsRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[RADIUS * 1.02, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTex}
          alphaMap={cloudsTex}
          transparent
          opacity={0.45}
          depthWrite={false}
          roughness={1}
        />
      </mesh>

      {/* Atmosphere: Fresnel rim glow */}
      <Atmosphere />

    </group>
  )
}

function EarthMedium({ position }: EarthProps) {
  const meshRef    = useRef<Mesh>(null)
  const selectBody = useSimStore((s) => s.selectBody)
  const dayTex     = useLoader(TextureLoader, '/textures/8k_earth_daymap.jpg')
  const nightTex   = useLoader(TextureLoader, '/textures/8k_earth_nightmap.jpg')

  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15
  })

  return (
    <group
      position={position}
      rotation={[TILT, 0, 0]}
      onClick={(e) => { e.stopPropagation(); selectBody('earth') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial
          map={dayTex}
          emissiveMap={nightTex}
          emissive={[1, 0.85, 0.6]}
          emissiveIntensity={0.35}
          roughness={0.8}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

function EarthSimple({ position }: EarthProps) {
  const selectBody = useSimStore((s) => s.selectBody)
  return (
    <group
      position={position}
      rotation={[TILT, 0, 0]}
      onClick={(e) => { e.stopPropagation(); selectBody('earth') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <mesh >
        <sphereGeometry args={[RADIUS, 24, 24]} />
        <meshStandardMaterial color="#2a7fcb" roughness={0.8} />
      </mesh>
    </group>
  )
}

export default function Earth({ position }: EarthProps) {
  const qualityTier = useSimStore((s) => s.qualityTier)
  if (qualityTier === 'low')    return <EarthSimple  position={position} />
  if (qualityTier === 'medium') return <EarthMedium  position={position} />
  return <EarthFull position={position} />
}
