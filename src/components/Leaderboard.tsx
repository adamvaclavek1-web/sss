'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Trophy, Clock, RefreshCw } from 'lucide-react'
import { LeaderboardEntry, LeaderboardMeta } from '@/types'

function formatTimeLeft(nextRefresh: string): string {
  const now = new Date()
  const next = new Date(nextRefresh)
  const diffMs = next.getTime() - now.getTime()

  if (diffMs <= 0) return 'Refreshing...'

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export default function Leaderboard({ currentUserId }: { currentUserId?: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [meta, setMeta] = useState<LeaderboardMeta | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard')
      const data = await res.json()
      setEntries(data.entries || [])
      setMeta(data.meta || null)
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Countdown timer
  useEffect(() => {
    if (!meta?.next_refresh) return
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(meta.next_refresh))
    }, 1000)
    setTimeLeft(formatTimeLeft(meta.next_refresh))
    return () => clearInterval(interval)
  }, [meta?.next_refresh])

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ffd700'
    if (rank === 2) return '#c0c0c0'
    if (rank === 3) return '#cd7f32'
    return '#6b7280'
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'rgba(255,215,0,0.08)'
    if (rank === 2) return 'rgba(192,192,192,0.05)'
    if (rank === 3) return 'rgba(205,127,50,0.05)'
    return 'transparent'
  }

  return (
    <div className="game-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} style={{ color: '#ffd700' }} />
            <h2 className="font-bold text-white">Leaderboard</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} />
            <span>Refresh in <span className="text-gray-300 font-mono">{timeLeft || '...'}</span></span>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-800/50">
        {loading ? (
          <div className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </motion.div>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-gray-600 text-sm">
            No entries yet. Be the first!
          </div>
        ) : (
          <AnimatePresence>
            {entries.slice(0, 10).map((entry, index) => {
              const isCurrentUser = entry.user_id === currentUserId
              const isKing = entry.rank === 1

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isCurrentUser ? 'bg-yellow-900/10' : ''
                  }`}
                  style={{ background: isCurrentUser ? 'rgba(255,215,0,0.06)' : getRankBg(entry.rank) }}
                >
                  {/* Rank */}
                  <div
                    className="w-7 text-center font-black text-sm tabular-nums"
                    style={{ color: getRankColor(entry.rank) }}
                  >
                    {entry.rank}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: `hsl(${(entry.user_id.charCodeAt(0) * 37) % 360}, 60%, 25%)`,
                        border: isKing ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span style={{ color: `hsl(${(entry.user_id.charCodeAt(0) * 37) % 360}, 80%, 70%)` }}>
                          {(entry.username || '?')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* King crown */}
                    {isKing && (
                      <motion.div
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                        animate={{ y: [0, -2, 0], rotate: [-5, 5, -5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Crown size={14} fill="#ffd700" stroke="#b8860b" strokeWidth={1.5} />
                      </motion.div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold text-sm truncate ${
                          isCurrentUser ? 'text-yellow-300' : 'text-white'
                        }`}
                      >
                        {entry.username || 'Anonymous'}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-yellow-600 font-medium">(you)</span>
                      )}
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="text-right">
                    <span
                      className={`font-black text-lg tabular-nums ${isKing ? 'neon-gold' : ''}`}
                      style={{ color: isKing ? undefined : getRankColor(entry.rank) }}
                    >
                      {entry.streak}
                    </span>
                    <div className="text-xs text-gray-600">streak</div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
