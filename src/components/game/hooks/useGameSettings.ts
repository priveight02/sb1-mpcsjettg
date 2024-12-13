import { useState, useCallback } from 'react';
import { GameSettings, DifficultyPreset } from '../types/gameSettings';
import { GAME_CONFIG } from '../config/gameConfig';

const DIFFICULTY_PRESETS: Record<DifficultyPreset, Partial<GameSettings>> = {
  easy: {
    gravity: 0.3,
    jumpForce: -8,
    obstacleSpeed: 2,
    obstacleGap: 180,
    obstacleFrequency: 200,
    powerUpFrequency: 0.15,
    difficulty: 'easy'
  },
  medium: {
    gravity: 0.5,
    jumpForce: -10,
    obstacleSpeed: 3,
    obstacleGap: 150,
    obstacleFrequency: 150,
    powerUpFrequency: 0.1,
    difficulty: 'medium'
  },
  hard: {
    gravity: 0.7,
    jumpForce: -12,
    obstacleSpeed: 4,
    obstacleGap: 120,
    obstacleFrequency: 100,
    powerUpFrequency: 0.05,
    difficulty: 'hard'
  }
};

const DEFAULT_SETTINGS: GameSettings = {
  gravity: GAME_CONFIG.gravity,
  jumpForce: GAME_CONFIG.jumpForce,
  obstacleSpeed: GAME_CONFIG.obstacleSpeed,
  obstacleGap: GAME_CONFIG.obstacleGap,
  obstacleFrequency: GAME_CONFIG.obstacleFrequency,
  powerUpFrequency: GAME_CONFIG.powerUpFrequency,
  theme: 'default',
  effects: true,
  difficulty: 'medium'
};

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  const updateSettings = useCallback((updates: Partial<GameSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('gameSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const applyDifficultyPreset = useCallback((difficulty: DifficultyPreset) => {
    const preset = DIFFICULTY_PRESETS[difficulty];
    updateSettings(preset);
  }, [updateSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('gameSettings', JSON.stringify(DEFAULT_SETTINGS));
  }, []);

  return {
    settings,
    updateSettings,
    applyDifficultyPreset,
    resetSettings
  };
};