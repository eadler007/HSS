
import React from 'react';
import { Park } from '../types';
import ParkCard from './ParkCard';

interface SidebarProps {
  parks: Park[];
  totalCount: number;
  onlyShowFavorites: boolean;
  setOnlyShowFavorites: (val: boolean) => void;
  onToggleFavorite: (id: string) => void;
  selectedPark: Park | null;
  onSelectPark: (park: Park) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  parks, 
  totalCount, 
  onlyShowFavorites, 
  setOnlyShowFavorites, 
  onToggleFavorite,
  selectedPark,
  onSelectPark
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Found Parks</p>
          <p className="text-2xl font-black text-blue-900">{totalCount}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center cursor-pointer select-none">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={onlyShowFavorites}
                onChange={() => setOnlyShowFavorites(!onlyShowFavorites)}
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${onlyShowFavorites ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${onlyShowFavorites ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <span className="ml-2 text-xs font-bold text-gray-600">Favorites</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {parks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-2 italic">
              {onlyShowFavorites ? "No favorite parks selected yet." : "No parks found in this area."}
            </p>
            {onlyShowFavorites && (
              <button 
                onClick={() => setOnlyShowFavorites(false)}
                className="text-blue-600 text-xs font-bold hover:underline"
              >
                Show all parks
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {parks.map(park => (
              <ParkCard 
                key={park.id} 
                park={park} 
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectPark}
                isSelected={selectedPark?.id === park.id}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* NFC Attribution */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3 opacity-60">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-700">NFC</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">National Fitness Campaign</p>
            <p className="text-[9px] text-gray-400 leading-tight">Advancing health and wellness in city spaces.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
