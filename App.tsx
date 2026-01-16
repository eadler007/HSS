
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ParkDetails from './components/ParkDetails';
import Map from './components/Map';
import { Park, MapViewMode } from './types';
import { searchAndScoreParks } from './services/geminiService';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [parks, setParks] = useState<Park[]>([]);
  const [cityBoundary, setCityBoundary] = useState<[number, number][]>([]);
  const [viewMode, setViewMode] = useState<MapViewMode>('map');
  const [showBikeIsochrones, setShowBikeIsochrones] = useState(true);
  const [showWalkIsochrones, setShowWalkIsochrones] = useState(false);
  const [onlyShowFavorites, setOnlyShowFavorites] = useState(false);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Geolocation error:", error)
      );
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simple debounced autocomplete
  useEffect(() => {
    if (searchQuery.length < 3 || isSearching) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearching]);

  const performSearch = async (query: string) => {
    if (isSearching) return;
    
    setIsSearching(true);
    setError(null);
    setSelectedPark(null);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const results = await searchAndScoreParks(query, userLocation || undefined);
      if (results.parks.length === 0) {
        setError("No parks found in that specific area. Try a broader city name.");
      }
      setParks(results.parks);
      setCityBoundary(results.cityBoundary);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Analysis failed. Please check your search term or try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    performSearch(searchQuery);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const name = suggestion.display_name;
    setSearchQuery(name);
    setShowSuggestions(false);
    performSearch(name);
  };

  const handleToggleFavorite = (id: string) => {
    setParks(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const filteredParks = useMemo(() => {
    return onlyShowFavorites ? parks.filter(p => p.isFavorite) : parks;
  }, [parks, onlyShowFavorites]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <div className="w-full md:w-[420px] h-[400px] md:h-full border-r border-gray-200 bg-white flex flex-col shadow-xl z-20">
        {selectedPark ? (
          <ParkDetails 
            park={selectedPark} 
            onClose={() => setSelectedPark(null)} 
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <>
            <div className="p-6 bg-blue-700 text-white shrink-0 relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-700 shadow-inner">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                   </svg>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight leading-none uppercase">Park Scorer</h1>
                  <p className="text-[10px] font-bold text-blue-200 tracking-widest uppercase mt-1 opacity-80">National Fitness Campaign</p>
                </div>
              </div>
              
              <div className="relative" ref={suggestionRef}>
                <form onSubmit={handleSearchSubmit} className="relative mb-0">
                  <input 
                    type="text"
                    placeholder="Enter City Name..."
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-400/30 shadow-2xl border-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600 disabled:opacity-50"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </button>
                </form>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[1002] animate-in fade-in zoom-in duration-200">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-50 flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <span className="truncate">{s.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-3 flex items-start gap-2 bg-red-500/20 p-3 rounded-lg border border-red-500/30 animate-in slide-in-from-top-1">
                  <svg className="w-4 h-4 text-red-200 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] font-bold text-red-100 leading-tight">{error}</p>
                </div>
              )}
            </div>

            <Sidebar 
              parks={filteredParks}
              totalCount={parks.length}
              onlyShowFavorites={onlyShowFavorites}
              setOnlyShowFavorites={setOnlyShowFavorites}
              onToggleFavorite={handleToggleFavorite}
              selectedPark={selectedPark}
              onSelectPark={setSelectedPark}
            />
          </>
        )}
      </div>

      <div className="flex-1 relative h-full">
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col p-1">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Standard
            </button>
            <button 
              onClick={() => setViewMode('aerial')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'aerial' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Satellite
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setShowBikeIsochrones(!showBikeIsochrones)}
              className={`px-4 py-2.5 rounded-xl shadow-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                showBikeIsochrones ? 'bg-blue-700 text-white' : 'bg-white text-gray-500 hover:text-blue-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21l-8-9 8-9 8 9-8 9z" />
              </svg>
              Bike Reach
            </button>
            <button 
              onClick={() => setShowWalkIsochrones(!showWalkIsochrones)}
              className={`px-4 py-2.5 rounded-xl shadow-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                showWalkIsochrones ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:text-blue-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Walk Reach
            </button>
          </div>
        </div>

        <div className="w-full h-full bg-blue-50 relative">
          <Map 
            parks={filteredParks} 
            cityBoundary={cityBoundary}
            viewMode={viewMode}
            showBikeIsochrones={showBikeIsochrones}
            showWalkIsochrones={showWalkIsochrones}
            selectedPark={selectedPark}
            onParkSelect={setSelectedPark}
            userLocation={userLocation}
          />

          {isSearching && (
            <div className="absolute inset-0 z-[1001] bg-white/40 backdrop-blur-md flex flex-col items-center justify-center p-6 transition-all duration-500">
               <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-xl"></div>
               <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Analyzing Parks...</h3>
               <p className="text-sm font-medium text-blue-700/60 mt-2">Scoring site connectivity and amenities</p>
            </div>
          )}

          {parks.length === 0 && !isSearching && (
            <div className="absolute inset-0 z-[1001] bg-gradient-to-br from-blue-50/20 to-transparent flex items-center justify-center pointer-events-none p-6">
              <div className="bg-white/95 p-10 rounded-3xl shadow-2xl text-center pointer-events-auto max-w-md border border-white backdrop-blur-sm">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                   </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">NATIONAL FITNESS SEARCH</h2>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">Identify and score parks based on accessibility and infrastructure to support healthy community growth.</p>
                <div className="flex items-center justify-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">System Ready • Enter a City to Begin</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {!selectedPark && parks.length > 0 && (
          <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/50 w-56 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Healthy Site Score</h4>
            <div className="h-4 w-full rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 mb-3 shadow-inner"></div>
            <div className="flex justify-between text-[9px] font-black text-gray-500 tracking-tighter uppercase">
              <span>0 (Deficient)</span>
              <span>100 (Exceptional)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
