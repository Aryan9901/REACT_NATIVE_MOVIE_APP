// Distance calculation utilities using Google Maps Distance Matrix API

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface DistanceResult {
  distance: string; // e.g., "5.2 km"
  distanceValue: number; // in meters
  duration: string; // e.g., "15 mins"
  durationValue: number; // in seconds
}

/**
 * Calculate distance between user location and vendor using Google Maps Distance Matrix API
 */
export async function calculateDistance(
  userLat: number,
  userLng: number,
  vendorLat: number,
  vendorLng: number
): Promise<DistanceResult | null> {
  try {
    const origin = `${userLat},${userLng}`;
    const destination = `${vendorLat},${vendorLng}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.rows[0]?.elements[0]?.status === "OK") {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance.text,
        distanceValue: element.distance.value,
        duration: element.duration.text,
        durationValue: element.duration.value,
      };
    }

    // Fallback to Haversine formula if API fails
    return calculateHaversineDistance(userLat, userLng, vendorLat, vendorLng);
  } catch (error) {
    console.error("Error calculating distance:", error);
    // Fallback to Haversine formula
    return calculateHaversineDistance(userLat, userLng, vendorLat, vendorLng);
  }
}

/**
 * Fallback: Calculate distance using Haversine formula
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceResult {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMeters = distanceKm * 1000;

  // Estimate duration (assuming 30 km/h average speed)
  const durationMinutes = Math.round((distanceKm / 30) * 60);

  return {
    distance:
      distanceKm < 1
        ? `${Math.round(distanceMeters)} m`
        : `${distanceKm.toFixed(1)} km`,
    distanceValue: distanceMeters,
    duration: `${durationMinutes} min${durationMinutes !== 1 ? "s" : ""}`,
    durationValue: durationMinutes * 60,
  };
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Batch calculate distances for multiple vendors
 */
export async function calculateDistancesForVendors(
  userLat: number,
  userLng: number,
  vendors: any[]
): Promise<Map<string, DistanceResult>> {
  const distanceMap = new Map<string, DistanceResult>();

  // Process vendors in parallel with a limit to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < vendors.length; i += batchSize) {
    const batch = vendors.slice(i, i + batchSize);
    const promises = batch.map(async (vendor) => {
      if (vendor.address?.latitude && vendor.address?.longitude) {
        const result = await calculateDistance(
          userLat,
          userLng,
          vendor.address.latitude,
          vendor.address.longitude
        );
        if (result) {
          distanceMap.set(vendor.id, result);
        }
      }
    });

    await Promise.all(promises);
  }

  return distanceMap;
}
