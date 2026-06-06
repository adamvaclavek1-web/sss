'use client'

import { motion } from 'framer-motion'
import { CoinSide } from '@/types'

interface ChoiceButtonsProps {
  selected: CoinSide | null
  onSelect: (side: CoinSide) => void
  disabled: boolean
}

export default function ChoiceButtons({ selected, onSelect, disabled }: ChoiceButtonsProps) {
  return (
    <div className="flex gap-4 justify-center">
      {(['heads', 'tails'] as CoinSide[]).map((side) => {
        const isSelected = selected === side
        return (
          <motion.button
            key={side}
            onClick={() => !disabled && onSelect(side)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`
              relative px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest
              border-2 transition-all duration-200
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${isSelected
                ? 'choice-btn-selected text-yellow-300'
                : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="selection-indicator"
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.1))',
                  border: '2px solid rgba(255,215,0,0.6)',
                  boxShadow: '0 0 20px rgba(255,215,0,0.25), inset 0 0 20px rgba(255,215,0,0.05)',
                }}
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-2xl">{side === 'heads' ? '👑' : '🦅'}</span>
              <span>{side}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
