export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  current_streak: number
  best_streak: number
  total_flips: number
  total_wins: number
  reroll_count: number
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  username: string
  avatar_url: string | null
  streak: number
  rank: number
  snapshot_time: string
}

export interface LeaderboardMeta {
  id: number
  last_refresh: string
  next_refresh: string
}

export interface FlipResult {
  choice: 'heads' | 'tails'
  result: 'heads' | 'tails'
  won: boolean
  newStreak: number
  rerollCost?: number
  rerollCount?: number
}

export type CoinSide = 'heads' | 'tails'
export type GameState = 'idle' | 'choosing' | 'flipping' | 'result' | 'reroll-offer'
