import { describe, it, expect } from "vitest";
import { meanCentroid } from "./mean";

describe("meanCentroid", () => {
  it("tek noktanın centroid'i kendisidir", () => {
    expect(meanCentroid({ type: "Point", coordinates: [29, 41] })).toEqual([29, 41]);
  });

  it("iki nokta arasının ortasıdır", () => {
    expect(
      meanCentroid({ type: "LineString", coordinates: [[0, 0], [10, 10]] })
    ).toEqual([5, 5]);
  });

  it("kare poligonda 5 nokta sayılır (kapanış noktası tekrar)", () => {
    const result = meanCentroid({
      type: "Polygon",
      coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
    });
    // (0+10+10+0+0)/5 = 4, (0+0+10+10+0)/5 = 4
    expect(result).toEqual([4, 4]);
  });

  it("FeatureCollection'da null geometrileri atlar", () => {
    const result = meanCentroid({
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: { type: "Point", coordinates: [10, 20] }, properties: null },
        { type: "Feature", geometry: null as any, properties: null },
      ],
    });
    expect(result).toEqual([10, 20]);
  });

  it("boş FeatureCollection için null döner", () => {
    expect(meanCentroid({ type: "FeatureCollection", features: [] })).toBeNull();
  });
});
