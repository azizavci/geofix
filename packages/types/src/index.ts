// GeoJSON spec tipleri (RFC 7946) - re-export
export type {
  Position,
  Geometry,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  GeometryCollection,
  Feature,
  FeatureCollection,
  GeoJSON,
  GeoJsonProperties,
} from "geojson";


// Bizim kendi domain tiplerimiz
export interface ValidationError {
  path: string;       // hatanın olduğu yol, örn: "features[0].geometry.coordinates"
  message: string;    // insan-okur mesaj
  code: string;       // makine-okur kod, örn: "invalid_type"
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}