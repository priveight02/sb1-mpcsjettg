import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Users, Shield, FileText, Server, BarChart, Mail,
  Settings, ArrowLeft
} from 'lucide-react';
import { AdminStats } from './AdminStats';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminSecurityLogs } from './AdminSecurityLogs';
import { AdminContentManagement } from './AdminContentManagement';
import { AdminSystemHealth } from './AdminSystemHealth';
import { AdminAnalytics } from './AdminAnalytics';
import { EmailNotificationManager } from './EmailNotificationManager';
import { AdminSettings } from './AdminSettings';
import { useAdminStore } from '../../store/adminStore';
import { useSecurityMonitoring } from '../../hooks/useSecurityMonitoring';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { startRealtimeMonitoring, stopRealtimeMonitoring } = useAdminStore();
  const { logUserAction } = useSecurityMonitoring();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user?.email === 'astral@riseup.net') {
      toast.error('Unauthorized access');
      return;
    }

    // Start monitoring when dashboard opens
    startRealtimeMonitoring();
    logUserAction('access', 'admin_dashboard');

    // Log admin session
    return () => {
      stopRealtimeMonitoring();
      logUserAction('exit', 'admin_dashboard');
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, component: AdminStats },
    { id: 'users', label: 'Users', icon: Users, component: AdminUserManagement },
    { id: 'security', label: 'Security', icon: Shield, component: AdminSecurityLogs },
    { id: 'content', label: 'Content', icon: FileText, component: AdminContentManagement },
    { id: 'system', label: 'System', icon: Server, component: AdminSystemHealth },
    { id: 'analytics', label: 'Analytics', icon: BarChart, component: AdminAnalytics },
    { id: 'email', label: 'Email', icon: Mail, component: EmailNotificationManager },
    { id: 'settings', label: 'Settings', icon: Settings, component: AdminSettings }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminStats;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-4">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                         ${activeTab === tab.id
                           ? 'bg-indigo-600 text-white'
                           : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                         }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto"
          >
            <ActiveComponent />
          </motion.div>
        </div>
      </div>
    </div>
  );
};