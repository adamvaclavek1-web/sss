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
  const isDragging = useRef(false)
  const flipAnim = useRef<Animation | null>(null)

  useEffect(() => {
    if (!coinRef.current) return
    if (isFlipping) {
      flipAnim.current?.cancel()
      flipAnim.current = coinRef.current.animate(
        [
          { transform: 'rotateX(0deg) scale(1)' },
          { transform: 'rotateX(-180deg) scale(1.04)', offset: 0.15 },
          { transform: 'rotateX(-900deg) scale(1.06)', offset: 0.45 },
          { transform: 'rotateX(-1440deg) scale(1.04)', offset: 0.75 },
          { transform: 'rotateX(-1800deg) scale(1)' },
        ],
        { duration: 1800, easing: 'cubic-bezier(0.25,0.8,0.35,1)', fill: 'forwards' }
      )
    }
  }, [isFlipping])

  useEffect(() => {
    if (!coinRef.current || result === null || isFlipping) return
    const target = result === 'tails' ? -1980 : -1800
    flipAnim.current?.cancel()
    flipAnim.current = coinRef.current.animate(
      [
        { transform: 'rotateX(-1800deg) scale(1.04)' },
        { transform: `rotateX(${target + 12}deg) scale(1.02)` },
        { transform: `rotateX(${target}deg) scale(1)` },
      ],
      { duration: 380, easing: 'ease-out', fill: 'forwards' }
    )
  }, [result, isFlipping])

  useEffect(() => {
    if (!coinRef.current || isFlipping || result !== null) return
    flipAnim.current?.cancel()
    coinRef.current.style.transform = ''
  }, [isFlipping, result])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return
    isDragging.current = false
    pointerStartY.current = e.clientY
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [disabled])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerStartY.current === null || disabled || !sceneRef.current) return
    const dy = e.clientY - pointerStartY.current
    if (Math.abs(dy) > 6) isDragging.current = true
    if (dy < 0) sceneRef.current.style.transform = `translateY(${dy * 0.3}px)`
  }, [disabled])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerStartY.current === null) return
    const dy = e.clientY - pointerStartY.current
    if (sceneRef.current) sceneRef.current.style.transform = ''
    if (!disabled && dy < -50) {
      isDragging.current = true
      onFlip()
    }
    pointerStartY.current = null
  }, [disabled, onFlip])

  const handleClick = useCallback(() => {
    if (disabled || isFlipping || isDragging.current) return
    onFlip()
  }, [disabled, isFlipping, onFlip])

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: D, height: D + 80 }}>
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: D + 120, height: D + 120,
          top: 10, left: -60,
          background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.12) 0%, transparent 62%)',
        }}
        animate={
          isFlipping ? { scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }
          : result !== null ? { scale: 1.15, opacity: 0.9 }
          : { scale: 1, opacity: 0.45 }
        }
        transition={{ duration: 0.7, repeat: isFlipping ? Infinity : 0 }}
      />

      {/* Click hint — above the coin */}
      {!disabled && !isFlipping && result === null && (
        <motion.div
          className="absolute flex flex-col items-center gap-1 pointer-events-none z-10"
          style={{ top: -38 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2"/>
              <path d="M12 8v8M9 11l3-3 3 3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
              CLICK TO FLIP
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2"/>
              <path d="M12 8v8M9 11l3-3 3 3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* Scene */}
      <div
        ref={sceneRef}
        style={{ position: 'absolute', top: 30, left: 0, width: D, height: D, transition: 'transform 0.06s linear' }}
      >
        <div style={{ width: D, height: D, perspective: 1000 }}>
          <div
            ref={coinRef}
            style={{
              width: D, height: D,
              position: 'relative',
              transformStyle: 'preserve-3d',
              transformOrigin: `${R}px ${R}px`,
              cursor: disabled || isFlipping ? 'default' : 'pointer',
              touchAction: 'none',
            }}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* HEADS face — gold */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: `translateZ(${T / 2}px)`,
            }}>
              <CoinFaceHeads />
            </div>

            {/* TAILS face — blue/silver */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: `rotateX(180deg) translateZ(${T / 2}px)`,
            }}>
              <CoinFaceTails />
            </div>

            {/* Cylindrical edge — dark neutral */}
            <div style={{ position: 'absolute', top: R, left: R, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
              {Array.from({ length: K }).map((_, i) => {
                const phi = (i / K) * 360
                const l = 14 + (i % 2) * 6
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    width: SEG_W + 0.6,
                    height: T,
                    marginLeft: -(SEG_W + 0.6) / 2,
                    marginTop: -T / 2,
                    transform: `rotateZ(${phi - 90}deg) translateY(${R}px) rotateX(90deg)`,
                    background: `linear-gradient(180deg, hsl(220,12%,${l + 8}%) 0%, hsl(220,10%,${l}%) 100%)`,
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
          bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 160, height: 14,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
        animate={isFlipping ? { scaleX: [1, 0.45, 1], opacity: [0.6, 0.1, 0.6] } : { scaleX: 1, opacity: 0.6 }}
        transition={{ duration: 0.7, repeat: isFlipping ? Infinity : 0 }}
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
        <clipPath id="h-clip"><circle cx="115" cy="115" r="114"/></clipPath>
      </defs>
      <circle cx="115" cy="115" r="114" fill="url(#h-body)"/>
      <circle cx="115" cy="115" r="109" fill="none" stroke="url(#h-rim)" strokeWidth="10"/>
      {H_REEDS.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(110,76,10,0.5)" strokeWidth="1.3"/>
      ))}
      <circle cx="115" cy="115" r="104" fill="none" stroke="rgba(255,242,184,0.55)" strokeWidth="1.3"/>
      <circle cx="115" cy="115" r="103" fill="url(#h-field)"/>
      <circle cx="115" cy="115" r="89" fill="none" stroke="rgba(120,82,12,0.28)" strokeWidth="1" strokeDasharray="2 4"/>
      <g transform="translate(115,101)">
        <g transform="translate(0,2.6)" fill="rgba(74,48,6,0.5)">
          <path d="M-34 8 L-18 -16 L0 4 L18 -16 L34 8 L26 30 L-26 30 Z"/>
          <circle cx="-34" cy="4" r="5"/><circle cx="34" cy="4" r="5"/><circle cx="0" cy="-22" r="5"/>
        </g>
        <g fill="url(#h-motif)" stroke="rgba(110,76,10,0.45)" strokeWidth="1">
          <path d="M-34 8 L-18 -16 L0 4 L18 -16 L34 8 L26 30 L-26 30 Z"/>
          <circle cx="-34" cy="4" r="5"/><circle cx="34" cy="4" r="5"/><circle cx="0" cy="-22" r="5"/>
        </g>
      </g>
      <text x="115" y="160" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="5"
        fill="rgba(96,66,8,0.85)" fontFamily="'Space Grotesk', sans-serif">HEADS</text>
      <text x="115" y="159" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="5"
        fill="rgba(255,243,190,0.45)" fontFamily="'Space Grotesk', sans-serif">HEADS</text>
      <g clipPath="url(#h-clip)">
        <ellipse cx="75.9" cy="64.4" rx="57.5" ry="34.5" fill="rgba(255,255,255,0.26)" transform="rotate(-26 75.9 64.4)"/>
        <path d="M0 0 L230 0 L230 73.6 Z" fill="rgba(255,255,255,0.06)"/>
      </g>
    </svg>
  )
}

/* ─── TAILS face — Deep Blue/Steel ─── */

const T_REEDS = reedsFor(104.5, 112.5, 90)

function CoinFaceTails() {
  return (
    <svg width={D} height={D} viewBox="0 0 230 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="t-body" cx="38%" cy="30%" r="78%">
          <stop offset="0%"   stopColor="#c8e8ff"/>
          <stop offset="20%"  stopColor="#7ec8f8"/>
          <stop offset="45%"  stopColor="#3490d0"/>
          <stop offset="70%"  stopColor="#1a5fa0"/>
          <stop offset="100%" stopColor="#0c2d5a"/>
        </radialGradient>
        <linearGradient id="t-rim" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%"   stopColor="#d8f0ff"/>
          <stop offset="40%"  stopColor="#5aaee0"/>
          <stop offset="72%"  stopColor="#1a5090"/>
          <stop offset="100%" stopColor="#0a1e40"/>
        </linearGradient>
        <radialGradient id="t-field" cx="42%" cy="38%" r="66%">
          <stop offset="0%"   stopColor="#a8dcff"/>
          <stop offset="52%"  stopColor="#2e80c8"/>
          <stop offset="100%" stopColor="#134a90"/>
        </radialGradient>
        <linearGradient id="t-motif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stopColor="#e8f8ff"/>
          <stop offset="55%"  stopColor="#72c0ee"/>
          <stop offset="1"    stopColor="#2060a8"/>
        </linearGradient>
        <clipPath id="t-clip"><circle cx="115" cy="115" r="114"/></clipPath>
      </defs>
      <circle cx="115" cy="115" r="114" fill="url(#t-body)"/>
      <circle cx="115" cy="115" r="109" fill="none" stroke="url(#t-rim)" strokeWidth="10"/>
      {T_REEDS.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(10,50,100,0.45)" strokeWidth="1.3"/>
      ))}
      <circle cx="115" cy="115" r="104" fill="none" stroke="rgba(180,220,255,0.5)" strokeWidth="1.3"/>
      <circle cx="115" cy="115" r="103" fill="url(#t-field)"/>
      <circle cx="115" cy="115" r="89" fill="none" stroke="rgba(20,60,120,0.3)" strokeWidth="1" strokeDasharray="2 4"/>
      <g transform="translate(115,103)">
        <g transform="translate(0,2.4)" fill="rgba(10,30,70,0.55)">
          <path d="M0 -24 L7 -6 L26 -6 L11 6 L17 24 L0 13 L-17 24 L-11 6 L-26 -6 L-7 -6 Z"/>
        </g>
        <g fill="url(#t-motif)" stroke="rgba(20,60,120,0.4)" strokeWidth="1">
          <path d="M0 -24 L7 -6 L26 -6 L11 6 L17 24 L0 13 L-17 24 L-11 6 L-26 -6 L-7 -6 Z"/>
        </g>
      </g>
      <text x="115" y="160" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="6"
        fill="rgba(10,40,90,0.9)" fontFamily="'Space Grotesk', sans-serif">TAILS</text>
      <text x="115" y="159" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="6"
        fill="rgba(200,235,255,0.5)" fontFamily="'Space Grotesk', sans-serif">TAILS</text>
      <g clipPath="url(#t-clip)">
        <ellipse cx="75.9" cy="64.4" rx="57.5" ry="34.5" fill="rgba(255,255,255,0.22)" transform="rotate(-26 75.9 64.4)"/>
        <path d="M0 0 L230 0 L230 73.6 Z" fill="rgba(255,255,255,0.05)"/>
      </g>
    </svg>
  )
}
