'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'

interface StreakDisplayProps {
  currentStreak: number
  bestStreak: number
  lastResult: 'won' | 'lost' | null
}

export default function StreakDisplay({ currentStreak, bestStreak, lastResult }: StreakDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-8">
      {/* Current Streak */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div
            animate={currentStreak > 0 ? { scale: [1, 1.2, 1], rotate: [-5, 5, -5] } : {}}
            transition={{ duration: 0.5, repeat: currentStreak > 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            <Flame
              size={20}
              className={currentStreak > 0 ? 'text-orange-400' : 'text-gray-600'}
              fill={currentStreak > 0 ? '#f97316' : 'transparent'}
            />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Streak
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStreak}
            initial={{ scale: 0.5, opacity: 0, y: lastResult === 'won' ? 20 : -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`text-6xl font-black tabular-nums ${
              currentStreak > 0 ? 'streak-number neon-gold' : 'text-gray-600'
            }`}
          >
            {currentStreak}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-16 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

      {/* Best Streak */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy size={16} className="text-yellow-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Best
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-400">
          {bestStreak}
        </div>
      </div>
    </div>
  )
}
