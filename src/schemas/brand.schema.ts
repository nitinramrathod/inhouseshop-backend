import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters"),

  image: z
    .string()
    .min(2, "Image URL must be at least 2 characters"),

  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen separated"),

  isActive: z.boolean().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(2).optional(),
  image: z.string().min(2).optional(),

  // slug is OPTIONAL & should not auto-change
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and hyphen separated")
    .optional(),

  isActive: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
