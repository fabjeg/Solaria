import { useRef, useEffect, useCallback } from 'react'
import { useSimStore } from '../store/useSimStore'

const MIN_YEAR = 1900
const MAX_YEAR = 2100
const MIN_MS = new Date(`${MIN_YEAR}-01-01`).getTime()
const MAX_MS = new Date(`${MAX_YEAR}-12-31`).getTime()

const SPEEDS = [-100, -10, -1, 0, 1, 10, 100, 1000] as const
const SPEED_LABELS: Record<number, string> = {
  '-100': '◀◀100×',
  '-10':  '◀◀10×',
  '-1':   '◀1×',
  0:      '⏸',
  1:      '1×',
  10:     '10×',
  100:    '100×',
  1000:   '1000×',
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function TimeControls() {
  const { currentDate, timeSpeed, isPlaying, setDate, setTimeSpeed, setPlaying } = useSimStore()
  const animRef = useRef<number | null>(null)
  const lastRealTime = useRef<number>(Date.now())

  const tick = useCallback(() => {
    if (!useSimStore.getState().isPlaying) return

    const now = Date.now()
    const deltaSec = (now - lastRealTime.current) / 1000
    lastRealTime.current = now

    const { currentDate: d, timeSpeed: speed } = useSimStore.getState()
    const newMs = d.getTime() + deltaSec * speed * 86_400_000
    const clampedMs = Math.max(MIN_MS, Math.min(MAX_MS, newMs))
    useSimStore.getState().setDate(new Date(clampedMs))

    animRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (isPlaying) {
      lastRealTime.current = Date.now()
      animRef.current = requestAnimationFrame(tick)
    } else {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
  }, [isPlaying, tick])

  const sliderValue = ((currentDate.getTime() - MIN_MS) / (MAX_MS - MIN_MS)) * 1000

  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ratio = Number(e.target.value) / 1000
    const ms = MIN_MS + ratio * (MAX_MS - MIN_MS)
    setDate(new Date(ms))
  }

  const goToToday = () => setDate(new Date())

  const togglePlay = () => {
    setPlaying(!isPlaying)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-6 pb-4 pt-3 bg-gradient-to-t from-black/80 to-transparent">
      {/* Date display */}
      <div className="text-center mb-2">
        <span className="text-white/80 text-sm font-light tracking-widest uppercase">
          {formatDate(currentDate)}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={1000}
        step={0.001}
        value={sliderValue}
        onChange={onSliderChange}
        className="w-full h-1 bg-white/20 rounded appearance-none cursor-pointer mb-3"
        style={{ accentColor: 'rgba(255,255,255,0.8)' }}
      />

      {/* Controls row */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={goToToday}
          className="text-white/60 hover:text-white text-xs px-3 py-1.5 border border-white/20 rounded hover:border-white/50 transition-colors"
          title="Aujourd'hui"
        >
          ⏮ Aujourd'hui
        </button>

        <button
          onClick={togglePlay}
          className="text-white hover:text-yellow-300 text-lg w-8 h-8 flex items-center justify-center border border-white/30 rounded-full hover:border-yellow-300/50 transition-colors"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Speed buttons */}
        <div className="flex gap-1">
          {SPEEDS.filter(s => s !== 0).map((speed) => (
            <button
              key={speed}
              onClick={() => { setTimeSpeed(speed); setPlaying(true) }}
              className={`text-xs px-2 py-1 border rounded transition-colors ${
                timeSpeed === speed && isPlaying
                  ? 'border-yellow-400/70 text-yellow-300 bg-yellow-400/10'
                  : 'border-white/20 text-white/50 hover:text-white hover:border-white/50'
              }`}
            >
              {SPEED_LABELS[speed]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
