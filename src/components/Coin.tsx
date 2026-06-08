'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface CoinProps {
  onSwipeUp: () => void
  isFlipping: boolean
  result: 'heads' | 'tails' | null
  disabled: boolean
}

const D = 230
const R = 115
const T = 18
const K = 46
const SEG_W = (2 * Math.PI * R) / K

export default function Coin({ onSwipeUp, isFlipping, result, disabled }: CoinProps) {
  const coinRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const pointerStartY = useRef<number | null>(null)
  const flipAnim = useRef<Animation | null>(null)

  // Coin flip animation
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

  // Land on correct face after flip
  useEffect(() => {
    if (!coinRef.current || result === null || isFlipping) return
    // -1800 mod 360 = 0 → heads face up
    // -1980 mod 360 = 180 → tails face up (tails face baked with rotateX(180deg))
    const target = result === 'tails' ? -1980 : -1800
    flipAnim.current?.cancel()
    flipAnim.current = coinRef.current.animate(
      [
        { transform: 'rotateX(-1800deg)' },
        { transform: `rotateX(${target + 12}deg)` },
        { transform: `rotateX(${target}deg)` },
      ],
      { duration: 400, easing: 'ease-out', fill: 'forwards' }
    )
  }, [result, isFlipping])

  // Reset coin when going back to choosing
  useEffect(() => {
    if (!coinRef.current || isFlipping || result !== null) return
    flipAnim.current?.cancel()
    coinRef.current.style.transform = 'rotateX(0deg)'
    coinRef.current.style.filter = ''
  }, [isFlipping, result])

  // Pointer / swipe handling
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return
    pointerStartY.current = e.clientY
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [disabled])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerStartY.current === null || disabled || !sceneRef.current) return
    const dy = e.clientY - pointerStartY.current
    if (dy < 0) {
      sceneRef.current.style.transform = `translateY(${dy * 0.35}px)`
    }
  }, [disabled])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerStartY.current === null) return
    const dy = e.clientY - pointerStartY.current
    if (sceneRef.current) sceneRef.current.style.transform = ''
    if (!disabled && dy < -55) onSwipeUp()
    pointerStartY.current = null
  }, [disabled, onSwipeUp])

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: D, height: D + 60 }}>
      {/* Ambient glow ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: D + 80,
          height: D + 80,
          top: 30,
          left: -40,
          background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.12) 0%, transparent 65%)',
        }}
        animate={
          isFlipping
            ? { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }
            : result !== null
            ? { scale: 1.1, opacity: 0.9 }
            : { scale: 1, opacity: 0.5 }
        }
        transition={{ duration: 0.7, repeat: isFlipping ? Infinity : 0 }}
      />

      {/* Swipe hint */}
      {!disabled && !isFlipping && result === null && (
        <motion.div
          className="absolute flex flex-col items-center gap-1 pointer-events-none"
          style={{ top: -4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <span style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.55 }}>
            SWIPE UP
          </span>
        </motion.div>
      )}

      {/* Scene wrapper — handles lift on swipe */}
      <div
        ref={sceneRef}
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          width: D,
          height: D,
          transition: 'transform 0.08s linear',
        }}
      >
        {/* Perspective scene */}
        <div className="coin-scene" style={{ width: D, height: D }}>
          {/* Coin body */}
          <div
            ref={coinRef}
            className="coin-body"
            style={{
              width: D,
              height: D,
              position: 'relative',
              cursor: disabled || isFlipping ? 'default' : 'grab',
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* HEADS face */}
            <div className="coin-face coin-face-heads" style={{ position: 'absolute', inset: 0 }}>
              <CoinFaceHeads />
            </div>

            {/* TAILS face */}
            <div className="coin-face" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: `rotateX(180deg) translateZ(${T / 2}px)`, borderRadius: '50%', overflow: 'hidden' }}>
              <CoinFaceTails />
            </div>

            {/* Edge segments */}
            {Array.from({ length: K }).map((_, i) => {
              const phi = (i / K) * 360
              const brightness = 35 + (i % 3) * 8
              return (
                <div
                  key={i}
                  className="coin-edge-seg"
                  style={{
                    width: SEG_W + 0.5,
                    height: T,
                    marginLeft: -(SEG_W + 0.5) / 2,
                    marginTop: -T / 2,
                    transform: `rotateZ(${phi - 90}deg) translateY(${R}px) rotateX(90deg)`,
                    background: `linear-gradient(180deg, hsl(38,${70 + (i%2)*10}%,${brightness + 8}%) 0%, hsl(35,65%,${brightness}%) 100%)`,
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Shadow beneath coin */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 180,
          height: 20,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
        animate={isFlipping ? { scaleX: [1, 0.6, 1], opacity: [0.6, 0.2, 0.6] } : { scaleX: 1, opacity: 0.6 }}
        transition={{ duration: 0.6, repeat: isFlipping ? Infinity : 0 }}
      />
    </div>
  )
}

/* ===================== COIN FACES ===================== */

function CoinFaceHeads() {
  return (
    <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hg" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#fff9c4" />
          <stop offset="30%"  stopColor="#ffd23f" />
          <stop offset="65%"  stopColor="#c47b00" />
          <stop offset="100%" stopColor="#7a4a00" />
        </radialGradient>
        <radialGradient id="hig" cx="42%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#fff4a0" />
          <stop offset="50%"  stopColor="#e8b400" />
          <stop offset="100%" stopColor="#9a6000" />
        </radialGradient>
        <filter id="hs">
          <feDropShadow dx="0" dy="5" stdDeviation="10" floodColor="#00000070" />
        </filter>
        <filter id="hg2">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Shadow */}
      <circle cx="115" cy="119" r="112" fill="rgba(0,0,0,0.35)" />
      {/* Body */}
      <circle cx="115" cy="115" r="112" fill="url(#hg)" filter="url(#hs)" />
      {/* Rim */}
      <circle cx="115" cy="115" r="110" fill="none" stroke="#7a4a00" strokeWidth="2.5" opacity="0.55" />
      <circle cx="115" cy="115" r="104" fill="none" stroke="rgba(255,245,150,0.25)" strokeWidth="1.5" />
      {/* Inner disc */}
      <circle cx="115" cy="115" r="92" fill="url(#hig)" />
      <circle cx="115" cy="115" r="90" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* Reeded edge ticks */}
      {Array.from({ length: 56 }).map((_, i) => {
        const a = (i / 56) * Math.PI * 2
        const x1 = parseFloat((115 + 98 * Math.cos(a)).toFixed(3))
        const y1 = parseFloat((115 + 98 * Math.sin(a)).toFixed(3))
        const x2 = parseFloat((115 + 108 * Math.cos(a)).toFixed(3))
        const y2 = parseFloat((115 + 108 * Math.sin(a)).toFixed(3))
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,70,0,0.45)" strokeWidth="1.5" />
      })}
      {/* Crown */}
      <path
        d="M115 52 L96 74 L78 60 L83 88 L147 88 L152 60 L134 74 Z"
        fill="rgba(255,210,50,0.85)"
        stroke="rgba(120,75,0,0.6)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Crown jewels */}
      <circle cx="115" cy="54" r="4.5" fill="#ff5c5c" />
      <circle cx="96" cy="74" r="3.5" fill="#5cc4ff" />
      <circle cx="134" cy="74" r="3.5" fill="#5cc4ff" />
      {/* H letter — shadow */}
      <text x="115" y="152" textAnchor="middle" fontSize="72" fontWeight="900"
        fill="rgba(70,42,0,0.65)" fontFamily="Georgia, serif">H</text>
      {/* H letter — main */}
      <text x="115" y="149" textAnchor="middle" fontSize="72" fontWeight="900"
        fill="rgba(255,240,130,0.92)" fontFamily="Georgia, serif" filter="url(#hg2)">H</text>
      {/* HEADS label */}
      <text x="115" y="175" textAnchor="middle" fontSize="12" fontWeight="700"
        fill="rgba(70,42,0,0.7)" fontFamily="'Space Grotesk', sans-serif" letterSpacing="4">HEADS</text>
      {/* Shine */}
      <ellipse cx="88" cy="80" rx="34" ry="20" fill="rgba(255,255,255,0.16)" transform="rotate(-28 88 80)" />
    </svg>
  )
}

function CoinFaceTails() {
  return (
    <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tg" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#f0f0fa" />
          <stop offset="30%"  stopColor="#c4c4d8" />
          <stop offset="65%"  stopColor="#787890" />
          <stop offset="100%" stopColor="#383848" />
        </radialGradient>
        <radialGradient id="tig" cx="42%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#ebebff" />
          <stop offset="50%"  stopColor="#9898b8" />
          <stop offset="100%" stopColor="#585870" />
        </radialGradient>
        <filter id="ts">
          <feDropShadow dx="0" dy="5" stdDeviation="10" floodColor="#00000070" />
        </filter>
      </defs>
      {/* Shadow */}
      <circle cx="115" cy="119" r="112" fill="rgba(0,0,0,0.35)" />
      {/* Body */}
      <circle cx="115" cy="115" r="112" fill="url(#tg)" filter="url(#ts)" />
      {/* Rim */}
      <circle cx="115" cy="115" r="110" fill="none" stroke="#383848" strokeWidth="2.5" opacity="0.55" />
      <circle cx="115" cy="115" r="104" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      {/* Inner disc */}
      <circle cx="115" cy="115" r="92" fill="url(#tig)" />
      <circle cx="115" cy="115" r="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Reeded edge ticks */}
      {Array.from({ length: 56 }).map((_, i) => {
        const a = (i / 56) * Math.PI * 2
        const x1 = parseFloat((115 + 98 * Math.cos(a)).toFixed(3))
        const y1 = parseFloat((115 + 98 * Math.sin(a)).toFixed(3))
        const x2 = parseFloat((115 + 108 * Math.cos(a)).toFixed(3))
        const y2 = parseFloat((115 + 108 * Math.sin(a)).toFixed(3))
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(40,40,60,0.45)" strokeWidth="1.5" />
      })}
      {/* Eagle / star emblem */}
      <polygon
        points="115,55 120,70 136,70 123,80 128,95 115,85 102,95 107,80 94,70 110,70"
        fill="rgba(200,200,240,0.8)"
        stroke="rgba(30,30,50,0.5)"
        strokeWidth="1"
      />
      {/* T letter — shadow */}
      <text x="115" y="152" textAnchor="middle" fontSize="72" fontWeight="900"
        fill="rgba(20,20,40,0.65)" fontFamily="Georgia, serif">T</text>
      {/* T letter — main */}
      <text x="115" y="149" textAnchor="middle" fontSize="72" fontWeight="900"
        fill="rgba(220,220,255,0.92)" fontFamily="Georgia, serif">T</text>
      {/* TAILS label */}
      <text x="115" y="175" textAnchor="middle" fontSize="12" fontWeight="700"
        fill="rgba(20,20,40,0.7)" fontFamily="'Space Grotesk', sans-serif" letterSpacing="4">TAILS</text>
      {/* Shine */}
      <ellipse cx="88" cy="80" rx="34" ry="20" fill="rgba(255,255,255,0.10)" transform="rotate(-28 88 80)" />
    </svg>
  )
}
