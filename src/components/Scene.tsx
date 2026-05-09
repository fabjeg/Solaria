import { Canvas } from '@react-three/fiber'
import { OrbitControls, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { Suspense, useRef, useEffect } from 'react'
import { ACESFilmicToneMapping, NoToneMapping, HalfFloatType } from 'three'
import { ToneMappingMode } from 'postprocessing'
import { useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import CameraController from './CameraController'
import Sun from './Sun'
import Planet from './Planet'
import Earth from './Earth'
import Saturn from './Saturn'
import Moon from './Moon'
import Skybox from './Skybox'
import OrbitLines from './OrbitLines'
import { useSimStore } from '../store/useSimStore'
import { usePlanetPositions } from '../hooks/usePlanetPositions'
import { useDeviceTier } from '../hooks/useDeviceTier'
import { BODY_RADII_SCENE } from '../lib/constants'

const D2R = Math.PI / 180

const TILT = {
  mercury:   0.034 * D2R,
  venus:   177.36 * D2R,
  mars:     25.19 * D2R,
  jupiter:   3.13 * D2R,
  uranus:   97.77 * D2R,
  neptune:  28.32 * D2R,
} as const

const ROT = {
  mercury:  0.025,
  venus:   -0.015,
  mars:     0.145,
  jupiter:  0.38,
  uranus:  -0.10,
  neptune:  0.12,
} as const

// Configures renderer toneMapping per quality tier:
//   low  → ACESFilmic on renderer (no EffectComposer)
//   else → NoToneMapping on renderer (EffectComposer ToneMapping effect handles it)
function SceneSetup() {
  const { gl } = useThree()
  const qualityTier = useSimStore((s) => s.qualityTier)
  useDeviceTier()

  useEffect(() => {
    gl.toneMapping = qualityTier === 'low' ? ACESFilmicToneMapping : NoToneMapping
    gl.toneMappingExposure = 1.0
  }, [qualityTier, gl])

  return null
}

// Sun's PointLight — castShadow only on high (cube shadow map = 6 passes/frame)
function Lights() {
  const qualityTier = useSimStore((s) => s.qualityTier)
  return (
    <>
      <pointLight
        position={[0, 0, 0]}
        intensity={4}
        decay={0}
        castShadow={qualityTier === 'high'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={20}
        shadow-camera-far={5000}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.025} />
    </>
  )
}

// HDR Bloom pipeline: scene renders with NoToneMapping → Bloom on raw HDR values →
// ToneMapping effect maps to display. Skipped on low tier (renderer handles tonemapping).
function PostFX() {
  const qualityTier = useSimStore((s) => s.qualityTier)
  if (qualityTier === 'low') return null
  return (
    <EffectComposer frameBufferType={HalfFloatType} multisampling={0}>
      <Bloom
        intensity={1.0}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.4}
        radius={0.85}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} middleGrey={0.5} maxLuminance={8.0} />
    </EffectComposer>
  )
}

function SolarSystem() {
  const { currentDate } = useSimStore()
  const pos = usePlanetPositions(currentDate)

  return (
    <>
      <Skybox />
      <OrbitLines />
      <Sun />

      <Planet
        name="mercury"
        radius={BODY_RADII_SCENE.mercury}
        position={[pos.mercury.x, pos.mercury.y, pos.mercury.z]}
        texturePath="/textures/8k_mercury.jpg"
        tilt={TILT.mercury}
        rotationSpeed={ROT.mercury}
      />
      <Planet
        name="venus"
        radius={BODY_RADII_SCENE.venus}
        position={[pos.venus.x, pos.venus.y, pos.venus.z]}
        texturePath="/textures/8k_venus_surface.jpg"
        tilt={TILT.venus}
        rotationSpeed={ROT.venus}
      />
      <Earth position={[pos.earth.x, pos.earth.y, pos.earth.z]} />
      <Moon
        earthPosition={[pos.earth.x, pos.earth.y, pos.earth.z]}
        moonPosition={[pos.moon.x, pos.moon.y, pos.moon.z]}
      />
      <Planet
        name="mars"
        radius={BODY_RADII_SCENE.mars}
        position={[pos.mars.x, pos.mars.y, pos.mars.z]}
        texturePath="/textures/8k_mars.jpg"
        tilt={TILT.mars}
        rotationSpeed={ROT.mars}
      />
      <Planet
        name="jupiter"
        radius={BODY_RADII_SCENE.jupiter}
        position={[pos.jupiter.x, pos.jupiter.y, pos.jupiter.z]}
        texturePath="/textures/8k_jupiter.jpg"
        tilt={TILT.jupiter}
        rotationSpeed={ROT.jupiter}
      />
      <Saturn position={[pos.saturn.x, pos.saturn.y, pos.saturn.z]} />
      <Planet
        name="uranus"
        radius={BODY_RADII_SCENE.uranus}
        position={[pos.uranus.x, pos.uranus.y, pos.uranus.z]}
        texturePath="/textures/2k_uranus.jpg"
        tilt={TILT.uranus}
        rotationSpeed={ROT.uranus}
      />
      <Planet
        name="neptune"
        radius={BODY_RADII_SCENE.neptune}
        position={[pos.neptune.x, pos.neptune.y, pos.neptune.z]}
        texturePath="/textures/2k_neptune.jpg"
        tilt={TILT.neptune}
        rotationSpeed={ROT.neptune}
      />
    </>
  )
}

export default function Scene() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const selectBody  = useSimStore((s) => s.selectBody)

  return (
    <Canvas
      camera={{ position: [0, 120, 400], fov: 50, near: 0.1, far: 20000 }}
      dpr={[1, 2]}
      shadows
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: NoToneMapping,
      }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => selectBody(null)}
    >
      <AdaptiveDpr pixelated />
      <SceneSetup />
      <Lights />
      <PostFX />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.06}
        minDistance={18}
        maxDistance={12000}
        zoomSpeed={0.5}
        zoomToCursor
      />
      <CameraController controlsRef={controlsRef} />
      <Suspense fallback={null}>
        <SolarSystem />
      </Suspense>
    </Canvas>
  )
}
