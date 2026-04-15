import { describe, it, expect } from "vitest";
import { geometricCentroid } from "./geometric";

describe("geometricCentroid", () => {
  it("kare poligonun gerçek merkezi", () => {
    const result = geometricCentroid({
      type: "Polygon",
      coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
    });
    // Karenin merkezi tam ortası — mean ile farklı (mean: [4, 4])
    expect(result![0]).toBeCloseTo(5, 6);
    expect(result![1]).toBeCloseTo(5, 6);
  });

  it("üçgenin centroid'i", () => {
    const result = geometricCentroid({
      type: "Polygon",
      coordinates: [[[0, 0], [10, 0], [5, 10], [0, 0]]],
    });
    // Üçgenin centroid'i = (köşelerin ortalaması)
    expect(result![0]).toBeCloseTo(5, 6);
    expect(result![1]).toBeCloseTo(10 / 3, 6);
  });

  it("nokta yoğunluğundan etkilenmez", () => {
    // Aynı kare, ama bir kenarda fazladan nokta var
    const result = geometricCentroid({
      type: "Polygon",
      coordinates: [[
        [0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [10, 0],  // alt kenarda fazla nokta
        [10, 10], [0, 10], [0, 0],
      ]],
    });
    // Mean burada [3.33, 2.5] gibi sapardı, geometric hala [5, 5]'e yakın
    expect(result![0]).toBeCloseTo(5, 1);
    expect(result![1]).toBeCloseTo(5, 1);
  });

  it("MultiPolygon'da iki kareyi alan-ağırlıklı birleştirir", () => {
    const result = geometricCentroid({
      type: "MultiPolygon",
      coordinates: [
        [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],     // merkez (5, 5), alan 100
        [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]], // merkez (25, 25), alan 100
      ],
    });
    // Eşit alanlı iki karenin ortak merkezi: (15, 15)
    expect(result![0]).toBeCloseTo(15, 6);
    expect(result![1]).toBeCloseTo(15, 6);
  });

  it("Polygon olmayan input için null döner", () => {
    expect(geometricCentroid({ type: "Point", coordinates: [29, 41] })).toBeNull();
    expect(
      geometricCentroid({ type: "LineString", coordinates: [[0, 0], [1, 1]] })
    ).toBeNull();
  });

  it("boş FeatureCollection için null döner", () => {
    expect(geometricCentroid({ type: "FeatureCollection", features: [] })).toBeNull();
  });
});
