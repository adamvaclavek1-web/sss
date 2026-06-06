import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export function getRerollPrice(rerollCount: number): number {
  // Exponential scaling: $1, $2, $4, $8, $16...
  return Math.pow(2, rerollCount)
}

export function getRerollPriceInCents(rerollCount: number): number {
  return getRerollPrice(rerollCount) * 100
}
