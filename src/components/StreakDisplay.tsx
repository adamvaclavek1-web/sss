'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'

interface StreakDisplayProps {
  currentStreak: number
  bestStreak: number
  lastResult: 'won' | 'lost' | null
}

export default function StreakDisplay({ currentStreak, bestStreak, lastResult }: StreakDisplayProps) {
  const isHot = currentStreak >= 3

  return (
    <div className="flex items-stretch justify-center gap-4">
      {/* Current Streak */}
      <div
        className="stat-card flex flex-col items-center flex-1 py-5"
        style={{ minWidth: 130, maxWidth: 160 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <motion.div
            animate={isHot ? { scale: [1, 1.25, 1], rotate: [-6, 6, -6] } : {}}
            transition={{ duration: 0.55, repeat: isHot ? Infinity : 0, repeatDelay: 1.8 }}
          >
            <Flame
              size={15}
              style={{ color: currentStreak > 0 ? '#ff8c00' : 'var(--text-muted)' }}
              fill={currentStreak > 0 ? '#ff8c00' : 'transparent'}
            />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Streak
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStreak}
            initial={{ scale: 0.55, opacity: 0, y: lastResult === 'won' ? 18 : -18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.55, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 28 }}
            className={`text-5xl font-black tabular-nums leading-none ${currentStreak > 0 ? 'streak-number' : ''}`}
            style={{ color: currentStreak === 0 ? 'var(--text-muted)' : undefined }}
          >
            {currentStreak}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch', margin: '8px 0' }} />

      {/* Best Streak */}
      <div
        className="stat-card flex flex-col items-center flex-1 py-5"
        style={{ minWidth: 130, maxWidth: 160 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Trophy size={15} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Best
          </span>
        </div>
        <motion.div
          className="text-5xl font-black tabular-nums leading-none"
          style={{ color: bestStreak > 0 ? 'var(--accent)' : 'var(--text-muted)' }}
          animate={lastResult === 'won' && bestStreak === currentStreak && bestStreak > 0
            ? { scale: [1, 1.18, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          {bestStreak}
        </motion.div>
      </div>
    </div>
  )
}
