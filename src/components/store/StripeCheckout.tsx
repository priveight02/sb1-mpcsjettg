import React from 'react';
import { motion } from 'framer-motion';
import { stripePromise, createCheckoutSession, PRODUCT_IDS } from '../../utils/stripe';
import toast from 'react-hot-toast';

interface StripeCheckoutProps {
  packageId: keyof typeof PRODUCT_IDS;
  onSuccess?: () => void;
  onError?: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  packageId,
  onSuccess,
  onError
}) => {
  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const sessionId = await createCheckoutSession(packageId);
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe checkout error:', error);
        toast.error('Failed to initiate checkout');
        onError?.();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process payment');
      onError?.();
    }
  };

  return (
    <motion.button
      onClick={handleCheckout}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full mt-6 py-2.5 px-4 rounded-lg font-medium text-white
                bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg
                hover:shadow-xl transition-all duration-200"
    >
      Purchase Now
    </motion.button>
  );
};