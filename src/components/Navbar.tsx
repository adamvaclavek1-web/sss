'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, User, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AuthModal from './AuthModal'
import { Profile } from '@/types'

interface NavbarProps {
  profile: Profile | null
  userId: string | null
  onShowLeaderboard: () => void
  showingLeaderboard: boolean
}

export default function Navbar({ profile, userId, onShowLeaderboard, showingLeaderboard }: NavbarProps) {
  const [showAuth, setShowAuth] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 px-4 py-3"
        style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,215,0,0.08)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-2xl">🪙</span>
            <span className="font-black text-lg neon-gold tracking-tight">CoinFlip</span>
          </motion.div>

          {/* Center — toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => onShowLeaderboard()}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all ${
                !showingLeaderboard
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              🎮 Game
            </button>
            <button
              onClick={() => onShowLeaderboard()}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all ${
                showingLeaderboard
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Trophy size={12} />
              Leaderboard
            </button>
          </div>

          {/* User */}
          {userId && profile ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">{profile.username || 'Player'}</div>
                <div className="text-xs text-gray-500">Best: <span className="text-yellow-500 font-bold">{profile.best_streak}</span></div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:text-white transition-colors"
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
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  )
}
