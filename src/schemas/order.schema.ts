import { z } from "zod";

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().min(1),
      price: z.number().positive(),
    })
  ).min(1),

  totalAmount: z.number().positive(),

  paymentMethod: z.enum(["COD", "ONLINE"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
