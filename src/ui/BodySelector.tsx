import { useState, useRef, useEffect } from 'react'
import { useSimStore } from '../store/useSimStore'

const BODIES: { key: string; label: string; group: string }[] = [
  { key: 'sun',     label: 'Soleil',  group: 'Étoile' },
  { key: 'mercury', label: 'Mercure', group: 'Planètes intérieures' },
  { key: 'venus',   label: 'Vénus',   group: 'Planètes intérieures' },
  { key: 'earth',   label: 'Terre',   group: 'Planètes intérieures' },
  { key: 'moon',    label: 'Lune',    group: 'Satellites' },
  { key: 'mars',    label: 'Mars',    group: 'Planètes intérieures' },
  { key: 'jupiter', label: 'Jupiter', group: 'Planètes extérieures' },
  { key: 'saturn',  label: 'Saturne', group: 'Planètes extérieures' },
  { key: 'uranus',  label: 'Uranus',  group: 'Planètes extérieures' },
  { key: 'neptune', label: 'Neptune', group: 'Planètes extérieures' },
]

const GROUPS = ['Étoile', 'Planètes intérieures', 'Satellites', 'Planètes extérieures']

export default function BodySelector() {
  const { selectedBody, selectBody } = useSimStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = BODIES.find((b) => b.key === selectedBody)
  const label = current?.label ?? 'Naviguer…'

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const pick = (key: string) => {
    selectBody(key)
    setOpen(false)
  }

  return (
    <div ref={ref} className="fixed top-4 left-4 z-40">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-white/20 rounded-lg
                   text-white/70 hover:text-white hover:border-white/40 text-sm backdrop-blur-sm
                   transition-colors select-none"
      >
        <span className="text-white/40 text-xs">▶</span>
        <span>{label}</span>
        <span className={`text-white/30 text-xs transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 min-w-[160px] bg-black/80 border border-white/15
                        rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
          {/* Vue d'ensemble */}
          <button
            onClick={() => { selectBody(null); setOpen(false) }}
            className={`w-full text-left px-4 py-2 text-xs transition-colors
              ${!selectedBody
                ? 'text-white bg-white/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            Vue d'ensemble
          </button>

          <div className="border-t border-white/10" />

          {GROUPS.map((group) => {
            const items = BODIES.filter((b) => b.group === group)
            return (
              <div key={group}>
                <p className="px-4 pt-2.5 pb-1 text-[10px] text-white/25 uppercase tracking-widest">
                  {group}
                </p>
                {items.map((body) => (
                  <button
                    key={body.key}
                    onClick={() => pick(body.key)}
                    className={`w-full text-left px-4 py-1.5 text-sm transition-colors
                      ${selectedBody === body.key
                        ? 'text-white bg-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    {body.label}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
