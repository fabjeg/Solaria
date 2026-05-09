// ===========================================================
// SOLARIA — Constantes d'échelle
//
// Problème fondamental : à l'échelle réelle, les planètes sont
// des points sub-pixel et le Soleil engloutit Mercure/Vénus.
//
// Choix visuels documentés :
//   AU_TO_SCENE = 150   → 1 AU = 150 unités scène
//                          Mercure (0.387 AU) = 58 u > Sun radius (15 u) ✓
//   SUN_RADIUS_SCENE = 15  → taille réduite ~×7.3 vs réel à cette échelle
//                             (réel = 696 000 km / 6 371 km × 1.0 = 109 u → trop grand)
//   PLANET_VISUAL_SCALE = 4 → rayons planètes ×4 pour la navigation
//                              Terre = 4 u, Jupiter = 44 u. Ratios relatifs conservés.
//   Moon orbit = Earth_radius × 6 → orbit visuel fixé (astronomique = 0.38 u ≪ rayon Terre)
// ===========================================================

export const KM_PER_AU = 149_597_870.7

// 1 AU → 150 unités scène (doublé vs v0 pour sortir Mercure du Soleil)
export const AU_TO_SCENE = 150

// Echelle de base: 1 rayon Terre = 1 scène unit AVANT le facteur visuel
export const EARTH_RADIUS_KM    = 6_371
export const EARTH_RADIUS_SCENE = 1.0
export const SIZE_SCALE         = EARTH_RADIUS_SCENE / EARTH_RADIUS_KM

// Multiplicateur visuel planètes (×4). Préserve les ratios relatifs.
export const PLANET_VISUAL_SCALE = 4

// km → unités scène pour les distances orbitales
export const kmToScene = (km: number) => (km / KM_PER_AU) * AU_TO_SCENE

// Rayon visuel du Soleil : 15 unités (valeur choisie pour équilibre visuel)
export const SUN_RADIUS_SCENE = 7.5

// --------------------------------------------------------
// Rayons réels (km)
// --------------------------------------------------------
export const BODY_RADII_KM = {
  sun:     696_000,
  mercury:   2_439.7,
  venus:     6_051.8,
  earth:     6_371.0,
  moon:      1_737.4,
  mars:      3_389.5,
  jupiter:  69_911.0,
  saturn:   58_232.0,
  uranus:   25_362.0,
  neptune:  24_622.0,
} as const

// Rayons visuels scène: planètes ×PLANET_VISUAL_SCALE, Soleil = SUN_RADIUS_SCENE
export const BODY_RADII_SCENE: Record<keyof typeof BODY_RADII_KM, number> = {
  sun:     SUN_RADIUS_SCENE,
  mercury: BODY_RADII_KM.mercury * SIZE_SCALE * PLANET_VISUAL_SCALE,
  venus:   BODY_RADII_KM.venus   * SIZE_SCALE * PLANET_VISUAL_SCALE,
  earth:   BODY_RADII_KM.earth   * SIZE_SCALE * PLANET_VISUAL_SCALE,
  moon:    BODY_RADII_KM.moon    * SIZE_SCALE * PLANET_VISUAL_SCALE,
  mars:    BODY_RADII_KM.mars    * SIZE_SCALE * PLANET_VISUAL_SCALE,
  jupiter: BODY_RADII_KM.jupiter * SIZE_SCALE * PLANET_VISUAL_SCALE,
  saturn:  BODY_RADII_KM.saturn  * SIZE_SCALE * PLANET_VISUAL_SCALE,
  uranus:  BODY_RADII_KM.uranus  * SIZE_SCALE * PLANET_VISUAL_SCALE,
  neptune: BODY_RADII_KM.neptune * SIZE_SCALE * PLANET_VISUAL_SCALE,
}

// Distance visuelle Lune-Terre : orbital réel (0.38 u) ≪ rayon Terre (4 u).
// On fixe à Earth_radius × 6 pour une orbite visible autour de la Terre.
export const MOON_VISUAL_ORBIT = BODY_RADII_SCENE.earth * 6

// --------------------------------------------------------
// Demi-grand axe réel (km) → unités scène pour les lignes d'orbite
// --------------------------------------------------------
export const BODY_SEMIMAJOR_KM = {
  mercury:    57_909_050,
  venus:     108_208_000,
  earth:     149_598_023,
  moon:          384_400,
  mars:      227_936_000,
  jupiter:   778_479_000,
  saturn:  1_432_041_000,
  uranus:  2_867_043_000,
  neptune: 4_515_432_000,
} as const

