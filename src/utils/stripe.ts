import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = 'pk_live_51QNITlBLOeDPRjysyeaDu7QmP3kQmyMBq8c69OhAMK6CSU6A17QUlSru0FNK5m4ETEXtp5tRuM9YrASVYYVgGeWZ008BNYXnZQ';

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const PRODUCT_IDS = {
  starter: 'prod_RO8nmj70h2TrGM',
  premium: 'prod_RO8pYqCVAbRXz6',
  elite: 'prod_RO8t6k1kpJZq8g',
  ultimate: 'prod_RO8vJY7c1XOtDB'
} as const;

export const createCheckoutSession = async (packageId: keyof typeof PRODUCT_IDS) => {
  try {
    const response = await fetch('https://trackhab.me/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: PRODUCT_IDS[packageId],
        successUrl: `${window.location.origin}?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}?stripe_canceled=true`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    if (!data.sessionId) {
      throw new Error('Invalid response from server');
    }

    return data.sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};