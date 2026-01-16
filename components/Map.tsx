
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Park, MapViewMode } from '../types';
import { generateIsochrone, getScoreColor } from '../utils/isochrone';

interface MapProps {
  parks: Park[];
  cityBoundary: [number, number][];
  viewMode: MapViewMode;
  showBikeIsochrones: boolean;
  showWalkIsochrones: boolean;
  selectedPark: Park | null;
  onParkSelect: (park: Park) => void;
  userLocation: [number, number] | null;
}

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const ChangeView: React.FC<{ center: [number, number], zoom: number, boundary?: [number, number][] }> = ({ center, zoom, boundary }) => {
  const map = useMap();
  useEffect(() => {
    if (boundary && boundary.length > 0) {
      const bounds = L.latLngBounds(boundary);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, boundary, map]);
  return null;
};

const Map: React.FC<MapProps> = ({ 
  parks, 
  cityBoundary, 
  viewMode, 
  showBikeIsochrones, 
  showWalkIsochrones,
  selectedPark, 
  onParkSelect, 
  userLocation 
}) => {
  const defaultCenter: [number, number] = userLocation || [37.7749, -122.4194]; 
  
  const mapCenter = selectedPark 
    ? [selectedPark.coordinates.lat, selectedPark.coordinates.lng] as [number, number]
    : parks.length > 0 
      ? [parks[0].coordinates.lat, parks[0].coordinates.lng] as [number, number]
      : defaultCenter;

  const tileUrl = viewMode === 'map' 
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const attribution = viewMode === 'map'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community';

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      scrollWheelZoom={true}
      className="w-full h-full"
      zoomControl={false}
    >
      <ChangeView 
        center={mapCenter} 
        zoom={selectedPark ? 15 : 13} 
        boundary={!selectedPark && cityBoundary.length > 0 ? cityBoundary : undefined}
      />
      <TileLayer
        attribution={attribution}
        url={tileUrl}
      />
      
      {userLocation && (
        <CircleMarker 
          center={userLocation}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            weight: 2,
            className: 'user-location-pulse'
          }}
          radius={10}
        >
          <Popup>Current Location</Popup>
        </CircleMarker>
      )}

      {cityBoundary.length > 0 && (
        <Polygon
          positions={cityBoundary}
          pathOptions={{
            color: '#1d4ed8',
            weight: 2,
            fillOpacity: 0.02,
            dashArray: '8, 8'
          }}
        />
      )}

      {parks.map((park) => {
        const scoreColor = getScoreColor(park.score.total);
        const bikeIsochrone = generateIsochrone(park, 'bike');
        const walkIsochrone = generateIsochrone(park, 'walk');

        return (
          <React.Fragment key={park.id}>
            {showBikeIsochrones && (
              <Polygon
                positions={bikeIsochrone}
                pathOptions={{
                  fillColor: scoreColor,
                  fillOpacity: 0.1,
                  color: scoreColor,
                  weight: 1.5,
                  dashArray: '4, 6'
                }}
              />
            )}

            {showWalkIsochrones && (
              <Polygon
                positions={walkIsochrone}
                pathOptions={{
                  fillColor: scoreColor,
                  fillOpacity: 0.25,
                  color: scoreColor,
                  weight: 2,
                }}
              />
            )}
            
            <Marker 
              position={[park.coordinates.lat, park.coordinates.lng]}
              icon={createCustomIcon(scoreColor)}
              eventHandlers={{
                click: () => onParkSelect(park),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[180px]">
                  <h3 className="font-bold text-base leading-tight mb-1 text-blue-900">{park.name}</h3>
                  <p className="text-[10px] text-gray-500 mb-3">{park.address}</p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Healthy Score</span>
                      <span className="text-xl font-black" style={{ color: scoreColor }}>{park.score.total}</span>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md" 
                      style={{ backgroundColor: scoreColor }}
                    />
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default Map;
