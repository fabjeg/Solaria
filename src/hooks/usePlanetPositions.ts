import { useMemo } from 'react'
import { Body, HelioVector, GeoMoon } from 'astronomy-engine'
import { AU_TO_SCENE, kmToScene, BODY_SEMIMAJOR_KM, MOON_VISUAL_ORBIT } from '../lib/constants'

export interface BodyPosition { x: number; y: number; z: number }

export interface PlanetPositions {
  mercury: BodyPosition
  venus:   BodyPosition
  earth:   BodyPosition
  moon:    BodyPosition   // position absolue en scène (pas relative à Terre)
  mars:    BodyPosition
  jupiter: BodyPosition
  saturn:  BodyPosition
  uranus:  BodyPosition
  neptune: BodyPosition
}

const AU_BODIES: { key: keyof Omit<PlanetPositions, 'moon'>; body: Body }[] = [
  { key: 'mercury', body: Body.Mercury },
  { key: 'venus',   body: Body.Venus   },
  { key: 'earth',   body: Body.Earth   },
  { key: 'mars',    body: Body.Mars    },
  { key: 'jupiter', body: Body.Jupiter },
  { key: 'saturn',  body: Body.Saturn  },
  { key: 'uranus',  body: Body.Uranus  },
  { key: 'neptune', body: Body.Neptune },
]

export function usePlanetPositions(date: Date): PlanetPositions {
  return useMemo(() => {
    const positions = {} as PlanetPositions

    for (const { key, body } of AU_BODIES) {
      try {
        const vec = HelioVector(body, date)
        // astronomy-engine: x = vernal equinox direction, z = north ecliptic pole
        // Three.js Y-up: swap z↔y, negate z for handedness
        positions[key] = {
          x:  vec.x * AU_TO_SCENE,
          y:  vec.z * AU_TO_SCENE,
          z: -vec.y * AU_TO_SCENE,
        }
      } catch {
        positions[key] = circularFallback(key as keyof typeof BODY_SEMIMAJOR_KM, date)
      }
    }

    // Moon: real GeoMoon gives direction (accurate for phase), but distance in
    // scene units (0.38 u) is << Earth radius (4 u). We keep the direction and
    // place the Moon at MOON_VISUAL_ORBIT units from Earth centre.
    try {
      const g = GeoMoon(date)
      // g is in AU; extract direction in ecliptic coords
      const len = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z)
      const nx =  g.x / len
      const ny =  g.z / len   // Three.js Y-up swap
      const nz = -g.y / len
      positions.moon = {
        x: positions.earth.x + nx * MOON_VISUAL_ORBIT,
        y: positions.earth.y + ny * MOON_VISUAL_ORBIT,
        z: positions.earth.z + nz * MOON_VISUAL_ORBIT,
      }
    } catch {
      positions.moon = {
        x: positions.earth.x + MOON_VISUAL_ORBIT,
        y: positions.earth.y,
        z: positions.earth.z,
      }
    }

    return positions
  }, [date])
}

function circularFallback(
  key: keyof typeof BODY_SEMIMAJOR_KM,
  date: Date
): BodyPosition {
  const r = kmToScene(BODY_SEMIMAJOR_KM[key])
  const t = date.getTime() / 1_000
  const speed = 1 / (r * 10)
  return { x: Math.cos(t * speed) * r, y: 0, z: Math.sin(t * speed) * r }
}
