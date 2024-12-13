import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, Store, Package, Crown, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePremiumStore, PREMIUM_FEATURES, PREMIUM_PACKAGES } from '../../store/premiumStore';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { useStripeSession } from '../../hooks/useStripeSession';
import { PackageCard } from './PackageCard';

interface StorePanelProps {
  onClose: () => void;
}

export const StorePanel: React.FC<StorePanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'features'>('packages');
  const { user } = useAuthStore();
  const { getAvailablePoints } = usePremiumStore();
  const { isProcessing, handleCheckout } = useStripeCheckout();
  const availablePoints = getAvailablePoints();

  // Initialize Stripe session handling
  useStripeSession();

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 15 }}
              className="p-2 rounded-lg bg-indigo-600/20"
            >
              <Gem className="w-6 h-6 text-indigo-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-white">Premium Store</h2>
              <p className="text-gray-400">
                Available Points: {availablePoints.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREMIUM_PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onPurchase={() => handleCheckout(pkg.id)}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            <div className="text-sm">
              <p className="text-white">Secure Payments</p>
              <p className="text-gray-400">256-bit encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <div className="text-sm">
              <p className="text-white">Instant Delivery</p>
              <p className="text-gray-400">Points added immediately</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-indigo-400" />
            <div className="text-sm">
              <p className="text-white">Premium Support</p>
              <p className="text-gray-400">24/7 assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};