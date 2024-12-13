import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useLeaderboardStore } from './leaderboardStore';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredPoints: number;
  status: 'locked' | 'unlocked' | 'active';
}

export interface PremiumPackage {
  id: string;
  title: string;
  points: number;
  price: string;
  description: string;
  color: string;
  perks: string[];
  popular?: boolean;
  featured?: boolean;
  limitedTime?: boolean;
  discount?: number;
  originalPrice?: string;
}

interface PremiumState {
  purchasedFeatures: string[];
  enabledFeatures: string[];
  availablePoints: number;
  purchaseHistory: Array<{
    id: string;
    packageId: string;
    points: number;
    date: string;
  }>;
  activeFeatures: PremiumFeature[];
}

interface PremiumStore extends PremiumState {
  addPoints: (points: number) => void;
  unlockFeature: (featureId: string) => boolean;
  toggleFeature: (featureId: string) => void;
  hasFeature: (featureId: string) => boolean;
  isFeatureEnabled: (featureId: string) => boolean;
  getFeatureStatus: (featureId: string) => PremiumFeature['status'];
  getAvailablePoints: () => number;
  recordPurchase: (packageId: string, points: number) => void;
}

export const PREMIUM_PACKAGES: PremiumPackage[] = [
  {
    id: 'starter',
    title: 'Starter Pack',
    points: 1000,
    price: '4.99',
    description: 'Perfect for getting started',
    color: 'from-blue-500 to-blue-600',
    perks: [
      '1,000 Premium Points',
      'Basic Profile Badge',
      'Standard Themes'
    ]
  },
  {
    id: 'premium',
    title: 'Premium Pack',
    points: 3000,
    price: '9.99',
    description: 'Most popular choice',
    color: 'from-purple-500 to-purple-600',
    perks: [
      '3,000 Premium Points',
      'Premium Profile Badge',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support'
    ],
    popular: true,
    discount: 20,
    originalPrice: '12.99'
  },
  {
    id: 'elite',
    title: 'Elite Pack',
    points: 7500,
    price: '19.99',
    description: 'For serious habit builders',
    color: 'from-yellow-500 to-yellow-600',
    perks: [
      '7,500 Premium Points',
      'Elite Profile Badge',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support',
      'Exclusive Challenges',
      'Early Access Features'
    ],
    featured: true
  },
  {
    id: 'ultimate',
    title: 'Ultimate Pack',
    points: 20000,
    price: '39.99',
    description: 'Best value for points',
    color: 'from-emerald-500 to-emerald-600',
    perks: [
      '20,000 Premium Points',
      'Ultimate Profile Badge',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support',
      'Exclusive Challenges',
      'Early Access Features',
      'Personal Success Coach',
      'Lifetime Updates'
    ],
    limitedTime: true
  }
];

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Access detailed habit statistics and predictions',
    enabled: false,
    requiredPoints: 1000,
    status: 'locked'
  },
  {
    id: 'unlimited_battles',
    name: 'Unlimited Battles',
    description: 'Create and join unlimited habit battles',
    enabled: false,
    requiredPoints: 2000,
    status: 'locked'
  },
  {
    id: 'custom_themes',
    name: 'Custom Themes',
    description: 'Unlock premium themes and customization options',
    enabled: false,
    requiredPoints: 1500,
    status: 'locked'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get priority assistance and feature requests',
    enabled: false,
    requiredPoints: 3000,
    status: 'locked'
  },
  {
    id: 'extended_history',
    name: 'Extended History',
    description: 'Access your complete habit history and insights',
    enabled: false,
    requiredPoints: 2500,
    status: 'locked'
  },
  {
    id: 'smart_reminders',
    name: 'Smart Reminders',
    description: 'AI-powered reminder suggestions based on your patterns',
    enabled: false,
    requiredPoints: 2000,
    status: 'locked'
  }
];

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      purchasedFeatures: [],
      enabledFeatures: [],
      availablePoints: 0,
      purchaseHistory: [],
      activeFeatures: PREMIUM_FEATURES,

      addPoints: (points: number) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set((state) => ({
          availablePoints: state.availablePoints + points
        }));

        // Update leaderboard with new points
        const leaderboard = useLeaderboardStore.getState();
        leaderboard.addPoints(user.uid, points);
      },

      unlockFeature: (featureId: string) => {
        const state = get();
        const feature = state.activeFeatures.find(f => f.id === featureId);
        
        if (!feature || state.purchasedFeatures.includes(featureId)) {
          return false;
        }

        if (state.availablePoints >= feature.requiredPoints) {
          set((state) => ({
            availablePoints: state.availablePoints - feature.requiredPoints,
            purchasedFeatures: [...state.purchasedFeatures, featureId],
            activeFeatures: state.activeFeatures.map(f =>
              f.id === featureId ? { ...f, status: 'unlocked' as const } : f
            )
          }));
          return true;
        }

        return false;
      },

      toggleFeature: (featureId: string) => {
        const state = get();
        const isCurrentlyEnabled = state.enabledFeatures.includes(featureId);
        
        set((state) => ({
          enabledFeatures: isCurrentlyEnabled
            ? state.enabledFeatures.filter(id => id !== featureId)
            : [...state.enabledFeatures, featureId],
          activeFeatures: state.activeFeatures.map(f =>
            f.id === featureId
              ? { ...f, status: isCurrentlyEnabled ? 'unlocked' as const : 'active' as const }
              : f
          )
        }));
      },

      hasFeature: (featureId: string) => {
        return get().purchasedFeatures.includes(featureId);
      },

      isFeatureEnabled: (featureId: string) => {
        return get().enabledFeatures.includes(featureId);
      },

      getFeatureStatus: (featureId: string) => {
        const feature = get().activeFeatures.find(f => f.id === featureId);
        return feature?.status || 'locked';
      },

      getAvailablePoints: () => {
        return get().availablePoints;
      },

      recordPurchase: (packageId: string, points: number) => {
        const purchase = {
          id: crypto.randomUUID(),
          packageId,
          points,
          date: new Date().toISOString()
        };

        set((state) => ({
          purchaseHistory: [...state.purchaseHistory, purchase]
        }));

        // Add points to user's balance
        get().addPoints(points);
      }
    }),
    {
      name: 'premium-store',
      version: 1,
    }
  )
);