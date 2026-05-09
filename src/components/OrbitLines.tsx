import { useMemo } from 'react'
import { EllipseCurve, BufferGeometry, Float32BufferAttribute } from 'three'
import { kmToScene, BODY_SEMIMAJOR_KM } from '../lib/constants'

const ORBIT_BODIES = [
  'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'
] as const

const ORBIT_COLORS: Record<string, string> = {
  mercury: '#666',
  venus:   '#776',
  earth:   '#337',
  mars:    '#533',
  jupiter: '#554',
  saturn:  '#554',
  uranus:  '#355',
  neptune: '#335',
}

function OrbitLine({ name }: { name: typeof ORBIT_BODIES[number] }) {
  const points = useMemo(() => {
    const r = kmToScene(BODY_SEMIMAJOR_KM[name])
    const curve = new EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0)
    const pts = curve.getPoints(256)
    const positions = new Float32Array(pts.length * 3)
    pts.forEach((p, i) => {
      positions[i * 3]     = p.x
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = p.y
    })
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geo
  }, [name])

  return (
    <lineLoop geometry={points}>
      <lineBasicMaterial color={ORBIT_COLORS[name]} opacity={0.25} transparent depthWrite={false} />
    </lineLoop>
  )
}

export default function OrbitLines() {
  return (
    <>
      {ORBIT_BODIES.map((name) => (
        <OrbitLine key={name} name={name} />
      ))}
    </>
  )
}
