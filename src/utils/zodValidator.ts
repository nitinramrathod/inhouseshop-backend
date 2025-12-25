import { ZodSchema } from "zod";

type ZodValidationSuccess<T> = {
  success: true;
  data: T;
};

type ZodValidationError = {
  success: false;
  statusCode: number;
  message: string;
  errors: Record<string, string>[];
};

export type ZodValidationResult<T> =
  | ZodValidationSuccess<T>
  | ZodValidationError;

export function validateZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): ZodValidationResult<T> {

  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(err => ({
      [err.path.join(".")]: err.message,
    }));

    return {
      success: false,
      statusCode: 422,
      message: "Validation failed",
      errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
