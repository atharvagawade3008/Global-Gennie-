// Geolocation, Haversine Distance & Geofencing Utilities

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance in meters or kilometers
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Check if a coordinate is inside a circular safety zone
 */
export function isPointInsideZone(point: Coordinates, zoneCenter: Coordinates, radiusMeters: number): boolean {
  const dist = calculateDistanceMeters(point, zoneCenter);
  return dist <= radiusMeters;
}

/**
 * Default fallback coordinates: Navi Mumbai Tourist & City Center
 */
export const DEFAULT_LOCATION: Coordinates = {
  lat: 19.0330,
  lng: 73.0297,
};
