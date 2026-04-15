import { describe, it, expect } from "vitest";
import { bbox } from "./bbox";

describe("bbox", () => {
  describe("Point", () => {
    it("tek noktanın bbox'ı o noktanın kendisidir", () => {
      const result = bbox({ type: "Point", coordinates: [29, 41] });
      expect(result).toEqual([29, 41, 29, 41]);
    });

    it("negatif koordinatlarla çalışır", () => {
      const result = bbox({ type: "Point", coordinates: [-73.5, 40.7] });
      expect(result).toEqual([-73.5, 40.7, -73.5, 40.7]);
    });
  });

  describe("LineString", () => {
    it("iki noktalı LineString", () => {
      const result = bbox({
        type: "LineString",
        coordinates: [
          [29, 41],
          [30, 42],
        ],
      });
      expect(result).toEqual([29, 41, 30, 42]);
    });

    it("birden fazla nokta arasında doğru min/max bulur", () => {
      const result = bbox({
        type: "LineString",
        coordinates: [
          [29, 41],
          [25, 45],
          [35, 38],
          [30, 42],
        ],
      });
      expect(result).toEqual([25, 38, 35, 45]);
    });
  });

  describe("Polygon", () => {
    it("kapalı halkanın bbox'ını hesaplar", () => {
      const result = bbox({
        type: "Polygon",
        coordinates: [
          [
            [28, 40],
            [30, 41],
            [29, 42],
            [27, 41],
            [28, 40],
          ],
        ],
      });
      expect(result).toEqual([27, 40, 30, 42]);
    });
  });

  describe("MultiPoint / MultiLineString / MultiPolygon", () => {
    it("MultiPoint", () => {
      const result = bbox({
        type: "MultiPoint",
        coordinates: [
          [29, 41],
          [30, 42],
          [28, 40],
        ],
      });
      expect(result).toEqual([28, 40, 30, 42]);
    });

    it("MultiPolygon", () => {
      const result = bbox({
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
          [
            [
              [10, 10],
              [11, 10],
              [11, 11],
              [10, 11],
              [10, 10],
            ],
          ],
        ],
      });
      expect(result).toEqual([0, 0, 11, 11]);
    });
  });

  describe("Feature ve FeatureCollection", () => {
    it("Feature'ın geometrisinden hesaplar", () => {
      const result = bbox({
        type: "Feature",
        geometry: { type: "Point", coordinates: [29, 41] },
        properties: null,
      });
      expect(result).toEqual([29, 41, 29, 41]);
    });

    it("FeatureCollection'daki tüm feature'ları birleştirir", () => {
      const result = bbox({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [29, 41] },
            properties: null,
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [35, 38] },
            properties: null,
          },
        ],
      });
      expect(result).toEqual([29, 38, 35, 41]);
    });

    it("geometrisi null olan Feature'ı atlar", () => {
      const result = bbox({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [29, 41] },
            properties: null,
          },
          {
            type: "Feature",
            geometry: null as any,
            properties: null,
          },
        ],
      });
      expect(result).toEqual([29, 41, 29, 41]);
    });
  });

  describe("hata durumları", () => {
    it("boş FeatureCollection için null döner", () => {
      expect(bbox({ type: "FeatureCollection", features: [] })).toBeNull();
    });

    it("tüm feature'ları null geometri olan FeatureCollection için null döner", () => {
      const result = bbox({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: null as any, properties: null }],
      });
      expect(result).toBeNull();
    });
  });
});
