
import React, { useState } from 'react';
import { Park } from '../types';
import { getScoreColor } from '../utils/isochrone';

interface ParkCardProps {
  park: Park;
  onToggleFavorite: (id: string) => void;
  onSelect: (park: Park) => void;
  isSelected: boolean;
}

const ParkCard: React.FC<ParkCardProps> = ({ park, onToggleFavorite, onSelect, isSelected }) => {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const scoreColor = getScoreColor(park.score.total);

  return (
    <div 
      className={`p-4 mb-3 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'
      }`}
      onClick={() => onSelect(park)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800 leading-tight flex-1 mr-2">{park.name}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(park.id);
          }}
          className={`p-1 transition-colors ${park.isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`}
          aria-label={park.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={park.isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="px-3 py-1 rounded-full text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: scoreColor }}
        >
          Score: {park.score.total}
        </div>
        <span className="text-xs text-gray-400 truncate flex-1">{park.address}</span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 mb-3">
        <div className="flex justify-between border-b pb-0.5">
          <span>Connectivity</span>
          <span className="font-semibold">{park.score.connectivity}/25</span>
        </div>
        <div className="flex justify-between border-b pb-0.5">
          <span>Amenities</span>
          <span className="font-semibold">{park.score.amenities}/30</span>
        </div>
        <div className="flex justify-between border-b pb-0.5">
          <span>Reviews</span>
          <span className="font-semibold">{park.score.reviews}/25</span>
        </div>
        <div className="flex justify-between border-b pb-0.5">
          <span>Visibility</span>
          <span className="font-semibold">{park.score.visibility}/20</span>
        </div>
      </div>

      <div className="mt-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowAllAmenities(!showAllAmenities);
          }}
          className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors uppercase tracking-wider mb-2"
        >
          {showAllAmenities ? 'Hide Amenities' : 'View Amenities'}
          <svg 
            className={`w-3 h-3 transition-transform ${showAllAmenities ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className={`flex flex-wrap gap-1 transition-all duration-300 overflow-hidden ${showAllAmenities ? 'max-h-40 opacity-100' : 'max-h-6 opacity-80'}`}>
          {(showAllAmenities ? park.amenitiesList : park.amenitiesList.slice(0, 3)).map((a, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600 border border-gray-200">
              {a}
            </span>
          ))}
          {!showAllAmenities && park.amenitiesList.length > 3 && (
            <span className="text-[9px] text-gray-400 font-medium">+{park.amenitiesList.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkCard;
