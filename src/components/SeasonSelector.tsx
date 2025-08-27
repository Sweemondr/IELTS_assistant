// 雅思串题助手 - 题季选择器组件
import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrentSeason, useAppStore } from '../store/useAppStore';
import { Season } from '../types';

interface SeasonOption {
  id: string;
  name: Season;
}

const seasons: SeasonOption[] = [
  { id: '2025-5-8', name: '2025年5-8月' }
];

interface SeasonSelectorProps {
  className?: string;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({ className = '' }) => {
  const currentSeason = useCurrentSeason();
  const setCurrentSeason = useAppStore(state => state.setCurrentSeason);

  const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentSeason(event.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="season-select" className="block text-sm font-medium text-gray-700 mb-2">
        选择题季
      </label>
      <div className="relative">
        <select
          id="season-select"
          value={currentSeason}
          onChange={handleSeasonChange}
          className="
            w-full px-4 py-3 pr-10 text-base font-medium
            bg-white border-2 border-gray-200 rounded-lg
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
            transition-all duration-200 ease-in-out
            appearance-none cursor-pointer
            hover:border-gray-300
          "
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>

    </div>
  );
};

export default SeasonSelector;