import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { OrbitControls } from 'three-stdlib'
import type { RefObject } from 'react'
import { useSimStore } from '../store/useSimStore'
import { usePlanetPositions } from '../hooks/usePlanetPositions'
import { BODY_RADII_SCENE } from '../lib/constants'
import type { PlanetPositions } from '../hooks/usePlanetPositions'

interface Props {
  controlsRef: RefObject<OrbitControls | null>
}

export default function CameraController({ controlsRef }: Props) {
  const { camera }   = useThree()
  const selectedBody = useSimStore(s => s.selectedBody)
  const currentDate  = useSimStore(s => s.currentDate)
  const pos          = usePlanetPositions(currentDate)

  // Keep latest positions accessible in the effect without re-triggering it
  const posRef = useRef(pos)
  posRef.current = pos

  const animating  = useRef(false)
  const camTarget  = useRef(new Vector3())
  const lookTarget = useRef(new Vector3())

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selectedBody) {
      animating.current = false
      if (controlsRef.current) controlsRef.current.enabled = true
      return
    }

    let bodyPos: Vector3
    if (selectedBody === 'sun') {
      bodyPos = new Vector3(0, 0, 0)
    } else {
      const p = posRef.current[selectedBody as keyof PlanetPositions]
      if (!p) return
      bodyPos = new Vector3(p.x, p.y, p.z)
    }

    const radius   = BODY_RADII_SCENE[selectedBody as keyof typeof BODY_RADII_SCENE] ?? 5
    const distance = Math.max(radius * 5, 25)

    // Approach from current viewing direction to avoid a jarring teleport
    const dir = camera.position.clone().sub(bodyPos)
    if (dir.lengthSq() < 0.01) dir.set(0, 0.3, 1)
    dir.normalize()

    lookTarget.current.copy(bodyPos)
    camTarget.current.copy(bodyPos).addScaledVector(dir, distance)

    if (controlsRef.current) controlsRef.current.enabled = false
    animating.current = true
  }, [selectedBody])

  useFrame((_state, delta) => {
    if (!animating.current || !controlsRef.current) return

    const k = 1 - Math.exp(-5 * delta)
    camera.position.lerp(camTarget.current, k)
    controlsRef.current.target.lerp(lookTarget.current, k)
    controlsRef.current.update()

    if (camera.position.distanceTo(camTarget.current) < 0.5) {
      camera.position.copy(camTarget.current)
      controlsRef.current.target.copy(lookTarget.current)
      controlsRef.current.update()
      controlsRef.current.enabled = true
      animating.current = false
    }
  })

  return null
}
