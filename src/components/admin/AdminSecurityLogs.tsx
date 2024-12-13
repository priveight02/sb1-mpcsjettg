import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Clock, User, Lock, Globe } from 'lucide-react';

interface SecurityLog {
  id: string;
  type: 'auth' | 'access' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  ip?: string;
  location?: string;
  userId?: string;
}

export const AdminSecurityLogs: React.FC = () => {
  const logs: SecurityLog[] = [
    {
      id: '1',
      type: 'auth',
      severity: 'high',
      message: 'Failed login attempt - Invalid credentials',
      timestamp: '2024-01-20T10:30:00Z',
      ip: '192.168.1.1',
      location: 'New York, US',
      userId: 'user123'
    },
    {
      id: '2',
      type: 'system',
      severity: 'critical',
      message: 'Unauthorized access attempt to admin panel',
      timestamp: '2024-01-20T09:45:00Z',
      ip: '10.0.0.1',
      location: 'London, UK'
    },
    {
      id: '3',
      type: 'access',
      severity: 'medium',
      message: 'User permissions modified',
      timestamp: '2024-01-20T08:15:00Z',
      userId: 'admin456'
    }
  ];

  const getSeverityColor = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-blue-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-orange-400';
      case 'critical':
        return 'text-red-400';
    }
  };

  const getTypeIcon = (type: SecurityLog['type']) => {
    switch (type) {
      case 'auth':
        return Lock;
      case 'access':
        return Shield;
      case 'system':
        return AlertTriangle;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Security Logs</h2>
        <div className="flex items-center gap-2">
          <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white">
            <option value="all">All Types</option>
            <option value="auth">Authentication</option>
            <option value="access">Access</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log, index) => {
          const TypeIcon = getTypeIcon(log.type);
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                <div className={`${getSeverityColor(log.severity)}`}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{log.message}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getSeverityColor(log.severity)} bg-opacity-20`}>
                      {log.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.userId && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {log.userId}
                      </div>
                    )}
                    {log.ip && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {log.ip} ({log.location})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};