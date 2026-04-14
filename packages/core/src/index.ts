import { GeoJSONSchema } from "@geofix/schemas";
import type { ValidationError, ValidationResult } from "@geofix/types";
import { ZodError } from "zod";

/**
 * Bir değerin geçerli GeoJSON olup olmadığını doğrular.
 * String verilirse önce JSON.parse dener.
 */
export function validate(input: unknown): ValidationResult {
  // String ise parse etmeyi dene
  let parsed: unknown = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch (e) {
      return {
        valid: false,
        errors: [
          {
            path: "",
            message: `Geçersiz JSON: ${(e as Error).message}`,
            code: "invalid_json",
          },
        ],
      };
    }
  }

  const result = GeoJSONSchema.safeParse(parsed);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  return {
    valid: false,
    errors: zodErrorsToValidationErrors(result.error),
  };
}

function zodErrorsToValidationErrors(error: ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

export { bbox } from "./bbox";