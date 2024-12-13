import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { PREMIUM_PACKAGES } from '../../store/premiumStore';
import { StripeCheckout } from './StripeCheckout';

export const PackagesTab: React.FC<{
  onPurchaseSuccess: (points: number) => void;
}> = ({ onPurchaseSuccess }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {PREMIUM_PACKAGES.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative bg-gray-800 rounded-xl p-6 ${
            pkg.popular ? 'ring-2 ring-indigo-500' : ''
          }`}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white">{pkg.title}</h3>
            <p className="text-gray-400 text-sm">{pkg.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-white">${pkg.price}</span>
              {pkg.discount && (
                <span className="ml-2 text-sm text-gray-400 line-through">
                  ${pkg.originalPrice}
                </span>
              )}
            </div>
            <p className="text-indigo-400 font-medium mt-1">
              {pkg.points.toLocaleString()} Points
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {pkg.perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-sm text-gray-300">{perk}</span>
              </div>
            ))}
          </div>

          <StripeCheckout
            packageId={pkg.id}
            onSuccess={() => onPurchaseSuccess(pkg.points)}
          />

          {pkg.limitedTime && (
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-500">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Limited Time Offer</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};