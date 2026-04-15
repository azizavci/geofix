import type { GeoJSON, Position, BBox2D } from "@geofix/types";
import { visitPositions } from "../../_internal/visit";

/**
 * Bir GeoJSON nesnesinin 2D bounding box'ını hesaplar.
 * Boş collection veya geometrisi olmayan input için null döner.
 */
export function bbox(input: GeoJSON): BBox2D | null {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  let hasAnyPoint = false;

  visitPositions(input, (pos: Position) => {
    const [lon, lat] = pos;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    hasAnyPoint = true;
  });

  if (!hasAnyPoint) return null;
  return [minLon, minLat, maxLon, maxLat];
}
