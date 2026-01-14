import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ).min(1),

  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),

    addressLine1: z.string().min(5),
    addressLine2: z.string().optional(),

    city: z.string(),
    state: z.string(),
    country: z.string().default("India"),
    pincode: z.string().min(4),

    type: z.enum(["HOME", "WORK"]).default("HOME"),
    isDefault: z.boolean().optional(),
  }).optional(),
  
  paymentMethod: z.enum(["COD", "ONLINE"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
