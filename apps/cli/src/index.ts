#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import { validate } from "@geofix/core";

const program = new Command();

program
  .name("geofix")
  .description("GeoJSON validator ve yardımcı araçlar")
  .version("0.0.0");

program
  .command("validate")
  .description("Bir GeoJSON dosyasını doğrular")
  .argument("<file>", "doğrulanacak .geojson dosyasının yolu")
  .action(async (file: string) => {
    let content: string;
    try {
      content = await readFile(file, "utf8");
    } catch (e) {
      console.error(`✗ Dosya okunamadı: ${(e as Error).message}`);
      process.exit(1);
    }

    const result = validate(content);

    if (result.valid) {
      console.log(`✓ ${file} geçerli bir GeoJSON.`);
      process.exit(0);
    }

    console.error(`✗ ${file} geçersiz. ${result.errors.length} hata bulundu:\n`);
    for (const err of result.errors) {
      const path = err.path || "(root)";
      console.error(`  • [${path}] ${err.message} (${err.code})`);
    }
    process.exit(1);
  });

program.parse();