'use client'

import { motion, useAnimation, PanInfo } from 'framer-motion'
import { useRef, useState } from 'react'

interface CoinProps {
  onSwipeUp: () => void
  isFlipping: boolean
  result: 'heads' | 'tails' | null
  disabled: boolean
}

export default function Coin({ onSwipeUp, isFlipping, result, disabled }: CoinProps) {
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)

  const handleDragStart = () => {
    if (disabled) return
    setIsDragging(true)
  }

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (disabled) return
    // Only allow upward drag
    if (info.offset.y < 0) {
      controls.set({ y: info.offset.y * 0.4 })
    }
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (disabled) {
      setIsDragging(false)
      return
    }
    setIsDragging(false)

    // Trigger flip if swiped up more than 60px or velocity is high enough
    if (info.offset.y < -60 || info.velocity.y < -400) {
      controls.start({ y: 0 })
      onSwipeUp()
    } else {
      // Snap back
      controls.start({ y: 0, transition: { type: 'spring', stiffness: 400, damping: 20 } })
    }
  }

  // Determine coin final rotation based on result
  const finalRotation = result === 'tails' ? 180 : 0

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Glow ring behind coin */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
        }}
        animate={
          isFlipping
            ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
            : result === null
            ? { scale: 1, opacity: 0.5 }
            : result !== null
            ? { scale: 1.1, opacity: 0.8 }
            : {}
        }
        transition={{ duration: 0.6, repeat: isFlipping ? Infinity : 0 }}
      />

      {/* Draggable wrapper */}
      <motion.div
        drag={!disabled && !isFlipping ? 'y' : false}
        dragConstraints={{ top: -150, bottom: 20 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={!disabled && !isFlipping ? { scale: 0.96 } : {}}
        style={{ cursor: disabled || isFlipping ? 'default' : 'grab', touchAction: 'none' }}
      >
        {/* Coin container with 3D perspective */}
        <div className="coin-wrapper" style={{ width: 280, height: 280 }}>
          <motion.div
            className="coin-inner"
            style={{ width: 280, height: 280 }}
            animate={
              isFlipping
                ? {
                    rotateY: [0, 360, 720, 1080, 1440, 1800 + finalRotation * 5],
                    filter: ['blur(0px)', 'blur(4px)', 'blur(4px)', 'blur(4px)', 'blur(2px)', 'blur(0px)'],
                  }
                : result !== null
                ? {
                    rotateY: finalRotation,
                    y: [0, -16, 0, -8, 0, -4, 0],
                  }
                : { rotateY: 0, filter: 'blur(0px)' }
            }
            transition={
              isFlipping
                ? { duration: 1.8, ease: [0.2, 0.8, 0.4, 1] }
                : result !== null
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 0.3 }
            }
          >
            {/* HEADS face */}
            <div className="coin-face" style={{ position: 'relative', width: 280, height: 280 }}>
              <CoinFaceHeads />
            </div>

            {/* TAILS face */}
            <div
              className="coin-face coin-tails"
              style={{ position: 'absolute', top: 0, left: 0, width: 280, height: 280 }}
            >
              <CoinFaceTails />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Swipe hint arrow */}
      {!disabled && !isFlipping && result === null && (
        <motion.div
          className="absolute -top-16 flex flex-col items-center gap-1 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="opacity-60">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <span className="text-xs font-semibold opacity-50" style={{ color: '#ffd700', letterSpacing: '0.1em' }}>
            SWIPE UP
          </span>
        </motion.div>
      )}
    </div>
  )
}

