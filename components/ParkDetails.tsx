
import React from 'react';
import { Park } from '../types';
import { getScoreColor } from '../utils/isochrone';

interface ParkDetailsProps {
  park: Park;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

const ScoreGauge: React.FC<{ label: string; score: number; max: number; color: string }> = ({ label, score, max, color }) => {
  const percentage = (score / max) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
        <span>{label}</span>
        <span>{score}/{max}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const ParkDetails: React.FC<ParkDetailsProps> = ({ park, onClose, onToggleFavorite }) => {
  const scoreColor = getScoreColor(park.score.total);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-100 sticky top-0 z-20">
        <button 
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 hover:gap-2 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to List
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-blue-900 leading-tight mb-1">{park.name}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {park.address}
            </p>
          </div>
          <button 
            onClick={() => onToggleFavorite(park.id)}
            className={`p-2 rounded-full transition-all ${park.isFavorite ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-gray-300 hover:text-red-300'}`}
          >
            <svg className="w-6 h-6" fill={park.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Hero Score */}
        <div className="flex items-center justify-between p-6 rounded-2xl border-2 bg-gradient-to-br from-white to-gray-50 shadow-sm" style={{ borderColor: scoreColor }}>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Healthy Site Score</p>
            <p className="text-5xl font-black" style={{ color: scoreColor }}>{park.score.total}<span className="text-lg text-gray-300">/100</span></p>
          </div>
          <div className="text-right">
             <div 
               className="inline-block px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider mb-2"
               style={{ backgroundColor: scoreColor }}
             >
               {park.score.total >= 80 ? 'Exceptional' : park.score.total >= 60 ? 'Healthy' : 'Needs Improvement'}
             </div>
             <p className="text-[10px] text-gray-400 leading-tight max-w-[120px]">Based on NFC site standards for connectivity & amenities.</p>
          </div>
        </div>

        {/* Detailed Metrics */}
        <section>
          <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 border-b pb-2">Scoring Breakdown</h3>
          <div className="space-y-4">
            <ScoreGauge label="Pedestrian Connectivity" score={park.score.connectivity} max={25} color={scoreColor} />
            <ScoreGauge label="Recreation Amenities" score={park.score.amenities} max={30} color={scoreColor} />
            <ScoreGauge label="Ratings & Reviews" score={park.score.reviews} max={25} color={scoreColor} />
            <ScoreGauge label="Road Visibility" score={park.score.visibility} max={20} color={scoreColor} />
          </div>
        </section>

        {/* Amenities List */}
        <section>
          <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 border-b pb-2">Existing Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {park.amenitiesList.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-xs text-gray-600 font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 10 Min Bike Reach Info */}
        <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">10-Min Bike Reach</h4>
              <p className="text-xs text-blue-700/80 leading-relaxed">
                The colored isochrone on the map represents a realistic cycling distance from this park based on local infrastructure.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Branding */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded bg-blue-700 flex items-center justify-center text-[8px] text-white font-black">NFC</div>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">National Fitness Campaign</span>
        </div>
        <a href="https://nationalfitnesscampaign.com" target="_blank" className="text-[10px] font-bold text-blue-600 hover:underline">Learn More</a>
      </div>
    </div>
  );
};

export default ParkDetails;
