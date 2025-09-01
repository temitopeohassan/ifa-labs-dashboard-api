import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const STRIPE_PRICES = {
  FREE: process.env.STRIPE_PRICE_FREE || 'price_free',
  DEVELOPER: process.env.STRIPE_PRICE_DEVELOPER || 'price_developer',
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
};

export default stripe;
