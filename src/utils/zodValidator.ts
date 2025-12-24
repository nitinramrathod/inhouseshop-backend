import { ZodSchema } from "zod";

export function validateZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    throw {
      statusCode: 400,
      message: "Validation failed",
      errors,
    };
  }

  return result.data;
}
