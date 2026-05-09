import { useEffect } from 'react'
import { useSimStore, type QualityTier } from '../store/useSimStore'

export function useDeviceTier() {
  const setQualityTier = useSimStore((s) => s.setQualityTier)
  const qualityOverride = useSimStore((s) => s.qualityOverride)

  useEffect(() => {
    if (qualityOverride) {
      setQualityTier(qualityOverride)
      return
    }

    const tier = detectTier()
    setQualityTier(tier)
  }, [qualityOverride, setQualityTier])
}

function detectTier(): QualityTier {
  // Mobile → low
  if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    return 'low'
  }

  // GPU detection via WebGL debug extension
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      if (dbg) {
        const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string
        const lower = renderer.toLowerCase()
        if (
          lower.includes('intel') ||
          lower.includes('software') ||
          lower.includes('llvmpipe') ||
          lower.includes('swiftshader')
        ) {
          return 'medium'
        }
      }
    }
  } catch {
    // GPU info unavailable — assume medium to be safe
    return 'medium'
  }

  return 'high'
}
