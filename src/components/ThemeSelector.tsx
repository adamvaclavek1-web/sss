'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'

export type Theme = 'gold' | 'cyber' | 'synth'

interface ThemeSelectorProps {
  current: Theme
  owned: Theme[]
  onSelect: (t: Theme) => void
  userId: string | null
}

const THEMES: { id: Theme; label: string; price: number | null; colors: [string, string]; desc: string }[] = [
  { id: 'gold',  label: 'Midnight Gold',  price: null, colors: ['#ffc53d', '#ff8c00'], desc: 'Free' },
  { id: 'cyber', label: 'Cyber Grid',     price: 10,   colors: ['#38e8ff', '#ff45c8'], desc: '$10' },
  { id: 'synth', label: 'Synthwave',      price: 20,   colors: ['#ff5fa2', '#b56bff'], desc: '$20' },
]

export default function ThemeSelector({ current, owned, onSelect, userId }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [buying, setBuying] = useState<Theme | null>(null)

  const handlePurchase = async (themeId: Theme, price: number) => {
    if (!userId) return
    setBuying(themeId)
    try {
      const res = await fetch('/api/themes/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, themeId, price }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    } finally {
      setBuying(null)
    }
  }

  const currentTheme = THEMES.find(t => t.id === current)!

  return (
    <div className="relative">
      {/* Trigger: colored dot */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Change theme"
        className="theme-swatch theme-swatch-active flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors[0]}, ${currentTheme.colors[1]})`,
          borderColor: 'rgba(255,255,255,0.5)',
        }}
      >
        <span style={{ fontSize: 10 }}>🎨</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 game-card p-3"
              style={{ width: 220, border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                SELECT THEME
              </p>
              <div className="flex flex-col gap-2">
                {THEMES.map(theme => {
                  const isOwned = theme.price === null || owned.includes(theme.id)
                  const isActive = current === theme.id
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        if (isOwned) {
                          onSelect(theme.id)
                          setOpen(false)
                        } else if (userId) {
                          handlePurchase(theme.id, theme.price!)
                        }
                      }}
                      disabled={buying === theme.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl transition-all text-left"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                        border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                        cursor: 'pointer',
                        opacity: buying === theme.id ? 0.6 : 1,
                      }}
                    >
                      {/* Swatch */}
                      <div
                        className="theme-swatch flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
                          borderColor: isActive ? 'white' : 'transparent',
                          width: 24, height: 24,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{ color: isActive ? 'white' : 'var(--text)' }}>
                          {theme.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {isOwned ? (isActive ? '✓ Active' : 'Owned') : `Unlock for ${theme.desc}`}
                        </div>
                      </div>
                      {!isOwned && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`, color: '#08070b' }}
                        >
                          {buying === theme.id ? '...' : theme.desc}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {!userId && (
                <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
                  Sign in to unlock themes
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
