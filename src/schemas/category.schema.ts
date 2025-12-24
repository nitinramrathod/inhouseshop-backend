import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters"),

  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen separated"),

  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen separated")
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>;
export type UpdateCategoryInput = z.infer<
  typeof updateCategorySchema
>;
