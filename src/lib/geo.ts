/**
 * Geospatial operations library.
 * Implements standard earth measurements for exact nautical operations.
 */

// Earth's mean radius in kilometers
const EARTH_RADIUS_KM = 6371

/**
 * Converts decimal degrees to mathematical radians.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculates the exact shortest-path distance over the earth's surface
 * between two lat/lon coordinates using the Haversine formula.
 * 
 * Returns the distance in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0

  const rLat1 = toRadians(lat1)
  const rLat2 = toRadians(lat2)
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}
