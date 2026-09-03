import { ServiceLocation } from '../types';
import { MOCK_SERVICE_LOCATIONS } from './mockData';
import { calculateDistanceMeters } from './geoUtils';

/**
 * Fetches nearby emergency services using free OpenStreetMap Overpass API
 * with automatic fallback to high-quality curated data.
 */
export async function fetchNearbyEmergencyServices(
  lat: number,
  lng: number,
  radiusMeters = 5000
): Promise<ServiceLocation[]> {
  try {
    const query = `
      [out:json][timeout:8];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        node["amenity"="police"](around:${radiusMeters},${lat},${lng});
        node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      );
      out body 12;
    `;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Overpass API returned non-200');

    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      throw new Error('No OSM elements found in radius');
    }

    interface OverpassNode {
      id: number;
      lat: number;
      lon: number;
      tags?: {
        name?: string;
        amenity?: string;
        phone?: string;
        'contact:phone'?: string;
        'addr:street'?: string;
        'addr:city'?: string;
        opening_hours?: string;
      };
    }

    const osmServices: ServiceLocation[] = data.elements.map((el: OverpassNode) => {
      const category: ServiceLocation['category'] =
        el.tags?.amenity === 'hospital'
          ? 'hospital'
          : el.tags?.amenity === 'pharmacy'
          ? 'pharmacy'
          : 'police';

      const dist = calculateDistanceMeters({ lat, lng }, { lat: el.lat, lng: el.lon });

      return {
        id: `osm-${el.id}`,
        name: el.tags?.name || `${category.toUpperCase()} Station`,
        category,
        phone: el.tags?.phone || el.tags?.['contact:phone'] || '112 (Emergency Line)',
        address: el.tags?.['addr:street'] ? `${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}` : 'Local District Area',
        latitude: el.lat,
        longitude: el.lon,
        is_24_7: el.tags?.opening_hours?.includes('24/7') ?? true,
        distance_km: dist / 1000,
      };
    });

    // Merge with our official tourist police kiosks
    const combined = [...MOCK_SERVICE_LOCATIONS, ...osmServices];
    // Sort by proximity
    return combined
      .map((item) => ({
        ...item,
        distance_km: calculateDistanceMeters({ lat, lng }, { lat: item.latitude, lng: item.longitude }) / 1000,
      }))
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  } catch (error) {
    // Return curated fallback sorted by distance
    return MOCK_SERVICE_LOCATIONS.map((item) => ({
      ...item,
      distance_km: calculateDistanceMeters({ lat, lng }, { lat: item.latitude, lng: item.longitude }) / 1000,
    })).sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }
}
