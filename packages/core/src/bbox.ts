import type { GeoJSON, Position, BBox2D } from "@geofix/types";

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

  const update = (pos: Position): void => {
    const [lon, lat] = pos;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    hasAnyPoint = true;
  };

  visitPositions(input, update);

  if (!hasAnyPoint) return null;
  return [minLon, minLat, maxLon, maxLat];
}

/**
 * GeoJSON ağacını dolaşır, her Position için callback çağırır.
 * Recursion yerine type'a göre dal ayırıyor — okunabilir ve tip-güvenli.
 */
function visitPositions(input: GeoJSON, visit: (pos: Position) => void): void {
  switch (input.type) {
    case "Point":
      visit(input.coordinates);
      break;
    case "MultiPoint":
    case "LineString":
      input.coordinates.forEach(visit);
      break;
    case "MultiLineString":
    case "Polygon":
      input.coordinates.forEach((line) => line.forEach(visit));
      break;
    case "MultiPolygon":
      input.coordinates.forEach((polygon) =>
        polygon.forEach((line) => line.forEach(visit))
      );
      break;
    case "Feature":
      if (input.geometry) {
        visitPositions(input.geometry, visit);
      }
      break;
    case "FeatureCollection":
      input.features.forEach((feature) => {
        if (feature.geometry) {
          visitPositions(feature.geometry, visit);
        }
      });
      break;
  }
}