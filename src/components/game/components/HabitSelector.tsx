import React from 'react';
import { motion } from 'framer-motion';

interface HabitSelectorProps {
  habits: any[];
  selectedHabit: string;
  onSelect: (habitId: string) => void;
}

export const HabitSelector: React.FC<HabitSelectorProps> = ({
  habits,
  selectedHabit,
  onSelect,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Your Habit
      </label>
      <select
        value={selectedHabit}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
      >
        <option value="">Choose a habit...</option>
        {habits.map(habit => (
          <option key={habit.id} value={habit.id}>
            {habit.title}
          </option>
        ))}
      </select>
    </div>
  );
};