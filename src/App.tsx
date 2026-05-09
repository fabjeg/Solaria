import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import Scene from './components/Scene'
import TimeControls from './ui/TimeControls'
import PlanetInfo from './ui/PlanetInfo'
import QualityToggle from './ui/QualityToggle'
import BodySelector from './ui/BodySelector'
import { useSimStore } from './store/useSimStore'

function LoadingOverlay() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black pointer-events-none">
      <p className="text-white/50 text-xs tracking-[0.25em] uppercase mb-4">Chargement</p>
      <div className="w-48 h-px bg-white/15 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white/60 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const selectBody = useSimStore((s) => s.selectBody)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectBody(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectBody])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
      <Scene />
      <LoadingOverlay />

      <BodySelector />
      <TimeControls />
      <PlanetInfo />
      <QualityToggle />

      {/* CC-BY 4.0 attribution required by Solar System Scope license */}
      <footer className="fixed bottom-1 left-1/2 -translate-x-1/2 text-white/20 text-[10px] pointer-events-none select-none">
        Textures ©&nbsp;
        <a
          href="https://www.solarsystemscope.com/textures/"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto underline"
        >
          Solar System Scope
        </a>
        &nbsp;(CC-BY 4.0)
      </footer>
    </div>
  )
}
