import type { GeoJSON, Position } from "@geofix/types";
import { geometricCentroid } from "./geometric";

/**
 * Point on surface: poligonun içinde garantili olarak yer alan bir nokta döner.
 *
 * Strateji:
 * 1. Önce geometric centroid'i dene
 * 2. Eğer poligonun içindeyse → onu döndür
 * 3. Değilse (concave şekiller) → poligonun ilk köşesini döndür
 *
 * Sadece Polygon ve MultiPolygon için anlamlıdır.
 *
 * NOT: Bu basit bir implementasyondur. Daha gelişmiş "polylabel" algoritması
 * en geniş içsel mesafeye sahip noktayı bulur — etiketleme için ideal.
 * İleride opsiyonel olarak eklenebilir.
 */
export function pointOnSurface(input: GeoJSON): Position | null {
  const polygons = extractPolygons(input);
  if (polygons.length === 0) return null;

  // En büyük poligonu seç (alanı en fazla olan)
  const largestPolygon = polygons.reduce((max, current) =>
    polygonArea(current[0]) > polygonArea(max[0]) ? current : max
  );
  const outerRing = largestPolygon[0];
  if (!outerRing || outerRing.length < 4) return null;

  // Önce geometric centroid'i dene
  const centroid = geometricCentroid({
    type: "Polygon",
    coordinates: largestPolygon,
  });

  if (centroid && pointInRing(centroid, outerRing)) {
    return centroid;
  }

  // Centroid dışarı düştü → fallback: ilk köşe
  return outerRing[0];
}

/**
 * Ray casting algoritması: bir noktanın polygon ring'inin içinde olup
 * olmadığını test eder. Klasik "horizontal ray" yöntemi.
 */
function pointInRing(point: Position, ring: Position[]): boolean {
  const [x, y] = point;
  let inside = false;

  // Ring'in her kenarı için, noktadan sağa giden yatay ışın bu kenarı
  // kaç kez kesiyor? Tek sayı ise içeride, çift ise dışarıda.
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function polygonArea(ring: Position[]): number {
  let area = 0;
  const n = ring.length - 1;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    area += x0 * y1 - x1 * y0;
  }
  return Math.abs(area / 2);
}

function extractPolygons(input: GeoJSON): Position[][][] {
  const polygons: Position[][][] = [];
  switch (input.type) {
    case "Polygon":
      polygons.push(input.coordinates);
      break;
    case "MultiPolygon":
      polygons.push(...input.coordinates);
      break;
    case "Feature":
      if (input.geometry) polygons.push(...extractPolygons(input.geometry));
      break;
    case "FeatureCollection":
      for (const f of input.features) {
        if (f.geometry) polygons.push(...extractPolygons(f.geometry));
      }
      break;
  }
  return polygons;
}
