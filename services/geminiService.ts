
import { GoogleGenAI } from "@google/genai";
import { Park, ParkScore, ParkSearchResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchAndScoreParks = async (city: string, userLocation?: [number, number]): Promise<ParkSearchResponse> => {
  // We use a detailed system-style instruction inside the prompt to guide the model.
  const prompt = `
    ACT AS A SENIOR URBAN PLANNING ANALYST FOR THE NATIONAL FITNESS CAMPAIGN.
    
    TASK:
    1. Identify the official city boundaries for "${city}".
    2. Find ALL significant public parks within these boundaries using Google Maps.
    3. Calculate a "Healthy Site Score" (0-100) for EACH park based on these criteria:
       - Connectivity (0-25): Access to sidewalks, bike lanes, and transit.
       - Amenities (0-30): Presence of courts, trails, playgrounds, or fitness equipment.
       - Reviews (0-25): Public sentiment and maintenance ratings.
       - Visibility (0-20): Proximity to roads and clear sightlines for safety.
    
    OUTPUT FORMAT:
    You MUST return a VALID JSON object. No conversational text.
    Structure:
    {
      "boundary": [{"lat": latitude, "lng": longitude}, ...],
      "parks": [
        {
          "name": "Full Park Name",
          "address": "Street Address, City, State",
          "lat": latitude,
          "lng": longitude,
          "amenities": ["List of strings"],
          "scoring": {
            "connectivity": number,
            "amenities": number,
            "reviews": number,
            "visibility": number
          }
        }
      ]
    }
  `;

  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
      // Use systemInstruction for better control in 2.5
      systemInstruction: "You are a professional geographic data analyst. You provide structured JSON data about urban parks and their health-oriented accessibility metrics. You never return scores as 0 unless a site is completely inaccessible.",
    };

    if (userLocation) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation[0],
            longitude: userLocation[1]
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config,
    });

    const text = response.text || "";
    // Robust extraction of JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in model response");
    }
    
    const rawData = JSON.parse(jsonMatch[0].trim());
    
    if (!rawData.parks || !Array.isArray(rawData.parks)) {
      throw new Error("Invalid park data structure returned");
    }

    const parks: Park[] = rawData.parks.map((item: any, index: number) => {
      // Ensure we have numbers and handle different key names the model might hallucinate
      const s = item.scoring || {};
      const c = Number(s.connectivity) || 15; // Realistic default if missing
      const a = Number(s.amenities || s.recreation) || 15;
      const r = Number(s.reviews) || 15;
      const v = Number(s.visibility) || 10;

      const score: ParkScore = {
        connectivity: c,
        amenities: a,
        reviews: r,
        visibility: v,
        total: c + a + r + v
      };

      return {
        id: `park-${index}-${Date.now()}`,
        name: item.name || "Unnamed Park",
        address: item.address || "Address not found",
        coordinates: { 
          lat: Number(item.lat) || 0, 
          lng: Number(item.lng) || 0 
        },
        score,
        amenitiesList: Array.isArray(item.amenities) ? item.amenities : [],
        isFavorite: false
      };
    }).filter((p: Park) => p.coordinates.lat !== 0) // Filter out bad geo-data
      .sort((a: Park, b: Park) => b.score.total - a.score.total);

    const cityBoundary: [number, number][] = (rawData.boundary || []).map((b: any) => [
      Number(b.lat || b.latitude), 
      Number(b.lng || b.longitude)
    ]);

    return { parks, cityBoundary };

  } catch (error) {
    console.error("Error in searchAndScoreParks:", error);
    throw error;
  }
};
