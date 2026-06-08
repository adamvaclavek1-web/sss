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
    <div className="flex items-center justify-center gap-6">
      {/* Current Streak */}
      <div className="stat-card flex flex-col items-center min-w-[100px]">
        <div className="flex items-center gap-1.5 mb-1">
          <motion.div
            animate={isHot ? { scale: [1, 1.2, 1], rotate: [-5, 5, -5] } : {}}
            transition={{ duration: 0.6, repeat: isHot ? Infinity : 0, repeatDelay: 1.5 }}
          >
            <Flame
              size={16}
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
            initial={{ scale: 0.6, opacity: 0, y: lastResult === 'won' ? 16 : -16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className={`text-5xl font-black tabular-nums leading-none mt-1 ${currentStreak > 0 ? 'streak-number' : ''}`}
            style={{ color: currentStreak === 0 ? 'var(--text-muted)' : undefined }}
          >
            {currentStreak}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Best Streak */}
      <div className="stat-card flex flex-col items-center min-w-[100px]">
        <div className="flex items-center gap-1.5 mb-1">
          <Trophy size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Best
          </span>
        </div>
        <div className="text-3xl font-bold leading-none mt-1" style={{ color: 'var(--text)' }}>
          {bestStreak}
        </div>
      </div>
    </div>
  )
}
