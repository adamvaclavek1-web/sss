'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { FlipResult } from '@/types'

interface ResultOverlayProps {
  result: FlipResult | null
  onContinue: () => void
  onReroll: () => void
  onAcceptLoss: () => void
  isRerolling: boolean
}

export default function ResultOverlay({
  result,
  onContinue,
  onReroll,
  onAcceptLoss,
  isRerolling,
}: ResultOverlayProps) {
  if (!result) return null

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="w-full"
        >
          {result.won ? (
            /* WIN STATE */
            <motion.div
              className="game-card p-6 text-center"
              style={{ border: '1px solid rgba(0,255,136,0.3)', boxShadow: '0 0 40px rgba(0,255,136,0.15)' }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex justify-center mb-3"
              >
                <CheckCircle size={48} className="neon-green" />
              </motion.div>

              <motion.h2
                className="text-3xl font-black mb-1 neon-green"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                CORRECT!
              </motion.h2>

              <p className="text-gray-400 text-sm mb-4">
                It was <span className="font-bold text-white uppercase">{result.result}</span>.
                Your streak is now{' '}
                <span className="neon-gold font-black text-xl">{result.newStreak}</span>
              </p>

              {/* Particle burst effect */}
              <div className="relative">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ['#ffd700', '#00ff88', '#ff6b35', '#bf5fff'][i % 4],
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos((i / 8) * Math.PI * 2) * 80,
                      y: Math.sin((i / 8) * Math.PI * 2) * 80,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                  />
                ))}
              </div>

              <motion.button
                onClick={onContinue}
                className="btn-primary w-full py-4 text-base mt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Flip Again →
              </motion.button>
            </motion.div>
          ) : (
            /* LOSS STATE */
            <motion.div
              className="game-card p-6 text-center"
              style={{ border: '1px solid rgba(255,45,85,0.3)', boxShadow: '0 0 40px rgba(255,45,85,0.15)' }}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -8, 8, 0] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex justify-center mb-3"
              >
                <XCircle size={48} className="neon-red" />
              </motion.div>

              <motion.h2
                className="text-3xl font-black mb-1 neon-red"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                WRONG!
              </motion.h2>

              <p className="text-gray-400 text-sm mb-1">
                It was <span className="font-bold text-white uppercase">{result.result}</span>.
                Your streak of{' '}
                <span className="neon-gold font-black">{result.newStreak === 0 ? result.newStreak + (result.rerollCost ? result.rerollCost * 0 : 0) : result.newStreak}</span> is at risk!
              </p>

              {/* Reroll offer */}
              <div
                className="rounded-xl p-4 my-4"
                style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)' }}
              >
                <p className="text-sm font-semibold text-gray-300 mb-1">
                  🎲 Save your streak with a Re-Roll
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-black text-white">${result.rerollCost}</span>
                  <span className="text-gray-500 text-sm">USD</span>
                </div>
                {typeof result.rerollCount === 'number' && result.rerollCount > 0 && (
                  <p className="text-xs text-gray-600 mb-3">
                    Re-roll #{(result.rerollCount || 0) + 1} — price doubles each time
                  </p>
                )}

                <motion.button
                  onClick={onReroll}
                  disabled={isRerolling}
                  className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mb-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isRerolling ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw size={16} />
                    </motion.div>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Pay ${result.rerollCost} & Re-Roll
                    </>
                  )}
                </motion.button>

                <button
                  onClick={onAcceptLoss}
                  className="btn-ghost w-full py-2 text-sm"
                >
                  Accept loss (streak → 0)
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
