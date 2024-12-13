import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyStripeSession } from '../services/stripe';
import { usePremiumStore } from '../store/premiumStore';
import toast from 'react-hot-toast';

export const useStripeSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordPurchase } = usePremiumStore();

  useEffect(() => {
    const handleSessionVerification = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      const success = params.get('stripe_success');

      if (success === 'true' && sessionId) {
        const loadingToast = toast.loading('Verifying purchase...');

        try {
          const result = await verifyStripeSession(sessionId);

          if (result.success) {
            const pendingPurchase = JSON.parse(localStorage.getItem('pendingPurchase') || '{}');
            recordPurchase(pendingPurchase.packageId, result.points);
            
            toast.success('Purchase completed successfully!', {
              id: loadingToast,
              duration: 5000,
            });

            // Clean up
            localStorage.removeItem('pendingPurchase');
            navigate('/payment/success', { replace: true });

          } else {
            throw new Error('Purchase verification failed');
          }
        } catch (error) {
          console.error('Verification error:', error);
          toast.error('Failed to verify purchase. Please contact support.', {
            id: loadingToast
          });
          navigate('/payment/failed', { replace: true });
        }
      } else if (success === 'false') {
        toast.error('Purchase was cancelled');
        navigate('/payment/failed', { replace: true });
      }
    };

    handleSessionVerification();
  }, [location.search]);
};