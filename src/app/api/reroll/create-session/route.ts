import { NextRequest, NextResponse } from 'next/server'
import { stripe, getRerollPriceInCents } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, rerollCount, currentStreak } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Verify user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const priceInCents = getRerollPriceInCents(rerollCount)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // TEST MODE: skip Stripe when no real key is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('your_')) {
      const restoredStreak = parseInt(currentStreak)
      await supabase
        .from('profiles')
        .update({
          current_streak: restoredStreak,
          reroll_count: parseInt(rerollCount) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
      return NextResponse.json({ url: `${appUrl}/?reroll_success=true&session_id=test` })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Re-Roll #${rerollCount + 1} — Save Your Streak`,
              description: `Protect your ${currentStreak}-flip streak. This re-roll costs $${Math.pow(2, rerollCount)}.`,
              images: [],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/?reroll_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?reroll_cancelled=true`,
      metadata: {
        userId,
        rerollCount: String(rerollCount),
        currentStreak: String(currentStreak),
      },
    })

    await supabase.from('reroll_purchases').insert({
      user_id: userId,
      stripe_session_id: session.id,
      amount: priceInCents / 100,
      status: 'pending',
      streak_saved_at: currentStreak,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Reroll session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
