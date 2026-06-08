'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface CoinProps {
  onFlip: () => void
  isFlipping: boolean
  result: 'heads' | 'tails' | null
  disabled: boolean
}

const D = 230
const R = 115
const T = 18
const K = 46
const SEG_W = (2 * Math.PI * R) / K

// Reeded edge line coordinates (pre-computed at 90 angles)
function reedsFor(r1: number, r2: number, n: number, cx = 115, cy = 115) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return {
      x1: +(cx + r1 * Math.cos(a)).toFixed(1),
      y1: +(cy + r1 * Math.sin(a)).toFixed(1),
      x2: +(cx + r2 * Math.cos(a)).toFixed(1),
      y2: +(cy + r2 * Math.sin(a)).toFixed(1),
    }
  })
}

export default function Coin({ onFlip, isFlipping, result, disabled }: CoinProps) {
  const coinRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const pointerStartY = useRef<number | null>(null)
  const flipAnim = useRef<Animation | null>(null)

  useEffect(() => {
    if (!coinRef.current) return
    if (isFlipping) {
      flipAnim.current?.cancel()
      flipAnim.current = coinRef.current.animate(
        [
          { transform: 'rotateX(0deg)',     filter: 'blur(0px)' },
          { transform: 'rotateX(-360deg)',  filter: 'blur(3px)', offset: 0.18 },
          { transform: 'rotateX(-900deg)',  filter: 'blur(5px)', offset: 0.45 },
          { transform: 'rotateX(-1440deg)', filter: 'blur(5px)', offset: 0.72 },
          { transform: 'rotateX(-1800deg)', filter: 'blur(0px)' },
        ],
        { duration: 1800, easing: 'cubic-bezier(0.2,0.8,0.4,1)', fill: 'forwards' }
      )
    }
  }, [isFlipping])

  useEffect(() => {
    if (!coinRef.current || result === null || isFlipping) return
    const target = result === 'tails' ? -1980 : -1800
    flipAnim.current?.cancel()
    flipAnim.current = coinRef.current.animate(
      [
        { transform: 'rotateX(-1800deg)' },
        { transform: `rotateX(${target + 14}deg)` },
        { transform: `rotateX(${target}deg)` },
      ],
      { duration: 420, easing: 'ease-out', fill: 'forwards' }
    )
  }, [result, isFlipping])

  useEffect(() => {
    if (!coinRef.current || isFlipping || result !== null) return
    flipAnim.current?.cancel()
    coinRef.current.style.transform = ''
    coinRef.current.style.filter = ''
  }, [isFlipping, result])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return
    pointerStartY.current = e.clientY
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [disabled])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerStartY.current === null || disabled || !sceneRef.current) return
    const dy = e.clientY - pointerStartY.current
    if (dy < 0) sceneRef.current.style.transform = `translateY(${dy * 0.35}px)`
  }, [disabled])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerStartY.current === null) return
    const dy = e.clientY - pointerStartY.current
    if (sceneRef.current) sceneRef.current.style.transform = ''
    if (!disabled && dy < -55) onFlip()
    pointerStartY.current = null
  }, [disabled, onFlip])

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: D, height: D + 60 }}>
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: D + 100, height: D + 100,
          top: 20, left: -50,
          background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.14) 0%, transparent 62%)',
        }}
        animate={
          isFlipping ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }
          : result !== null ? { scale: 1.12, opacity: 0.95 }
          : { scale: 1, opacity: 0.55 }
        }
        transition={{ duration: 0.65, repeat: isFlipping ? Infinity : 0 }}
      />

      {/* Click hint */}
      {!disabled && !isFlipping && result === null && (
        <motion.div
          className="absolute flex flex-col items-center gap-1 pointer-events-none"
          style={{ top: -2 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <span style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', opacity: 0.5 }}>CLICK TO FLIP</span>
        </motion.div>
      )}

      {/* Scene */}
      <div ref={sceneRef} style={{ position: 'absolute', top: 30, left: 0, width: D, height: D, transition: 'transform 0.08s linear' }}>
        <div style={{ width: D, height: D, perspective: 1100 }}>
          <div
            ref={coinRef}
            style={{
              width: D, height: D,
              position: 'relative',
              transformStyle: 'preserve-3d',
              transformOrigin: `${R}px ${R}px`,
              cursor: disabled || isFlipping ? 'default' : 'grab',
              touchAction: 'none',
            }}
            onClick={() => { if (!disabled && !isFlipping) onFlip() }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* HEADS face */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: `translateZ(${T / 2}px)`,
            }}>
              <CoinFaceHeads />
            </div>

            {/* TAILS face */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: `rotateX(180deg) translateZ(${T / 2}px)`,
            }}>
              <CoinFaceTails />
            </div>

            {/* Cylindrical edge */}
            <div style={{ position: 'absolute', top: R, left: R, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
              {Array.from({ length: K }).map((_, i) => {
                const phi = (i / K) * 360
                const light = 38 + (i % 2) * 10
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    width: SEG_W + 0.6,
                    height: T,
                    marginLeft: -(SEG_W + 0.6) / 2,
                    marginTop: -T / 2,
                    transform: `rotateZ(${phi - 90}deg) translateY(${R}px) rotateX(90deg)`,
                    background: `linear-gradient(180deg, hsl(38,${72 + (i%2)*8}%,${light + 10}%) 0%, hsl(36,65%,${light}%) 100%)`,
                    backfaceVisibility: 'hidden',
                  }} />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Ground shadow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 180, height: 18,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
        animate={isFlipping ? { scaleX: [1, 0.55, 1], opacity: [0.65, 0.18, 0.65] } : { scaleX: 1, opacity: 0.65 }}
        transition={{ duration: 0.65, repeat: isFlipping ? Infinity : 0 }}
      />
    </div>
  )
}

/* ─── HEADS face — Midnight Gold ─── */

const H_REEDS = reedsFor(104.5, 112.5, 90)

function CoinFaceHeads() {
  return (
    <svg width={D} height={D} viewBox="0 0 230 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="h-body" cx="40%" cy="32%" r="78%">
          <stop offset="0%"   stopColor="#fff8d8"/>
          <stop offset="22%"  stopColor="#ffe384"/>
          <stop offset="46%"  stopColor="#f6c23e"/>
          <stop offset="68%"  stopColor="#d99a26"/>
          <stop offset="86%"  stopColor="#a9741a"/>
          <stop offset="100%" stopColor="#7e560f"/>
        </radialGradient>
        <linearGradient id="h-rim" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%"   stopColor="#fff3bc"/>
          <stop offset="40%"  stopColor="#f2c447"/>
          <stop offset="72%"  stopColor="#b07e1d"/>
          <stop offset="100%" stopColor="#765111"/>
        </linearGradient>
        <radialGradient id="h-field" cx="42%" cy="38%" r="66%">
          <stop offset="0%"   stopColor="#ffe88c"/>
          <stop offset="52%"  stopColor="#eebb38"/>
          <stop offset="100%" stopColor="#bb8520"/>
        </radialGradient>
        <linearGradient id="h-motif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stopColor="#fff6cf"/>
          <stop offset="55%"  stopColor="#ecb83e"/>
          <stop offset="1"    stopColor="#a8761b"/>
        </linearGradient>
        <clipPath id="h-clip">
          <circle cx="115" cy="115" r="114"/>
        </clipPath>
      </defs>

      {/* Body */}
      <circle cx="115" cy="115" r="114" fill="url(#h-body)"/>
      {/* Rim stroke */}
      <circle cx="115" cy="115" r="109" fill="none" stroke="url(#h-rim)" strokeWidth="10"/>
      {/* Reeded edge ticks */}
      {H_REEDS.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(110,76,10,0.5)" strokeWidth="1.3"/>
      ))}
      {/* Inner ring */}
      <circle cx="115" cy="115" r="104" fill="none" stroke="rgba(255,242,184,0.55)" strokeWidth="1.3"/>
      {/* Inner field */}
      <circle cx="115" cy="115" r="103" fill="url(#h-field)"/>
      {/* Dashed inner ring */}
      <circle cx="115" cy="115" r="89" fill="none" stroke="rgba(120,82,12,0.28)" strokeWidth="1" strokeDasharray="2 4"/>

      {/* Crown motif at center-top */}
      <g transform="translate(115,101)">
        {/* Shadow */}
        <g transform="translate(0,2.6)" fill="rgba(74,48,6,0.5)">
          <path d="M-34 8 L-18 -16 L0 4 L18 -16 L34 8 L26 30 L-26 30 Z"/>
          <circle cx="-34" cy="4" r="5"/>
          <circle cx="34" cy="4" r="5"/>
          <circle cx="0" cy="-22" r="5"/>
        </g>
        {/* Crown */}
        <g fill="url(#h-motif)" stroke="rgba(110,76,10,0.45)" strokeWidth="1">
          <path d="M-34 8 L-18 -16 L0 4 L18 -16 L34 8 L26 30 L-26 30 Z"/>
          <circle cx="-34" cy="4" r="5"/>
          <circle cx="34" cy="4" r="5"/>
          <circle cx="0" cy="-22" r="5"/>
        </g>
      </g>

      {/* HEADS label */}
      <text x="115" y="160" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="5"
        fill="rgba(96,66,8,0.85)" fontFamily="'Space Grotesk', sans-serif">HEADS</text>
      <text x="115" y="159" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="5"
        fill="rgba(255,243,190,0.45)" fontFamily="'Space Grotesk', sans-serif">HEADS</text>

      {/* Shine */}
      <g clipPath="url(#h-clip)">
        <ellipse cx="75.9" cy="64.4" rx="57.5" ry="34.5" fill="rgba(255,255,255,0.26)" transform="rotate(-26 75.9 64.4)"/>
        <path d="M0 0 L230 0 L230 73.6 Z" fill="rgba(255,255,255,0.06)"/>
      </g>
    </svg>
  )
}

