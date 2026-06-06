import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createAdminClient()

    const [snapshotRes, metaRes] = await Promise.all([
      supabase
        .from('leaderboard_snapshots')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50),
      supabase
        .from('leaderboard_meta')
        .select('*')
        .eq('id', 1)
        .single(),
    ])

    // Auto-refresh if past next_refresh time
    if (metaRes.data) {
      const nextRefresh = new Date(metaRes.data.next_refresh)
      if (new Date() > nextRefresh) {
        await supabase.rpc('refresh_leaderboard')
        // Re-fetch after refresh
        const { data: freshData } = await supabase
          .from('leaderboard_snapshots')
          .select('*')
          .order('rank', { ascending: true })
          .limit(50)
        const { data: freshMeta } = await supabase
          .from('leaderboard_meta')
          .select('*')
          .eq('id', 1)
          .single()

        return NextResponse.json({
          entries: freshData || [],
          meta: freshMeta,
        })
      }
    }

    return NextResponse.json({
      entries: snapshotRes.data || [],
      meta: metaRes.data,
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Manual refresh endpoint (admin only)
  try {
    const supabase = await createAdminClient()
    await supabase.rpc('refresh_leaderboard')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}
