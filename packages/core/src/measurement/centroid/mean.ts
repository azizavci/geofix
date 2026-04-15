import type { GeoJSON, Position } from "@geofix/types";
import { visitPositions } from "../../_internal/visit";

/**
 * Mean centroid: tüm noktaların aritmetik ortalaması.
 *
 * Hızlı ve basit. Nokta yoğunluğundan etkilenir — bir kenar çok detaylı
 * modellenmişse sonuç o kenara doğru kayar.
 *
 * Tüm geometri tipleri için çalışır.
 */
export function meanCentroid(input: GeoJSON): Position | null {
  let sumLon = 0;
  let sumLat = 0;
  let count = 0;

  visitPositions(input, ([lon, lat]) => {
    sumLon += lon;
    sumLat += lat;
    count++;
  });

  if (count === 0) return null;
  return [sumLon / count, sumLat / count];
}
