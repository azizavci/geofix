// GEOJSON STANDART : https://datatracker.ietf.org/doc/html/rfc7946
// COORDINATE ORDER : [longitude, latitude] (RFC 7946)
// COORDINATE RANGES : longitude [-180, 180], latitude [-90, 90] (RFC 7946)
// COORDINATE DIMENSIONS : 2D (lon, lat) veya 3D (lon, lat, elevation) (RFC 7946)
// COORDINATE SYSTEM : WGS 84 (EPSG:4326) (RFC 7946)

import { z } from "zod";

// Position: [lon, lat] veya [lon, lat, elevation]
export const PositionSchema = z
  .tuple([
    z
      .number()
      .min(-180, { message: "Boylam -180 ile 180 arasında olmalıdır" })
      .max(180, { message: "Boylam -180 ile 180 arasında olmalıdır" }),
    z
      .number()
      .min(-90, { message: "Enlem -90 ile 90 arasında olmalıdır" })
      .max(90, { message: "Enlem -90 ile 90 arasında olmalıdır" }),
  ])
  .rest(z.number());

// Geometry tipleri
export const PointSchema = z.object({
  type: z.literal("Point"),
  coordinates: PositionSchema,
});

export const MultiPointSchema = z.object({
  type: z.literal("MultiPoint"),
  coordinates: z.array(PositionSchema),
});

export const LineStringSchema = z.object({
  type: z.literal("LineString"),
  coordinates: z
    .array(PositionSchema)
    .min(2, { message: "LineString en az 2 nokta içermelidir" }),
});

export const MultiLineStringSchema = z.object({
  type: z.literal("MultiLineString"),
  coordinates: z.array(
    z
      .array(PositionSchema)
      .min(2, { message: "LineString en az 2 nokta içermelidir" }),
  ),
});

// Polygon: linear ring -> en az 4 nokta, ilk ve son aynı (RFC 7946)
export const LinearRingSchema = z
  .array(PositionSchema)
  .min(4, {
    message: "Polygon halkası en az 4 nokta içermeli (ilk ve son aynı olmalı)",
  })
  .refine(
    (ring) => {
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (!first || !last) return false;
      return first[0] === last[0] && first[1] === last[1];
    },
    { message: "Polygon halkası kapalı olmalı (ilk ve son nokta aynı)" },
  );

export const PolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(LinearRingSchema),
});

export const MultiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(LinearRingSchema)),
});

export const GeometrySchema = z.discriminatedUnion("type", [
  PointSchema,
  MultiPointSchema,
  LineStringSchema,
  MultiLineStringSchema,
  PolygonSchema,
  MultiPolygonSchema,
]);

// Feature
export const FeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: GeometrySchema.nullable(),
  properties: z.record(z.string(), z.unknown()).nullable(),
  id: z.union([z.string(), z.number()]).optional(),
});

// FeatureCollection
export const FeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(FeatureSchema),
});

// Top-level: bir GeoJSON dosyası şunlardan biri olabilir
export const GeoJSONSchema = z.discriminatedUnion("type", [
  PointSchema,
  MultiPointSchema,
  LineStringSchema,
  MultiLineStringSchema,
  PolygonSchema,
  MultiPolygonSchema,
  FeatureSchema,
  FeatureCollectionSchema,
]);
