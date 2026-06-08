'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import Coin from './Coin'
import ChoiceButtons from './ChoiceButtons'
import ResultOverlay from './ResultOverlay'
import StreakDisplay from './StreakDisplay'
import { CoinSide, FlipResult, Profile } from '@/types'
import AuthModal from './AuthModal'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface GameAreaProps {
  profile: Profile | null
  userId: string | null
  onProfileUpdate: (profile: Profile) => void
}

type GameState = 'choosing' | 'flipping' | 'result-win' | 'result-loss' | 'rerolling'

export default function GameArea({ profile, userId, onProfileUpdate }: GameAreaProps) {
  const [gameState, setGameState] = useState<GameState>('choosing')
  const [choice, setChoice] = useState<CoinSide>('heads')
  const [flipResult, setFlipResult] = useState<FlipResult | null>(null)
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)
  const [currentStreak, setCurrentStreak] = useState(profile?.current_streak ?? 0)
  const [bestStreak, setBestStreak] = useState(profile?.best_streak ?? 0)
  const [rerollCount, setRerollCount] = useState(profile?.reroll_count ?? 0)
  const [isRerolling, setIsRerolling] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [lastResult, setLastResult] = useState<'won' | 'lost' | null>(null)

  // Sync profile updates
  useEffect(() => {
    if (profile) {
      setCurrentStreak(profile.current_streak)
      setBestStreak(profile.best_streak)
      setRerollCount(profile.reroll_count)
    }
  }, [profile])

  // Check for reroll success on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('reroll_success') === 'true') {
      // Stripe payment successful — reload profile data
      const sessionId = params.get('session_id')
      window.history.replaceState({}, '', '/')
      // Show a brief "success" message
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
    if (params.get('reroll_cancelled') === 'true') {
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const handleFlip = useCallback(async () => {
    if (!choice) return

    if (!userId) {
      setShowAuthModal(true)
      return
    }

    setGameState('flipping')
    setCoinResult(null)
    setFlipResult(null)

    try {
      const res = await fetch('/api/flip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice, userId }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      // Wait for animation to complete before showing result
      await new Promise((r) => setTimeout(r, 1900))

      setCoinResult(data.result)
      setFlipResult({
        choice,
        result: data.result,
        won: data.won,
        newStreak: data.newStreak,
        rerollCost: data.rerollCost,
        rerollCount: data.rerollCount,
      })

      setCurrentStreak(data.newStreak)
      setBestStreak(data.bestStreak)
      setLastResult(data.won ? 'won' : 'lost')

      if (data.won) {
        setRerollCount(0)
        setGameState('result-win')
      } else {
        setRerollCount(data.rerollCount || 0)
        setGameState('result-loss')
      }
    } catch (err) {
      console.error('Flip error:', err)
      setGameState('choosing')
    }
  }, [choice, userId])

  const handleContinue = () => {
    setFlipResult(null)
    setCoinResult(null)
    setChoice(null)
    setGameState('choosing')
  }

  const handleReroll = async () => {
    if (!userId || !flipResult) return

    setIsRerolling(true)
    try {
      const res = await fetch('/api/reroll/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          rerollCount,
          currentStreak: flipResult.newStreak === 0
            ? (currentStreak === 0 ? 0 : currentStreak)
            : currentStreak,
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Reroll error:', err)
    } finally {
      setIsRerolling(false)
    }
  }

  const handleAcceptLoss = () => {
    // Streak already reset server-side
    setCurrentStreak(0)
    setRerollCount(0)
    setFlipResult(null)
    setCoinResult(null)
    setChoice(null)
    setGameState('choosing')
  }

  const isFlipping = gameState === 'flipping'
  const showResult = gameState === 'result-win' || gameState === 'result-loss'
  const coinDisabled = isFlipping || showResult

  return (
    <>
      <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
        {/* Streak Display */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StreakDisplay
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            lastResult={lastResult}
          />
        </motion.div>

        {/* Coin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="relative"
        >
          {/* Win/loss glow ring */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-full -m-8"
                style={{
                  background: gameState === 'result-win'
                    ? 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(255,45,85,0.15) 0%, transparent 70%)',
                  boxShadow: gameState === 'result-win'
                    ? '0 0 60px rgba(0,255,136,0.25)'
                    : '0 0 60px rgba(255,45,85,0.25)',
                }}
              />
            )}
          </AnimatePresence>

          <Coin
            onFlip={handleFlip}
            isFlipping={isFlipping}
            result={showResult ? coinResult : null}
            disabled={coinDisabled}
          />
        </motion.div>

        {/* Choice Buttons — shown only when choosing */}
        <AnimatePresence>
          {!showResult && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <p className="text-center text-xs text-gray-500 font-semibold uppercase tracking-widest mb-3">
                Choose your side
              </p>
              <ChoiceButtons
                selected={choice}
                onSelect={setChoice}
                disabled={isFlipping}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest notice */}
        {!userId && !showResult && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-gray-600 text-center"
          >
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-yellow-600 hover:text-yellow-400 underline transition-colors"
            >
              Sign in
            </button>{' '}
            to save your streak
          </motion.p>
        )}

        {/* Result overlay */}
        <AnimatePresence>
          {showResult && flipResult && (
            <motion.div className="w-full" key="result">
              <ResultOverlay
                result={flipResult}
                onContinue={handleContinue}
                onReroll={handleReroll}
                onAcceptLoss={handleAcceptLoss}
                isRerolling={isRerolling}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flip instruction */}
        {!showResult && choice && !isFlipping && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 text-center"
          >
            Click or swipe the coin to flip
          </motion.p>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
