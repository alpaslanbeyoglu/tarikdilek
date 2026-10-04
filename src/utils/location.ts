/**
 * Location and Distance Utilities for Tarık Dilek Barbershop
 * Address: Göktürk Caddesi No:47, Eyüp / İstanbul
 */

export const SHOP_COORDINATES = {
  lat: 41.1825,
  lng: 28.8935,
  address: 'Göktürk Caddesi No:47 C, Eyüp / İstanbul',
  placeName: 'Tarık Dilek Erkek Kuaförü',
};

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number = SHOP_COORDINATES.lat,
  lon2: number = SHOP_COORDINATES.lng
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance nicely: "850 m" or "4.2 km"
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} metre`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Estimate travel duration
export function estimateTravelTime(distanceKm: number): {
  driveMinutes: number;
  walkMinutes: number;
} {
  // Approximate urban traffic speed ~30 km/h + 2 mins parking
  const driveMinutes = Math.max(2, Math.round((distanceKm / 30) * 60) + 2);
  // Average walking speed ~4.5 km/h
  const walkMinutes = Math.round((distanceKm / 4.5) * 60);
  return { driveMinutes, walkMinutes };
}

// Generate Google Maps Directions URL
export function getGoogleMapsDirectionsUrl(
  userLat?: number,
  userLng?: number
): string {
  const destEncoded = encodeURIComponent('Göktürk Caddesi No:47, Eyüpsultan, İstanbul');
  if (userLat && userLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destEncoded}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destEncoded}`;
}

// Generate Apple Maps URL for iPhone users
export function getAppleMapsDirectionsUrl(
  userLat?: number,
  userLng?: number
): string {
  const destEncoded = encodeURIComponent('Göktürk Caddesi No:47, Eyüpsultan, İstanbul');
  if (userLat && userLng) {
    return `https://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${destEncoded}&dirflg=d`;
  }
  return `https://maps.apple.com/?daddr=${destEncoded}&dirflg=d`;
}

// Universal navigation link (picks Google / Apple maps based on device)
export function getDirectionsUrl(userLat?: number, userLng?: number): string {
  if (typeof navigator !== 'undefined') {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    if (isIOS) {
      return getAppleMapsDirectionsUrl(userLat, userLng);
    }
  }
  return getGoogleMapsDirectionsUrl(userLat, userLng);
}
