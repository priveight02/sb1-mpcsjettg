import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { Navigation } from './components/Navigation';
import { HabitList } from './components/HabitList';
import { Notes } from './components/Notes';
import { Calendar } from './components/Calendar';
import { Settings } from './components/Settings';
import { UserSettings } from './components/settings/UserSettings';
import { HabitFlyer } from './components/game/HabitFlyer';
import { PaymentSuccess } from './components/payment/PaymentSuccess';
import { PaymentFailed } from './components/payment/PaymentFailed';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useAuthStore } from './store/authStore';
import { BubbleRewards } from './components/rewards/BubbleRewards';
import { useStripeSession } from './hooks/useStripeSession';

const App: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.email === 'astral@riseup.net';

  // Initialize Stripe session handling
  useStripeSession();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<HabitList />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/user-settings/*" element={<UserSettings />} />
          
          {/* Game Routes */}
          <Route path="/game/habit-flyer" element={<HabitFlyer />} />
          
          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          
          {/* Admin Routes - Protected */}
          {isAdmin && (
            <Route path="/admin/*" element={<AdminDashboard />} />
          )}
        </Routes>

        {/* Global Navigation */}
        <Navigation onAddHabit={() => {}} />

        {/* Floating Rewards */}
        <BubbleRewards />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#fff',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;