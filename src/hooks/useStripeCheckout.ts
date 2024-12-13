import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { stripePromise, createStripeSession } from '../services/stripe';
import toast from 'react-hot-toast';

export const useStripeCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();

  const handleCheckout = useCallback(async (packageId: string) => {
    if (!user) {
      toast.error('Please sign in to make a purchase');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Preparing checkout...');

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const sessionId = await createStripeSession(packageId as any);
      
      // Store purchase info for verification
      localStorage.setItem('pendingPurchase', JSON.stringify({
        packageId,
        userId: user.uid,
        timestamp: Date.now()
      }));

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout', {
        id: loadingToast
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  return { isProcessing, handleCheckout };
};