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
        className="fixed top-0 left-0 right-0 z-40 px-5 py-3"
        style={{
          background: 'rgba(8,7,11,0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div className="flex items-center gap-2.5 flex-shrink-0" whileHover={{ scale: 1.03 }}>
            {/* Two-tone coin icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="13" fill="url(#nav-coin-bg)" stroke="rgba(255,197,61,0.6)" strokeWidth="1"/>
              {/* Gold half */}
              <path d="M14 1 A13 13 0 0 1 14 27 Z" fill="url(#nav-gold)"/>
              {/* Blue half */}
              <path d="M14 1 A13 13 0 0 0 14 27 Z" fill="url(#nav-blue)"/>
              {/* Center divider */}
              <line x1="14" y1="1" x2="14" y2="27" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
              {/* H label */}
              <text x="9" y="18" textAnchor="middle" fontSize="8" fontWeight="800" fill="rgba(120,80,10,0.9)" fontFamily="sans-serif">H</text>
              {/* T label */}
              <text x="19" y="18" textAnchor="middle" fontSize="8" fontWeight="800" fill="rgba(10,50,110,0.9)" fontFamily="sans-serif">T</text>
              <defs>
                <radialGradient id="nav-coin-bg" cx="40%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#2a1a00"/>
                  <stop offset="100%" stopColor="#060614"/>
                </radialGradient>
                <linearGradient id="nav-gold" x1="14" y1="1" x2="14" y2="27" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffe384"/>
                  <stop offset="100%" stopColor="#c8820a"/>
                </linearGradient>
                <linearGradient id="nav-blue" x1="14" y1="1" x2="14" y2="27" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7ec8f8"/>
                  <stop offset="100%" stopColor="#1050a8"/>
                </linearGradient>
              </defs>
            </svg>
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
