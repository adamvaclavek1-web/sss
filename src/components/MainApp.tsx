'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import GameArea from './GameArea'
import Leaderboard from './Leaderboard'
import { Profile } from '@/types'

interface MainAppProps {
  initialProfile: Profile | null
  userId: string | null
}

export default function MainApp({ initialProfile, userId }: MainAppProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      <Navbar
        profile={profile}
        userId={userId}
        onShowLeaderboard={() => setShowLeaderboard((v) => !v)}
        showingLeaderboard={showLeaderboard}
      />

      <main className="flex-1 pt-16 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!showLeaderboard ? (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col lg:flex-row gap-8 items-start justify-center pt-8"
              >
                {/* Game */}
                <div className="flex-1 flex justify-center">
                  <GameArea
                    profile={profile}
                    userId={userId}
                    onProfileUpdate={setProfile}
                  />
                </div>

                {/* Sidebar leaderboard (desktop) */}
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
                transition={{ duration: 0.3 }}
                className="max-w-lg mx-auto pt-8"
              >
                <Leaderboard currentUserId={userId ?? undefined} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-700">
        Not a casino. No real winnings. Streaks only. 🪙
      </footer>
    </div>
  )
}
