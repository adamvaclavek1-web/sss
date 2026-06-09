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
            whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`choice-btn ${isSelected ? 'choice-btn-selected' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {isSelected && (
              <motion.div
                layoutId="sel"
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'rgba(var(--accent-rgb),0.10)',
                  border: '2px solid rgba(var(--accent-rgb),0.6)',
                  boxShadow: '0 0 24px rgba(var(--accent-rgb),0.2)',
                  borderRadius: 18,
                }}
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-1.5">
              <span className="text-2xl">{side === 'heads' ? '👑' : '⭐'}</span>
              <span className="text-xs">{side.toUpperCase()}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
