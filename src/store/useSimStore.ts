import { create } from 'zustand'

export type QualityTier = 'high' | 'medium' | 'low'

interface SimStore {
  currentDate: Date
  timeSpeed: number        // jours simulés par seconde réelle (0 = pause)
  isPlaying: boolean
  selectedBody: string | null
  qualityTier: QualityTier
  qualityOverride: QualityTier | null  // null = auto

  setDate: (date: Date) => void
  setTimeSpeed: (speed: number) => void
  setPlaying: (playing: boolean) => void
  selectBody: (name: string | null) => void
  setQualityTier: (tier: QualityTier) => void
  setQualityOverride: (tier: QualityTier | null) => void
}

export const useSimStore = create<SimStore>((set) => ({
  currentDate: new Date(),
  timeSpeed: 1,
  isPlaying: false,
  selectedBody: null,
  qualityTier: 'high',
  qualityOverride: null,

  setDate: (date) => set({ currentDate: date }),
  setTimeSpeed: (timeSpeed) => set({ timeSpeed }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  selectBody: (selectedBody) => set({ selectedBody }),
  setQualityTier: (qualityTier) => set({ qualityTier }),
  setQualityOverride: (qualityOverride) => set({ qualityOverride }),
}))
