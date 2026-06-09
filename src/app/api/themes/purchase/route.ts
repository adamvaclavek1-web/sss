import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const THEME_PRICES: Record<string, number> = {
  cyber: 1000,   // $10.00 in cents
  synth: 2000,   // $20.00 in cents
}

export async function POST(request: NextRequest) {
  const { userId, themeId } = await request.json()

  if (!userId || !themeId || !THEME_PRICES[themeId]) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: THEME_PRICES[themeId],
          product_data: {
            name: `CoinFlip — ${themeId === 'cyber' ? 'Cyber Grid' : 'Synthwave'} Theme`,
            description: 'Permanent theme unlock for your account',
          },
        },
        quantity: 1,
      },
    ],
    metadata: { userId, themeId, type: 'theme_purchase' },
    success_url: `${appUrl}?theme_success=true&theme=${themeId}`,
    cancel_url: `${appUrl}?theme_cancelled=true`,
  })

  return NextResponse.json({ url: session.url })
}
