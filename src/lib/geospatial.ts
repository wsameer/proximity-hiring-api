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
export function getNeighboringCells(h3Cell: string, ringSize: number = 3): string[] {
  return Array.from(gridDisk(h3Cell, ringSize));
}

/**
 * Calculate distance between two lat/lng points (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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
