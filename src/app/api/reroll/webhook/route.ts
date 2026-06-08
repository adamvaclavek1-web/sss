import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, type, themeId, rerollCount, currentStreak } = session.metadata!

    const supabase = await createAdminClient()

    if (type === 'theme_purchase' && themeId) {
      // Grant the theme by appending to owned_themes array
      const { data: profile } = await supabase
        .from('profiles')
        .select('owned_themes')
        .eq('id', userId)
        .single()

      const existing: string[] = (profile as any)?.owned_themes ?? []
      if (!existing.includes(themeId)) {
        await supabase
          .from('profiles')
          .update({ owned_themes: [...existing, themeId], updated_at: new Date().toISOString() })
          .eq('id', userId)
      }
    } else {
      // Re-roll purchase
      await supabase
        .from('reroll_purchases')
        .update({ status: 'completed' })
        .eq('stripe_session_id', session.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, best_streak')
        .eq('id', userId)
        .single()

      if (profile) {
        const restoredStreak = parseInt(currentStreak)
        await supabase
          .from('profiles')
          .update({
            current_streak: restoredStreak,
            best_streak: Math.max(profile.best_streak, restoredStreak),
            reroll_count: parseInt(rerollCount) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }
    }
  }

  return NextResponse.json({ received: true })
}
