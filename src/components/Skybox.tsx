import { useLoader } from '@react-three/fiber'
import { TextureLoader, BackSide, SRGBColorSpace } from 'three'
import { useMemo, useEffect } from 'react'
import { useSimStore } from '../store/useSimStore'

// Procedural stars — always rendered on top of (or under) the texture skybox
function StarField({ count }: { count: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 4200 + Math.random() * 300
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi)
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return pos
  }, [count])

  return (
    <points renderOrder={-2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={1.2}
        sizeAttenuation={false}
        depthWrite={false}
        transparent
        opacity={0.85}
      />
    </points>
  )
}

function MilkyWayBox() {
  const texture = useLoader(TextureLoader, '/textures/8k_stars_milky_way.jpg')
  // Set colorSpace once after load — mutating on every render forces GPU re-upload
  useEffect(() => { texture.colorSpace = SRGBColorSpace; texture.needsUpdate = true }, [texture])
  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[4000, 32, 16]} />
      <meshBasicMaterial map={texture} side={BackSide} depthWrite={false} />
    </mesh>
  )
}

export default function Skybox() {
  const qualityTier = useSimStore((s) => s.qualityTier)
  return (
    <>
      <MilkyWayBox />
      <StarField count={qualityTier === 'high' ? 8000 : 3000} />
    </>
  )
}
