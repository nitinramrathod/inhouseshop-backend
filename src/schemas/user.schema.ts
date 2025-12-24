import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),

  email: z.string().email("Invalid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  role: z.enum(["BUYER", "SELLER", "ADMIN"]).optional(),

  addresses: z
    .array(
      z.object({
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
      })
    )
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
