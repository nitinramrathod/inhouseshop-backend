import { z } from "zod";

/* ---------------- CREATE ---------------- */
export const createProductSchema = z.object({
  title: z.string().min(3),
  brand: z.string(),
  category: z.string(),
  description: z.string().min(10),

  price: z.number().positive(),
  discountedPrice: z.number().positive().optional(),

  stock: z.number().int().min(0),
  sku: z.string().toUpperCase(),

  specifications: z.object({
    processor: z.string(),
    ram: z.string(),
    storage: z.string(),
    graphics: z.string(),
    display: z.string(),
    os: z.string(),
  }),

  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) =>
    !data.discountedPrice || data.discountedPrice < data.price,
  {
    message: "Discount price must be less than price",
    path: ["discountPrice"],
  }
);

/* ---------------- UPDATE ---------------- */
export const updateProductSchema = createProductSchema.partial();

/* ---------------- PARAMS ---------------- */
export const productIdSchema = z.object({
  id: z.string().length(24),
});

/* ---------------- TYPES ---------------- */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
