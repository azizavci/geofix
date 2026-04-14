import { describe, it, expect } from "vitest";
import { validate } from "./index";

describe("validate", () => {
  describe("geçerli GeoJSON", () => {
    it("basit bir Point'i kabul eder", () => {
      const input = {
        type: "Point",
        coordinates: [29.0, 41.0],
      };
      const result = validate(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("Point'i 3 boyutlu (yükseklikli) kabul eder", () => {
      const input = {
        type: "Point",
        coordinates: [29.0, 41.0, 100],
      };
      expect(validate(input).valid).toBe(true);
    });

    it("bir Feature'ı kabul eder", () => {
      const input = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [29, 41] },
        properties: { name: "İstanbul" },
      };
      expect(validate(input).valid).toBe(true);
    });

    it("boş bir FeatureCollection'ı kabul eder", () => {
      const input = {
        type: "FeatureCollection",
        features: [],
      };
      expect(validate(input).valid).toBe(true);
    });

    it("JSON string girdisini parse edip doğrular", () => {
      const input = JSON.stringify({
        type: "Point",
        coordinates: [29, 40],
      });
      expect(validate(input).valid).toBe(true);
    });
  });

  describe("geçersiz GeoJSON", () => {
    it("coordinates olmayan Point'i reddeder", () => {
      const input = { type: "Point" };
      const result = validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("Polygon'da ring 4'ten az nokta içeriyorsa reddeder", () => {
      const input = {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [0, 0]]],
      };
      expect(validate(input).valid).toBe(false);
    });

    it("bilinmeyen type'ı reddeder", () => {
      const input = { type: "Banana", coordinates: [0, 0] };
      expect(validate(input).valid).toBe(false);
    });

    it("geçersiz JSON string için invalid_json hatası döner", () => {
      const result = validate("{ geçersiz json ");
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe("invalid_json");
    });

    it("LineString'de en az 2 nokta ister", () => {
      const input = {
        type: "LineString",
        coordinates: [[0, 0]],
      };
      expect(validate(input).valid).toBe(false);
    });
  });

  describe("hata detayları", () => {
    it("hata için path bilgisi döner", () => {
      const input = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point" }, // coordinates eksik
            properties: null,
          },
        ],
      };
      const result = validate(input);
      expect(result.valid).toBe(false);
      // path "features.0.geometry.coordinates" gibi bir şey olmalı
      expect(result.errors.some((e) => e.path.includes("coordinates"))).toBe(true);
    });
  });
});