/* ─── TAILS face — Silver ─── */

const T_REEDS = reedsFor(104.5, 112.5, 90)

function CoinFaceTails() {
  return (
    <svg width={D} height={D} viewBox="0 0 230 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="t-body" cx="40%" cy="32%" r="78%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="24%"  stopColor="#dde3ee"/>
          <stop offset="52%"  stopColor="#a7afc0"/>
          <stop offset="78%"  stopColor="#727b8e"/>
          <stop offset="100%" stopColor="#474f60"/>
        </radialGradient>
        <linearGradient id="t-rim" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%"   stopColor="#f6f9ff"/>
          <stop offset="40%"  stopColor="#c2cad9"/>
          <stop offset="72%"  stopColor="#798496"/>
          <stop offset="100%" stopColor="#4a5365"/>
        </linearGradient>
        <radialGradient id="t-field" cx="42%" cy="38%" r="66%">
          <stop offset="0%"   stopColor="#eef2fa"/>
          <stop offset="52%"  stopColor="#aeb6c6"/>
          <stop offset="100%" stopColor="#727b8d"/>
        </radialGradient>
        <linearGradient id="t-motif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stopColor="#fafcff"/>
          <stop offset="55%"  stopColor="#b3bbcc"/>
          <stop offset="1"    stopColor="#798496"/>
        </linearGradient>
        <clipPath id="t-clip">
          <circle cx="115" cy="115" r="114"/>
        </clipPath>
      </defs>

      {/* Body */}
      <circle cx="115" cy="115" r="114" fill="url(#t-body)"/>
      {/* Rim stroke */}
      <circle cx="115" cy="115" r="109" fill="none" stroke="url(#t-rim)" strokeWidth="10"/>
      {/* Reeded edge ticks */}
      {T_REEDS.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(50,58,72,0.5)" strokeWidth="1.3"/>
      ))}
      {/* Inner ring */}
      <circle cx="115" cy="115" r="104" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.3"/>
      {/* Inner field */}
      <circle cx="115" cy="115" r="103" fill="url(#t-field)"/>
      {/* Dashed inner ring */}
      <circle cx="115" cy="115" r="89" fill="none" stroke="rgba(60,68,84,0.3)" strokeWidth="1" strokeDasharray="2 4"/>

      {/* Star motif at center-top */}
      <g transform="translate(115,103)">
        {/* Shadow */}
        <g transform="translate(0,2.4)" fill="rgba(40,46,58,0.5)">
          <path d="M0 -24 L7 -6 L26 -6 L11 6 L17 24 L0 13 L-17 24 L-11 6 L-26 -6 L-7 -6 Z"/>
        </g>
        {/* Star */}
        <g fill="url(#t-motif)" stroke="rgba(50,58,72,0.4)" strokeWidth="1">
          <path d="M0 -24 L7 -6 L26 -6 L11 6 L17 24 L0 13 L-17 24 L-11 6 L-26 -6 L-7 -6 Z"/>
        </g>
      </g>

      {/* TAILS label */}
      <text x="115" y="160" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="6"
        fill="rgba(54,62,76,0.85)" fontFamily="'Space Grotesk', sans-serif">TAILS</text>
      <text x="115" y="159" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="6"
        fill="rgba(255,255,255,0.4)" fontFamily="'Space Grotesk', sans-serif">TAILS</text>

      {/* Shine */}
      <g clipPath="url(#t-clip)">
        <ellipse cx="75.9" cy="64.4" rx="57.5" ry="34.5" fill="rgba(255,255,255,0.3)" transform="rotate(-26 75.9 64.4)"/>
        <path d="M0 0 L230 0 L230 73.6 Z" fill="rgba(255,255,255,0.07)"/>
      </g>
    </svg>
  )
}
