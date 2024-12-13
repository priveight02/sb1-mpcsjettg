import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Package, Star, Crown, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PREMIUM_PACKAGES } from '../../store/premiumStore';
import confetti from 'canvas-confetti';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger celebration effects
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  }, []);

  // Filter out the purchased package
  const recommendedPackages = PREMIUM_PACKAGES.filter(pkg => 
    pkg.id !== localStorage.getItem('lastPurchasedPackage')
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <Link 
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6"
          >
            <Check className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Your points have been added to your account. Start exploring premium features now!
          </p>
        </motion.div>

        {/* Recommended Packages */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Recommended Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 relative overflow-hidden group"
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 
                              group-hover:opacity-20 transition-opacity duration-300 ${pkg.color}`} />
                
                {/* Icon */}
                <div className="mb-4">
                  {pkg.id === 'starter' && <Package className="w-8 h-8 text-blue-400" />}
                  {pkg.id === 'premium' && <Star className="w-8 h-8 text-purple-400" />}
                  {pkg.id === 'elite' && <Crown className="w-8 h-8 text-yellow-400" />}
                  {pkg.id === 'ultimate' && <Sparkles className="w-8 h-8 text-emerald-400" />}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{pkg.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                
                <div className="flex items-baseline mb-4">
                  <span className="text-2xl font-bold text-white">${pkg.price}</span>
                  {pkg.discount && (
                    <span className="ml-2 text-sm text-gray-400 line-through">
                      ${pkg.originalPrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => navigate('/store')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg 
                           hover:bg-indigo-700 transition-colors"
                >
                  View Package
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};