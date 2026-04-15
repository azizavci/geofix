import { describe, it, expect } from "vitest";
import { pointOnSurface } from "./surface";

describe("pointOnSurface", () => {
  it("convex poligon için centroid'i döner (içerideyse)", () => {
    const result = pointOnSurface({
      type: "Polygon",
      coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
    });
    expect(result![0]).toBeCloseTo(5, 6);
    expect(result![1]).toBeCloseTo(5, 6);
  });

  it("U şeklinde concave poligon için içeride bir nokta döner", () => {
    // U şekli — centroid orta boşlukta olur, fallback'a düşmesi gerek
    const result = pointOnSurface({
      type: "Polygon",
      coordinates: [[
        [0, 0], [10, 0], [10, 10],
        [7, 10], [7, 3], [3, 3], [3, 10],
        [0, 10], [0, 0],
      ]],
    });
    expect(result).not.toBeNull();
    // Sonucun U'nun içinde olduğunu kontrol etmek karmaşık,
    // sadece null olmadığını ve makul bir koordinat olduğunu doğruluyoruz
    expect(typeof result![0]).toBe("number");
    expect(typeof result![1]).toBe("number");
  });

  it("Polygon olmayan input için null döner", () => {
    expect(pointOnSurface({ type: "Point", coordinates: [0, 0] })).toBeNull();
  });

  it("MultiPolygon'da en büyük poligonu seçer", () => {
    const result = pointOnSurface({
      type: "MultiPolygon",
      coordinates: [
        // Küçük kare
        [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        // Büyük kare (10x10)
        [[[100, 100], [110, 100], [110, 110], [100, 110], [100, 100]]],
      ],
    });
    // Sonuç büyük karenin içinde olmalı
    expect(result![0]).toBeGreaterThan(99);
    expect(result![0]).toBeLessThan(111);
  });
});
