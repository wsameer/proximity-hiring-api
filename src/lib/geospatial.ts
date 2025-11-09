/**
 * Geospatial utilities using H3 for privacy zones
 * H3 is Uber's hexagonal hierarchical geospatial indexing system
 */
import { latLngToCell, gridDisk } from "h3-js";

/**
 * H3 Resolution levels:
 * - Resolution 8: ~175m edge, ~0.09 km² area (good for neighborhood privacy)
 * - Resolution 9: ~50m edge, ~0.01 km² area (more precise)
 *
 * For 2km radius matching, we'll use Resolution 8
 */
export const H3_RESOLUTION = 8;
export const PROXIMITY_RADIUS_METERS = 2000; // 2km

/**
 * Convert lat/lng to H3 cell (privacy zone)
 * @param latitude
 * @param longitude
 * @returns H3 cell string
 */
export function latLngToH3Cell(latitude: number, longitude: number): string {
  return latLngToCell(latitude, longitude, H3_RESOLUTION);
}

/**
 * Get neighboring H3 cells within radius
 * Used for proximity matching queries
 * @param h3Cell Center cell
 * @param ringSize Number of rings to expand (1 = immediate neighbors)
 */
export function getNeighboringCells(
  h3Cell: string,
  ringSize: number = 3
): string[] {
  return Array.from(gridDisk(h3Cell, ringSize));
}

/**
 * Calculates the straight-line distance between two geographic points
 * using the Haversine formula.
 *
 * @param latitude1 - First point's latitude in degrees (-90 to 90)
 * @param longitude1 - First point's longitude in degrees (-180 to 180)
 * @param latitude2 - Second point's latitude in degrees (-90 to 90)
 * @param longitude2 - Second point's longitude in degrees (-180 to 180)
 * @returns Distance in meters
 *
 * @example
 * // Distance from New York to London
 * const distance = calculateDistance(40.7128, -74.0060, 51.5074, -0.1278);
 * console.log(distance); // ~5,570,000 meters or ~5,570 km
 */
export function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number {
  // Earth's radius in meters
  const EARTH_RADIUS_METERS = 6371e3;

  // Convert latitude and longitude from degrees to radians
  // (Trigonometric functions require radians, not degrees)
  const lat1Radians = toRadians(latitude1);
  const lat2Radians = toRadians(latitude2);

  // Calculate the differences in latitude and longitude (in radians)
  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);

  // Haversine formula: calculates the angular distance between two points
  // on a sphere given their longitudes and latitudes
  const haversineA =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(lat1Radians) *
      Math.cos(lat2Radians) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  // Convert angular distance to central angle
  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  // Multiply the central angle by Earth's radius to get the distance
  return EARTH_RADIUS_METERS * centralAngle;
}

/**
 * Helper function to convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Check if two points are within proximity radius
 */
export function isWithinProximity(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): boolean {
  return calculateDistance(lat1, lon1, lat2, lon2) <= PROXIMITY_RADIUS_METERS;
}
