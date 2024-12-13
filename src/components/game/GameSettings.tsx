import React from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Gamepad2, Zap, Sparkles } from 'lucide-react';
import { GameSettings, DifficultyPreset } from './types/gameSettings';
import { useGameSettings } from './hooks/useGameSettings';

interface GameSettingsModalProps {
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings, applyDifficultyPreset } = useGameSettings();

  const handleDifficultyChange = (difficulty: DifficultyPreset) => {
    applyDifficultyPreset(difficulty);
  };

  const handleSettingChange = (key: keyof GameSettings, value: number | boolean | string) => {
    updateSettings({ [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gray-800 rounded-xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">Game Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Difficulty Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultyChange(difficulty)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    settings.difficulty === difficulty
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Advanced Settings</h3>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Gravity Force
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.gravity}
                onChange={(e) => handleSettingChange('gravity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Jump Force
              </label>
              <input
                type="range"
                min="-15"
                max="-5"
                step="1"
                value={settings.jumpForce}
                onChange={(e) => handleSettingChange('jumpForce', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Obstacle Speed
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={settings.obstacleSpeed}
                onChange={(e) => handleSettingChange('obstacleSpeed', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Power-up Frequency
              </label>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.05"
                value={settings.powerUpFrequency}
                onChange={(e) => handleSettingChange('powerUpFrequency', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Visual Settings</h3>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="default">Default</option>
                <option value="neon">Neon</option>
                <option value="retro">Retro</option>
                <option value="space">Space</option>
              </select>
            </div>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Visual Effects</span>
              </div>
              <input
                type="checkbox"
                checked={settings.effects}
                onChange={(e) => handleSettingChange('effects', e.target.checked)}
                className="rounded text-indigo-600"
              />
            </label>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};