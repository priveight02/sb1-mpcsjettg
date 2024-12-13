import React from 'react';
import { motion } from 'framer-motion';
import { Star, Gem, Crown, Sparkles, Check } from 'lucide-react';
import type { PremiumPackage } from '../../store/premiumStore';

interface PackageCardProps {
  pkg: PremiumPackage;
  onPurchase: () => void;
  isProcessing: boolean;
}

const getPackageIcon = (packageId: string) => {
  switch (packageId) {
    case 'starter':
      return { icon: Gem, color: 'from-blue-500 to-blue-600', size: 16 };
    case 'premium':
      return { icon: Star, color: 'from-purple-500 to-purple-600', size: 16 };
    case 'elite':
      return { icon: Crown, color: 'from-yellow-500 to-yellow-600', size: 16 };
    case 'ultimate':
      return { icon: Sparkles, color: 'from-emerald-500 to-emerald-600', size: 16 };
    default:
      return { icon: Star, color: 'from-indigo-500 to-indigo-600', size: 16 };
  }
};

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onPurchase, isProcessing }) => {
  const { icon: Icon, color } = getPackageIcon(pkg.id);
  const isExpensive = pkg.id === 'elite' || pkg.id === 'ultimate';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gray-700 rounded-xl p-6"
    >
      {/* Package Icon */}
      <div className="absolute -top-2 -right-2">
        <motion.div
          className="relative"
          animate={{
            y: [0, -2, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} 
                        flex items-center justify-center relative overflow-visible`}>
            <Icon className="text-white" />
            
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-white opacity-0"
              animate={{
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Sparkle effects for expensive packages */}
            {isExpensive && (
              <motion.div
                className="absolute -inset-1"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      top: `${50 + Math.cos(i * 60) * 100}%`,
                      left: `${50 + Math.sin(i * 60) * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Package Content */}
      <div className="mb-4 mt-4">
        <h3 className="text-xl font-semibold text-white">{pkg.title}</h3>
        <p className="text-gray-400">{pkg.description}</p>
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
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">{perk}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onPurchase}
        disabled={isProcessing}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg 
                 hover:bg-indigo-700 transition-colors disabled:opacity-50
                 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          'Purchase Now'
        )}
      </button>

      {pkg.limitedTime && (
        <div className="mt-4 flex items-center justify-center gap-2 text-yellow-500">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">Limited Time Offer</span>
        </div>
      )}
    </motion.div>
  );
};