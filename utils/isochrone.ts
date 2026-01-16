
import { Park } from '../types';

/**
 * Generates an approximated isochrone for biking or walking.
 * Average bike speed ~15km/h -> 2.5km radius in 10 mins.
 * Average walk speed ~5km/h -> 0.83km radius in 10 mins.
 */
export const generateIsochrone = (park: Park, mode: 'bike' | 'walk' = 'bike'): [number, number][] => {
  const { lat, lng } = park.coordinates;
  const numPoints = 16;
  const baseRadiusKm = mode === 'bike' ? 2.5 : 0.83; 
  
  // Warp factor based on connectivity score (0-25)
  // Higher connectivity = more "even" and slightly larger reach
  const warpStrength = 0.15 + (1 - park.score.connectivity / 25) * 0.2;
  
  const points: [number, number][] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // Jitter the radius to look like road networks
    const jitter = 1 + (Math.random() - 0.5) * warpStrength;
    const distanceKm = baseRadiusKm * jitter;
    
    // Degrees approximation: 1 degree latitude ~= 111km
    const dLat = (distanceKm / 111) * Math.cos(angle);
    const dLng = (distanceKm / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
    
    points.push([lat + dLat, lng + dLng]);
  }
  
  // Close the polygon
  points.push(points[0]);
  
  return points;
};

/**
 * Returns a hex color on a gradient from Orange (0) to Green (100)
 */
export const getScoreColor = (score: number) => {
  const r1 = 249, g1 = 115, b1 = 22; // Orange
  const r2 = 34, g2 = 197, b2 = 94;  // Green
  
  const ratio = Math.min(100, Math.max(0, score)) / 100;
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
};
