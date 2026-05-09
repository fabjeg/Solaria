import { useSimStore, type QualityTier } from '../store/useSimStore'

const TIERS: { value: QualityTier | null; label: string }[] = [
  { value: null,     label: 'Auto' },
  { value: 'high',   label: 'Haut' },
  { value: 'medium', label: 'Moyen' },
  { value: 'low',    label: 'Bas' },
]

export default function QualityToggle() {
  const { qualityTier, qualityOverride, setQualityOverride } = useSimStore()
  const active = qualityOverride ?? null

  return (
    <div className="fixed top-4 right-4 flex gap-1 opacity-30 hover:opacity-100 transition-opacity">
      {TIERS.map(({ value, label }) => (
        <button
          key={String(value)}
          onClick={() => setQualityOverride(value)}
          className={`text-xs px-2.5 py-1 border rounded transition-colors ${
            active === value
              ? 'border-white/60 text-white bg-white/10'
              : 'border-white/20 text-white/50 hover:border-white/40 hover:text-white/80'
          }`}
          title={value ? `Qualité ${label}` : `Qualité automatique (${qualityTier})`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
