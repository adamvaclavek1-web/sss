'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, User, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AuthModal from './AuthModal'
import ThemeSelector, { Theme } from './ThemeSelector'
import { Profile } from '@/types'

interface NavbarProps {
  profile: Profile | null
  userId: string | null
  onShowLeaderboard: () => void
  showingLeaderboard: boolean
  theme: Theme
  ownedThemes: Theme[]
  onThemeChange: (t: Theme) => void
}

export default function Navbar({
  profile, userId, onShowLeaderboard, showingLeaderboard,
  theme, ownedThemes, onThemeChange,
}: NavbarProps) {
  const [showAuth, setShowAuth] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-4 py-3"
        style={{
          background: 'rgba(8,7,11,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div className="flex items-center gap-2 flex-shrink-0" whileHover={{ scale: 1.02 }}>
            <span className="text-2xl">🪙</span>
            <span className="font-black text-lg neon-gold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              CoinFlip
            </span>
          </motion.div>

          {/* Tab toggle */}
          <div
            className="flex rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <button
              onClick={() => showingLeaderboard && onShowLeaderboard()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all"
              style={{
                background: !showingLeaderboard ? 'rgba(var(--accent-rgb),0.18)' : 'transparent',
                color: !showingLeaderboard ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              🎮 Game
            </button>
            <button
              onClick={() => !showingLeaderboard && onShowLeaderboard()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all"
              style={{
                background: showingLeaderboard ? 'rgba(var(--accent-rgb),0.18)' : 'transparent',
                color: showingLeaderboard ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Trophy size={12} />
              Leaderboard
            </button>
          </div>

          {/* Right side: theme + user */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeSelector
              current={theme}
              owned={ownedThemes}
              onSelect={onThemeChange}
              userId={userId}
            />

            {userId && profile ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                    {profile.username || 'Player'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Best:{' '}
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>
                      {profile.best_streak}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
              >
                <User size={14} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  )
}
