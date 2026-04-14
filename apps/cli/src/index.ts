#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import pc from "picocolors";
import { glob } from "tinyglobby";
import { validate,bbox } from "@geofix/core";
import type { ValidationResult } from "@geofix/types";

const program = new Command();

program
  .name("geofix")
  .description("GeoJSON validator ve yardımcı araçlar")
  .version("1.0.0");

interface FileResult extends ValidationResult {
  file: string;
}

async function validateFile(file: string): Promise<FileResult> {
  try {
    const content = await readFile(file, "utf8");
    return { file, ...validate(content) };
  } catch (e) {
    return {
      file,
      valid: false,
      errors: [{ path: "", message: (e as Error).message, code: "file_error" }],
    };
  }
}

function printHumanResult(result: FileResult): void {
  if (result.valid) {
    console.log(`${pc.green("✓")} ${pc.bold(result.file)} ${pc.green("geçerli")}`);
    return;
  }

  console.error(
    `${pc.red("✗")} ${pc.bold(result.file)} ${pc.red("geçersiz")} ${pc.dim(`(${result.errors.length} hata)`)}`
  );
  for (const err of result.errors) {
    const path = err.path || "(root)";
    console.error(
      `  ${pc.red("•")} ${pc.cyan(`[${path}]`)} ${err.message} ${pc.dim(`(${err.code})`)}`
    );
  }
}

program
  .command("validate")
  .description("Bir veya birden fazla GeoJSON dosyasını doğrular")
  .argument("<files...>", "doğrulanacak dosya yolları veya glob pattern'ları")
  .option("--json", "çıktıyı JSON formatında ver")
  .action(async (patterns: string[], options: { json?: boolean }) => {
    // Glob pattern'larını gerçek dosyalara çevir
    const files = await glob(patterns, { absolute: false });

    if (files.length === 0) {
      if (options.json) {
        console.log(JSON.stringify({ error: "Eşleşen dosya bulunamadı", patterns }));
      } else {
        console.error(pc.yellow(`⚠ Eşleşen dosya bulunamadı: ${patterns.join(", ")}`));
      }
      process.exit(1);
    }

    const results = await Promise.all(files.map(validateFile));

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      for (const result of results) {
        printHumanResult(result);
      }

      // Özet
      const validCount = results.filter((r) => r.valid).length;
      const invalidCount = results.length - validCount;

      console.log(
        "\n" +
          pc.bold("Özet: ") +
          pc.green(`${validCount} geçerli`) +
          (invalidCount > 0 ? ", " + pc.red(`${invalidCount} geçersiz`) : "")
      );
    }

    // En az bir dosya geçersizse non-zero exit code
    const anyInvalid = results.some((r) => !r.valid);
    process.exit(anyInvalid ? 1 : 0);
  });


program
  .command("bbox")
  .description("Bir GeoJSON dosyasının bounding box'ını hesaplar")
  .argument("<file>", "GeoJSON dosya yolu")
  .option("--json", "çıktıyı JSON formatında ver")
  .action(async (file: string, options: { json?: boolean }) => {
    let content: string;
    try {
      content = await readFile(file, "utf8");
    } catch (e) {
      console.error(pc.red(`✗ Dosya okunamadı: ${(e as Error).message}`));
      process.exit(1);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error(pc.red(`✗ Geçersiz JSON: ${(e as Error).message}`));
      process.exit(1);
    }

    // Önce validate et
    const validation = validate(parsed);
    if (!validation.valid) {
      console.error(pc.red(`✗ ${file} geçerli bir GeoJSON değil. Önce "validate" komutuyla kontrol edin.`));
      process.exit(1);
    }

    const result = bbox(parsed as Parameters<typeof bbox>[0]);

    if (result === null) {
      if (options.json) {
        console.log(JSON.stringify({ file, bbox: null }));
      } else {
        console.error(pc.yellow(`⚠ ${file} için bbox hesaplanamadı (boş geometri)`));
      }
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify({ file, bbox: result }, null, 2));
    } else {
      const [minLon, minLat, maxLon, maxLat] = result;
      console.log(pc.bold(`${file} bounding box:`));
      console.log(`  ${pc.cyan("minLon")} ${minLon}`);
      console.log(`  ${pc.cyan("minLat")} ${minLat}`);
      console.log(`  ${pc.cyan("maxLon")} ${maxLon}`);
      console.log(`  ${pc.cyan("maxLat")} ${maxLat}`);
      console.log(pc.dim(`\n  [${minLon}, ${minLat}, ${maxLon}, ${maxLat}]`));
    }
  });


  program.parse();
