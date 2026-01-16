
export interface ParkScore {
  connectivity: number; // 0-25
  amenities: number;    // 0-30
  reviews: number;      // 0-25
  visibility: number;   // 0-20
  total: number;        // 0-100
}

export interface Park {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  score: ParkScore;
  amenitiesList: string[];
  isFavorite: boolean;
}

export interface ParkSearchResponse {
  parks: Park[];
  cityBoundary: [number, number][];
}

export type MapViewMode = 'map' | 'aerial';
