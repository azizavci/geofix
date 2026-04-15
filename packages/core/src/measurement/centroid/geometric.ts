import type { GeoJSON, Position } from "@geofix/types";

/**
 * Geometric centroid: alan-ağırlıklı gerçek ağırlık merkezi.
 *
 * Shoelace formülü ile hesaplanır. Sadece Polygon ve MultiPolygon için
 * anlamlıdır — Point/LineString'in alanı yoktur.
 *
 * Avantajı: nokta yoğunluğundan etkilenmez, fiziksel anlamı vardır.
 * Dikkat: concave (içbükey) poligonlarda dışarı düşebilir.
 */
export function geometricCentroid(input: GeoJSON): Position | null {
  const polygons = extractPolygons(input);
  if (polygons.length === 0) return null;

  let totalArea = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (const rings of polygons) {
    // Polygon: ilk ring dış sınır, sonrakiler delik (hole)
    // İlk iterasyonda delikleri çıkarmıyoruz, sadece dış sınırı kullanıyoruz
    const outerRing = rings[0];
    if (!outerRing) continue;

    const { area, cx, cy } = ringCentroid(outerRing);

    // İmzalı alanın işareti winding order'a bağlı, biz mutlak alanla ağırlıklandırıyoruz
    const absArea = Math.abs(area);
    totalArea += absArea;
    weightedX += cx * absArea;
    weightedY += cy * absArea;
  }

  if (totalArea === 0) return null;
  return [weightedX / totalArea, weightedY / totalArea];
}

/**
 * Bir linear ring'in imzalı alanını ve centroid'ini hesaplar.
 * Shoelace formülü.
 */
function ringCentroid(ring: Position[]): { area: number; cx: number; cy: number } {
  let area = 0;
  let cx = 0;
  let cy = 0;

  // Son nokta ile ilk nokta aynı (kapalı halka), o yüzden length-1'e kadar gidiyoruz
  const n = ring.length - 1;

  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];

    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }

  area /= 2;
  cx /= 6 * area;
  cy /= 6 * area;

  return { area, cx, cy };
}

/**
 * Bir GeoJSON nesnesinden tüm polygon ring listelerini çıkarır.
 * Her polygon, ring listesi olarak gelir (ilk ring dış sınır).
 */
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
      if (input.geometry) {
        polygons.push(...extractPolygons(input.geometry));
      }
      break;
    case "FeatureCollection":
      for (const f of input.features) {
        if (f.geometry) polygons.push(...extractPolygons(f.geometry));
      }
      break;
    // Point, LineString, MultiPoint, MultiLineString — alanı yok, atla
  }

  return polygons;
}
