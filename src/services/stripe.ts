import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const API_URL = 'https://trackhab.me/api';

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const PRODUCT_IDS = {
  starter: import.meta.env.VITE_STRIPE_PRODUCT_STARTER,
  premium: import.meta.env.VITE_STRIPE_PRODUCT_PREMIUM,
  elite: import.meta.env.VITE_STRIPE_PRODUCT_ELITE,
  ultimate: import.meta.env.VITE_STRIPE_PRODUCT_ULTIMATE,
} as const;

export const createStripeSession = async (packageId: keyof typeof PRODUCT_IDS) => {
  try {
    const response = await fetch(`${API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: PRODUCT_IDS[packageId],
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment/failed`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Stripe session creation failed:', error);
    throw error;
  }
};

export const verifyStripeSession = async (sessionId: string) => {
  try {
    const response = await fetch(`${API_URL}/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify session');
    }

    return await response.json();
  } catch (error) {
    console.error('Session verification failed:', error);
    throw error;
  }
};