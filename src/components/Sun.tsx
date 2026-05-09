import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, Color, ShaderMaterial } from 'three'
import type { Mesh } from 'three'
import { useSimStore } from '../store/useSimStore'
import { SUN_RADIUS_SCENE } from '../lib/constants'
import sunVert from '../shaders/sunVertex.glsl?raw'
import sunFrag from '../shaders/sunFragment.glsl?raw'

function SunMesh() {
  const meshRef     = useRef<Mesh>(null)
  const qualityTier = useSimStore((s) => s.qualityTier)
  const selectBody  = useSimStore((s) => s.selectBody)
  const texture     = useLoader(TextureLoader, '/textures/8k_sun.jpg')

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader:   sunVert,
        fragmentShader: sunFrag,
        uniforms: {
          uTime:    { value: 0 },
          uTexture: { value: texture },
        },
      }),
    [texture]
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mat.uniforms.uTime.value = t
    if (meshRef.current) meshRef.current.rotation.y = t * 0.04
  })

  return (
    <group
      onClick={(e) => { e.stopPropagation(); selectBody('sun') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <mesh ref={meshRef} material={mat} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[SUN_RADIUS_SCENE, qualityTier === 'high' ? 64 : 48, qualityTier === 'high' ? 64 : 48]} />
      </mesh>
    </group>
  )
}

function SunPlaceholder() {
  const color      = useMemo(() => new Color(5, 3.2, 0.8), [])
  const selectBody = useSimStore((s) => s.selectBody)
  return (
    <mesh
      castShadow={false}
      receiveShadow={false}
      onClick={(e) => { e.stopPropagation(); selectBody('sun') }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <sphereGeometry args={[SUN_RADIUS_SCENE, 32, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

export default function Sun() {
  const qualityTier = useSimStore((s) => s.qualityTier)
  if (qualityTier === 'low') return <SunPlaceholder />
  return <SunMesh />
}
