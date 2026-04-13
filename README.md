# geofix

RFC 7946 standardına göre GeoJSON dosyalarını doğrulayan CLI aracı.

## Kurulum

```bash
pnpm install
pnpm build
```

## Kullanım

```bash
# Bir GeoJSON dosyasını doğrula
geofix validate examples/valid-point.geojson

# Geçerli dosya
✓ examples/valid-point.geojson geçerli bir GeoJSON.

# Geçersiz dosya
✗ examples/invalid-point.geojson geçersiz. 1 hata bulundu:

  • [coordinates.1] Number must be less than or equal to 90 (too_big)
```

## Desteklenen GeoJSON Tipleri

- `Point`, `MultiPoint`
- `LineString`, `MultiLineString`
- `Polygon`, `MultiPolygon`
- `Feature`, `FeatureCollection`

## Paket Yapısı

```
geofix/
├── apps/
│   └── cli/          # CLI uygulaması (@geofix/cli)
├── packages/
│   ├── core/         # Doğrulama mantığı (@geofix/core)
│   ├── schemas/      # Zod şemaları (@geofix/schemas)
│   └── types/        # TypeScript tipleri (@geofix/types)
└── examples/         # Örnek GeoJSON dosyaları
```

## Geliştirme

```bash
pnpm typecheck   # Tip kontrolü
pnpm build       # Tüm paketleri derle
pnpm dev         # Geliştirme modunda çalıştır
```

## Standart

[RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946) — koordinat sırası `[longitude, latitude]`, koordinat sistemi WGS 84 (EPSG:4326).
