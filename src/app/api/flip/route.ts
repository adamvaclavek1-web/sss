import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { choice, userId } = await request.json()

    if (!choice || !['heads', 'tails'].includes(choice)) {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Server-side coin flip — cannot be manipulated by client
    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails'
    const won = choice === result

    const supabase = await createAdminClient()

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak, best_streak, total_flips, total_wins, reroll_count')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const streakBefore = profile.current_streak
    const newStreak = won ? streakBefore + 1 : 0
    const newBestStreak = Math.max(profile.best_streak, newStreak)

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        current_streak: newStreak,
        best_streak: newBestStreak,
        total_flips: profile.total_flips + 1,
        total_wins: won ? profile.total_wins + 1 : profile.total_wins,
        reroll_count: won ? 0 : profile.reroll_count, // reset reroll count on win
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
    }

    // Log flip history
    await supabase.from('flip_history').insert({
      user_id: userId,
      choice,
      result,
      won,
      streak_before: streakBefore,
      streak_after: newStreak,
    })

    // Calculate reroll cost based on current reroll_count
    const rerollCount = won ? 0 : profile.reroll_count
    const rerollCost = Math.pow(2, rerollCount)

    return NextResponse.json({
      result,
      won,
      newStreak,
      bestStreak: newBestStreak,
      rerollCost: won ? undefined : rerollCost,
      rerollCount: won ? 0 : rerollCount,
    })
  } catch (error) {
    console.error('Flip API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
