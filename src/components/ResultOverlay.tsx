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

export default function ResultOverlay({ result, onContinue, onReroll, onAcceptLoss, isRerolling }: ResultOverlayProps) {
  if (!result) return null

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: -16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="w-full"
        >
          {result.won ? (
            <motion.div
              className="game-card p-7 text-center"
              style={{ border: '1px solid rgba(var(--win-rgb),0.35)', boxShadow: '0 0 50px rgba(var(--win-rgb),0.1)' }}
            >
              {/* Particles */}
              <div className="relative h-0 overflow-visible">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2.5 h-2.5 rounded-full"
                    style={{
                      background: ['var(--accent)', 'var(--win)', '#ff6b35', 'var(--accent2)', '#fff'][i % 5],
                      left: '50%', top: 0,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos((i / 10) * Math.PI * 2) * 110,
                      y: Math.sin((i / 10) * Math.PI * 2) * 80,
                      opacity: 0, scale: 0,
                    }}
                    transition={{ duration: 0.85, delay: 0.05, ease: 'easeOut' }}
                  />
                ))}
              </div>

              <motion.div
                animate={{ rotate: [0, -12, 12, -6, 6, 0] }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="flex justify-center mb-4"
              >
                <CheckCircle size={52} className="neon-green" />
              </motion.div>

              <motion.h2
                className="text-4xl font-black mb-2 neon-green"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.35, delay: 0.18 }}
              >
                CORRECT!
              </motion.h2>

              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                Landed on <span className="font-bold uppercase" style={{ color: 'var(--text)' }}>{result.result}</span>
              </p>
              <p className="text-base mb-6" style={{ color: 'var(--text-muted)' }}>
                Streak:{' '}
                <span className="neon-gold font-black text-2xl">{result.newStreak}</span>
              </p>

              <motion.button
                onClick={onContinue}
                className="btn-primary w-full py-4 text-base font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                Flip Again →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="game-card p-7"
              style={{ border: '1px solid rgba(var(--loss-rgb),0.3)', boxShadow: '0 0 50px rgba(var(--loss-rgb),0.08)' }}
            >
              {/* Top: icon + title */}
              <div className="flex items-center gap-4 mb-5">
                <motion.div
                  animate={{ rotate: [0, -18, 18, -9, 9, 0] }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  className="flex-shrink-0"
                >
                  <XCircle size={48} className="neon-red" />
                </motion.div>
                <div>
                  <motion.h2
                    className="text-3xl font-black neon-red leading-none"
                    animate={{ scale: [1, 1.07, 1] }}
                    transition={{ duration: 0.35, delay: 0.18 }}
                  >
                    WRONG!
                  </motion.h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Landed on <span className="font-bold uppercase" style={{ color: 'var(--text)' }}>{result.result}</span>
                    {' '}— streak{' '}
                    <span style={{ color: 'var(--loss)', fontWeight: 700 }}>×0</span>
                  </p>
                </div>
              </div>

              {/* Reroll box */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{ background: 'rgba(var(--loss-rgb),0.06)', border: '1px solid rgba(var(--loss-rgb),0.2)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>🎲 Save your streak</p>
                    {typeof result.rerollCount === 'number' && result.rerollCount > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Re-roll #{(result.rerollCount || 0) + 1} — doubles each time
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black" style={{ color: 'var(--text)' }}>${result.rerollCost}</span>
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>USD</span>
                  </div>
                </div>

                <motion.button
                  onClick={onReroll}
                  disabled={isRerolling}
                  className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {isRerolling ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <RefreshCw size={16} />
                    </motion.div>
                  ) : (
                    <><RefreshCw size={16} />Pay ${result.rerollCost} &amp; Re-Roll</>
                  )}
                </motion.button>
              </div>

              <button
                onClick={onAcceptLoss}
                className="btn-ghost w-full py-2.5 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Accept loss — reset streak to 0
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
