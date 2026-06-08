'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import GameArea from './GameArea'
import Leaderboard from './Leaderboard'
import { Profile } from '@/types'
import type { Theme } from './ThemeSelector'

interface MainAppProps {
  initialProfile: Profile | null
  userId: string | null
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'gold'
  return (localStorage.getItem('cf_theme') as Theme) || 'gold'
}

export default function MainApp({ initialProfile, userId }: MainAppProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [theme, setTheme] = useState<Theme>('gold')

  // Sync theme from localStorage after hydration
  useEffect(() => {
    setTheme(getInitialTheme())
  }, [])

  // Check for theme purchase success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('theme_success') === 'true') {
      const t = params.get('theme') as Theme
      if (t) {
        setTheme(t)
        localStorage.setItem('cf_theme', t)
      }
      window.history.replaceState({}, '', '/')
      window.location.reload()
    }
  }, [])

  const handleThemeChange = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('cf_theme', t)
  }

  // Owned themes: gold always owned; cyber/synth if in profile
  const ownedThemes: Theme[] = ['gold', ...((profile as any)?.owned_themes ?? [])]

  return (
    <div
      className="min-h-screen flex flex-col relative"
      data-theme={theme}
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Background layers */}
      <div className="bg-scene" aria-hidden>
        <div className="bg-glow" />
        <div className="bg-glow-bottom" />
        {/* Cyber-only grid — visible only when [data-theme=cyber] */}
        <div className="bg-grid" />
        {/* Synth-only sun */}
        <div className="bg-sun" />
      </div>

      {/* CRT + noise overlays */}
      <div className="crt-overlay" aria-hidden />
      <div className="noise-overlay" aria-hidden />

      <Navbar
        profile={profile}
        userId={userId}
        onShowLeaderboard={() => setShowLeaderboard(v => !v)}
        showingLeaderboard={showLeaderboard}
        theme={theme}
        ownedThemes={ownedThemes}
        onThemeChange={handleThemeChange}
      />

      <main className="relative z-10 flex-1 pt-16 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!showLeaderboard ? (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col lg:flex-row gap-8 items-start justify-center pt-8"
              >
                <div className="flex-1 flex justify-center">
                  <GameArea
                    profile={profile}
                    userId={userId}
                    onProfileUpdate={setProfile}
                  />
                </div>
                <div className="hidden lg:block w-80">
                  <Leaderboard currentUserId={userId ?? undefined} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="max-w-lg mx-auto pt-8"
              >
                <Leaderboard currentUserId={userId ?? undefined} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        Not a casino. No real winnings. Streaks only. 🪙
      </footer>
    </div>
  )
}
