import axios from 'axios';

if (!process.env.NOWPAYMENTS_API_KEY) {
  throw new Error('NOWPAYMENTS_API_KEY is required');
}

// NowPayments API base URL
const NOWPAYMENTS_API_BASE = 'https://api.nowpayments.io/v1';

// Create axios instance for NowPayments API
export const nowpaymentsApi = axios.create({
  baseURL: NOWPAYMENTS_API_BASE,
  headers: {
    'x-api-key': process.env.NOWPAYMENTS_API_KEY,
    'Content-Type': 'application/json',
  },
});

// NowPayments configuration
export const NOWPAYMENTS_CONFIG = {
  API_KEY: process.env.NOWPAYMENTS_API_KEY,
  IPN_SECRET: process.env.NOWPAYMENTS_IPN_SECRET,
  WEBHOOK_URL: process.env.NOWPAYMENTS_WEBHOOK_URL,
  PRICES: {
    FREE: parseFloat(process.env.NOWPAYMENTS_PRICE_FREE || '0'),
    DEVELOPER: parseFloat(process.env.NOWPAYMENTS_PRICE_DEVELOPER || '50'),
    PROFESSIONAL: parseFloat(process.env.NOWPAYMENTS_PRICE_PROFESSIONAL || '100'),
  },
  CURRENCY: process.env.NOWPAYMENTS_CURRENCY || 'USD',
  CRYPTO_CURRENCIES: (process.env.NOWPAYMENTS_CRYPTO_CURRENCIES || 'BTC,ETH,USDT,USDC').split(','),
};

// NowPayments API endpoints
export const NOWPAYMENTS_ENDPOINTS = {
  CREATE_PAYMENT: '/payment',
  GET_PAYMENT_STATUS: '/payment/:payment_id',
  GET_MIN_AMOUNT: '/min-amount/:currency_from/:currency_to',
  GET_ESTIMATED_PRICE: '/estimate',
  GET_AVAILABLE_CURRENCIES: '/currencies',
  GET_AVAILABLE_PAIRS: '/merchant/coins',
};

export default nowpaymentsApi;
