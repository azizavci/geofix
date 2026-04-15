import type { GeoJSON, Position } from "@geofix/types";

/**
 * GeoJSON ağacını dolaşır, her Position için callback çağırır.
 * bbox, centroid gibi koordinat-tabanlı fonksiyonlar tarafından kullanılır.
 */
export function visitPositions(
  input: GeoJSON,
  visit: (pos: Position) => void
): void {
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
