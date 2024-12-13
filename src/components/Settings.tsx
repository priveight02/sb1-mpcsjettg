import React, { useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { ShareHabitsModal } from './settings/ShareHabitsModal';
import { BattleModal } from './BattleModal';
import { BattleJoinModal } from './BattleJoinModal';
import { BattleControlPanel } from './battle/BattleControlPanel';
import { DataManagementModal } from './settings/DataManagement';
import { PrivacySettings } from './settings/PrivacySettings';
import { SettingsLayout } from './settings/SettingsLayout';
import { ShareSection } from './settings/sections/ShareSection';
import { BattleSection } from './settings/sections/BattleSection';
import { InsightsSection } from './settings/sections/InsightsSection';
import { ThemeSection } from './settings/sections/ThemeSection';
import { NotificationsSection } from './settings/sections/NotificationsSection';
import { DataSection } from './settings/sections/DataSection';
import { GameSection } from './settings/sections/GameSection';
import { AdminDashboard } from './admin/AdminDashboard';

export const Settings: React.FC = () => {
  const clearAllData = useHabitStore((state) => state.clearAllData);
  const { user } = useAuthStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareHabits, setShowShareHabits] = useState(false);
  const [showCreateBattle, setShowCreateBattle] = useState(false);
  const [showJoinBattle, setShowJoinBattle] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [showBattleControl, setShowBattleControl] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const isAdmin = user?.email === 'astral@riseup.net';

  const handleBattleSelect = (battleId: string) => {
    setSelectedBattleId(battleId);
    setShowBattleControl(true);
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <ShareSection onShowShareHabits={() => setShowShareHabits(true)} />
        
        <BattleSection
          onShowCreateBattle={() => setShowCreateBattle(true)}
          onShowJoinBattle={() => setShowJoinBattle(true)}
          onBattleSelect={handleBattleSelect}
        />
        
        <InsightsSection />
        
        <ThemeSection />
        
        <NotificationsSection onShowNotifications={() => setShowNotifications(true)} />
        
        <DataSection onClearData={clearAllData} />

        <GameSection />

        {isAdmin && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Panel</h2>
            <p className="text-gray-400 mb-4">Access system-wide analytics and controls</p>
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open Admin Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <NotificationSettingsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      
      <ShareHabitsModal
        isOpen={showShareHabits}
        onClose={() => setShowShareHabits(false)}
      />
      
      <BattleModal
        isOpen={showCreateBattle}
        onClose={() => setShowCreateBattle(false)}
      />
      
      <BattleJoinModal
        isOpen={showJoinBattle}
        onClose={() => setShowJoinBattle(false)}
      />
      
      <DataManagementModal
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />
      
      {showBattleControl && selectedBattleId && (
        <BattleControlPanel
          battleId={selectedBattleId}
          onClose={() => {
            setShowBattleControl(false);
            setSelectedBattleId(null);
          }}
        />
      )}

      {showPrivacySettings && (
        <PrivacySettings />
      )}

      {showAdminPanel && (
        <AdminDashboard />
      )}
    </SettingsLayout>
  );
};