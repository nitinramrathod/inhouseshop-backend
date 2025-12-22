import { z } from "zod";

/* ---------------- CREATE ---------------- */
export const createProductSchema = z.object({
  name: z.string().min(3),
  brand: z.string(),
  category: z.enum(["Laptop", "Mobile", "Tablet", "Accessory"]),
  description: z.string().min(10),

  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),

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
    !data.discountPrice || data.discountPrice < data.price,
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
