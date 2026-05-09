import { useSimStore } from '../store/useSimStore'
import { PLANET_INFO } from '../lib/constants'

export default function PlanetInfo() {
  const { selectedBody, selectBody } = useSimStore()

  if (!selectedBody) return null

  const info = PLANET_INFO[selectedBody]
  if (!info) return null

  return (
    <div className="animate-panel-in fixed right-4 top-1/2 w-64 bg-black/70 border border-white/15 rounded-xl p-5 text-white backdrop-blur-sm">
      <button
        onClick={() => selectBody(null)}
        className="absolute top-3 right-3 text-white/40 hover:text-white text-lg leading-none"
        aria-label="Fermer"
      >
        ×
      </button>

      <h2 className="text-xl font-semibold mb-1">{info.name}</h2>
      <p className="text-white/50 text-xs mb-4">{info.type}</p>

      <ul className="space-y-2 text-sm">
        <InfoRow label="Masse" value={`${info.massKg} kg`} />
        <InfoRow label="Rayon" value={`${info.radiusKm.toLocaleString('fr-FR')} km`} />
        {info.orbitalPeriodDays > 0 && (
          <InfoRow
            label="Période orbitale"
            value={`${info.orbitalPeriodDays.toLocaleString('fr-FR')} jours`}
          />
        )}
        {info.avgDistanceAU > 0 && (
          <InfoRow label="Distance moyenne" value={`${info.avgDistanceAU} UA`} />
        )}
        {selectedBody !== 'moon' && (
          <InfoRow label="Lunes" value={info.moonCount.toString()} />
        )}
      </ul>

      <p className="mt-4 text-white/60 text-xs leading-relaxed border-t border-white/10 pt-3">
        {info.funFact}
      </p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-2">
      <span className="text-white/40">{label}</span>
      <span className="text-right">{value}</span>
    </li>
  )
}
