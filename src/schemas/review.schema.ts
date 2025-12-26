import { z } from "zod";

export const createReviewSchema = z.object({
  product: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