function CoinFaceHeads() {
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="headsGrad" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff8b0" />
          <stop offset="35%" stopColor="#ffd700" />
          <stop offset="70%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#7a5800" />
        </radialGradient>
        <radialGradient id="headsInnerGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff4a0" />
          <stop offset="50%" stopColor="#f0c000" />
          <stop offset="100%" stopColor="#a07000" />
        </radialGradient>
        <filter id="coinShadow">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#00000080" />
        </filter>
        <filter id="innerGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer coin shadow */}
      <circle cx="140" cy="144" r="132" fill="rgba(0,0,0,0.4)" />

      {/* Main coin body */}
      <circle cx="140" cy="140" r="132" fill="url(#headsGrad)" filter="url(#coinShadow)" />

      {/* Edge detail ring */}
      <circle cx="140" cy="140" r="130" fill="none" stroke="#7a5800" strokeWidth="3" opacity="0.6" />
      <circle cx="140" cy="140" r="124" fill="none" stroke="#fff0a0" strokeWidth="1.5" opacity="0.3" />

      {/* Inner raised platform */}
      <circle cx="140" cy="140" r="110" fill="url(#headsInnerGrad)" />
      <circle cx="140" cy="140" r="108" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {/* Reeded edge ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i / 60) * Math.PI * 2
        const r1 = 120, r2 = 130
        const x1 = parseFloat((140 + r1 * Math.cos(angle)).toFixed(4))
        const y1 = parseFloat((140 + r1 * Math.sin(angle)).toFixed(4))
        const x2 = parseFloat((140 + r2 * Math.cos(angle)).toFixed(4))
        const y2 = parseFloat((140 + r2 * Math.sin(angle)).toFixed(4))
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(120,80,0,0.5)" strokeWidth="1.5" />
        )
      })}

      {/* Crown / H letter */}
      <text x="140" y="165" textAnchor="middle" fontSize="90" fontWeight="900"
        fill="rgba(80,50,0,0.7)" fontFamily="serif" letterSpacing="-2">
        H
      </text>
      <text x="140" y="162" textAnchor="middle" fontSize="90" fontWeight="900"
        fill="rgba(255,240,150,0.9)" fontFamily="serif" letterSpacing="-2">
        H
      </text>

      {/* Stars */}
      {[[-50, -40], [50, -40], [0, -60]].map(([dx, dy], i) => (
        <text key={i} x={140 + dx} y={140 + dy} textAnchor="middle" fontSize="18"
          fill="rgba(255,240,100,0.8)">★</text>
      ))}

      {/* HEADS label */}
      <text x="140" y="200" textAnchor="middle" fontSize="14" fontWeight="700"
        fill="rgba(80,50,0,0.8)" fontFamily="sans-serif" letterSpacing="4">
        HEADS
      </text>

      {/* Shine highlight */}
      <ellipse cx="105" cy="96" rx="40" ry="24" fill="rgba(255,255,255,0.18)" transform="rotate(-30 105 96)" />
    </svg>
  )
}

function CoinFaceTails() {
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tailsGrad" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e8e8f0" />
          <stop offset="35%" stopColor="#c0c0d0" />
          <stop offset="70%" stopColor="#808090" />
          <stop offset="100%" stopColor="#404050" />
        </radialGradient>
        <radialGradient id="tailsInnerGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f0f0ff" />
          <stop offset="50%" stopColor="#a0a0b8" />
          <stop offset="100%" stopColor="#606070" />
        </radialGradient>
        <filter id="coinShadow2">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#00000080" />
        </filter>
      </defs>

      {/* Outer coin shadow */}
      <circle cx="140" cy="144" r="132" fill="rgba(0,0,0,0.4)" />

      {/* Main coin body */}
      <circle cx="140" cy="140" r="132" fill="url(#tailsGrad)" filter="url(#coinShadow2)" />

      {/* Edge */}
      <circle cx="140" cy="140" r="130" fill="none" stroke="#404050" strokeWidth="3" opacity="0.6" />
      <circle cx="140" cy="140" r="124" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

      {/* Inner platform */}
      <circle cx="140" cy="140" r="110" fill="url(#tailsInnerGrad)" />
      <circle cx="140" cy="140" r="108" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

      {/* Reeded edge ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i / 60) * Math.PI * 2
        const r1 = 120, r2 = 130
        const x1 = parseFloat((140 + r1 * Math.cos(angle)).toFixed(4))
        const y1 = parseFloat((140 + r1 * Math.sin(angle)).toFixed(4))
        const x2 = parseFloat((140 + r2 * Math.cos(angle)).toFixed(4))
        const y2 = parseFloat((140 + r2 * Math.sin(angle)).toFixed(4))
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(60,60,80,0.5)" strokeWidth="1.5" />
        )
      })}

      {/* T letter */}
      <text x="140" y="165" textAnchor="middle" fontSize="90" fontWeight="900"
        fill="rgba(30,30,50,0.7)" fontFamily="serif" letterSpacing="-2">
        T
      </text>
      <text x="140" y="162" textAnchor="middle" fontSize="90" fontWeight="900"
        fill="rgba(220,220,255,0.9)" fontFamily="serif" letterSpacing="-2">
        T
      </text>

      {/* Dots */}
      {[[-50, -40], [50, -40], [0, -60]].map(([dx, dy], i) => (
        <circle key={i} cx={140 + dx} cy={140 + dy} r="5" fill="rgba(200,200,255,0.7)" />
      ))}

      {/* TAILS label */}
      <text x="140" y="200" textAnchor="middle" fontSize="14" fontWeight="700"
        fill="rgba(30,30,50,0.8)" fontFamily="sans-serif" letterSpacing="4">
        TAILS
      </text>

      {/* Shine highlight */}
      <ellipse cx="105" cy="96" rx="40" ry="24" fill="rgba(255,255,255,0.12)" transform="rotate(-30 105 96)" />
    </svg>
  )
}