export const BODY_SEMIMAJOR_SCENE = Object.fromEntries(
  Object.entries(BODY_SEMIMAJOR_KM).map(([k, v]) => [k, kmToScene(v)])
) as Record<keyof typeof BODY_SEMIMAJOR_KM, number>

// --------------------------------------------------------
// Données affichées dans le panel planète
// --------------------------------------------------------
export interface PlanetData {
  name: string
  type: string
  massKg: string
  radiusKm: number
  orbitalPeriodDays: number
  avgDistanceAU: number
  moonCount: number
  funFact: string
}

export const PLANET_INFO: Record<string, PlanetData> = {
  sun: {
    name: 'Soleil',
    type: 'Étoile naine jaune (type G)',
    massKg: '1,989 × 10³⁰',
    radiusKm: 696_000,
    orbitalPeriodDays: 0,
    avgDistanceAU: 0,
    moonCount: 0,
    funFact: 'Le Soleil représente 99,86 % de la masse totale du système solaire.',
  },
  moon: {
    name: 'Lune',
    type: 'Satellite naturel',
    massKg: '7,342 × 10²²',
    radiusKm: 1_737.4,
    orbitalPeriodDays: 27.32,
    avgDistanceAU: 0.00257,
    moonCount: 0,
    funFact: "La Lune s'éloigne de la Terre d'environ 3,8 cm par an.",
  },
  mercury: {
    name: 'Mercure',
    type: 'Planète tellurique',
    massKg: '3,285 × 10²³',
    radiusKm: 2_439.7,
    orbitalPeriodDays: 87.97,
    avgDistanceAU: 0.387,
    moonCount: 0,
    funFact: "Une journée sur Mercure dure plus longtemps qu'une année mercurienne.",
  },
  venus: {
    name: 'Vénus',
    type: 'Planète tellurique',
    massKg: '4,867 × 10²⁴',
    radiusKm: 6_051.8,
    orbitalPeriodDays: 224.7,
    avgDistanceAU: 0.723,
    moonCount: 0,
    funFact: "Vénus tourne à l'envers par rapport aux autres planètes.",
  },
  earth: {
    name: 'Terre',
    type: 'Planète tellurique',
    massKg: '5,972 × 10²⁴',
    radiusKm: 6_371,
    orbitalPeriodDays: 365.25,
    avgDistanceAU: 1.0,
    moonCount: 1,
    funFact: 'La seule planète connue abritant la vie.',
  },
  mars: {
    name: 'Mars',
    type: 'Planète tellurique',
    massKg: '6,390 × 10²³',
    radiusKm: 3_389.5,
    orbitalPeriodDays: 686.97,
    avgDistanceAU: 1.524,
    moonCount: 2,
    funFact: 'Olympus Mons est le plus grand volcan du système solaire (25 km de haut).',
  },
  jupiter: {
    name: 'Jupiter',
    type: 'Géante gazeuse',
    massKg: '1,898 × 10²⁷',
    radiusKm: 69_911,
    orbitalPeriodDays: 4_332.59,
    avgDistanceAU: 5.204,
    moonCount: 95,
    funFact: 'La Grande Tâche Rouge est une tempête qui dure depuis plus de 350 ans.',
  },
  saturn: {
    name: 'Saturne',
    type: 'Géante gazeuse',
    massKg: '5,683 × 10²⁶',
    radiusKm: 58_232,
    orbitalPeriodDays: 10_759.22,
    avgDistanceAU: 9.537,
    moonCount: 146,
    funFact: "Saturne est moins dense que l'eau — elle flotterait dans un océan gigantesque.",
  },
  uranus: {
    name: 'Uranus',
    type: 'Géante de glace',
    massKg: '8,681 × 10²⁵',
    radiusKm: 25_362,
    orbitalPeriodDays: 30_688.5,
    avgDistanceAU: 19.191,
    moonCount: 28,
    funFact: 'Uranus orbite couchée sur le côté, avec une inclinaison axiale de 98°.',
  },
  neptune: {
    name: 'Neptune',
    type: 'Géante de glace',
    massKg: '1,024 × 10²⁶',
    radiusKm: 24_622,
    orbitalPeriodDays: 60_182,
    avgDistanceAU: 30.069,
    moonCount: 16,
    funFact: 'Les vents de Neptune atteignent 2 100 km/h — les plus rapides du système solaire.',
  },
}
