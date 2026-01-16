import { z } from "zod";

/**
 * Banner positions on website
 */

export const BANNER_TYPES = ["BANNER", "SLIDER"] as const;

export const BANNER_POSITIONS = [
  "HOME_TOP_LEFT_SLIDER",
  "HOME_TOP_RIGHT_TOP",
  "HOME_TOP_RIGHT_BOTTOM",
  "HOME_MIDDLE_TOP",
  "HOME_MIDDLE_BOTTOM_LEFT",
  "HOME_MIDDLE_BOTTOM_RIGHT",
] as const;

export type BannerType = typeof BANNER_TYPES[number];
export type BannerPosition = typeof BANNER_POSITIONS[number];

const BannerTypeEnum = z.enum(BANNER_TYPES);
const BannerPositionEnum = z.enum(BANNER_POSITIONS);


/**
 * Create banner schema
 */
export const createBannerSchema = z.object({
    title: z
        .string()
        .min(2, "Title must be at least 2 characters"),

    subtitle: z
        .string()
        .min(2, "Subtitle must be at least 2 characters")
        .optional(),

    image: z
        .string()
        .min(2, "Image URL must be at least 2 characters"),

    redirectUrl: z
        .string()
        .min(2, "redirectUrl must be at least 2 characters"),

    type: BannerTypeEnum,

    position: BannerPositionEnum,

    /**
     * Optional product reference (used for sliders)
     */
    product: z
        .string()
        .min(24, "Invalid product ID")
        .optional(),

    /**
     * Discount percentage (only for slider)
     */
    discountPercentage: z
        .number()
        .min(1, "Discount must be at least 1%")
        .max(99, "Discount cannot exceed 99%")
        .optional(),



    /**
     * Priority ordering
     */
    priority: z
        .number()
        .min(0)
        .optional(),

    /**
     * Banner active period
     */
    startAt: z
        .string()
        .datetime()
        .optional(),

    endAt: z
        .string()
        .datetime()
        .optional(),

    isActive: z.boolean().optional(),
})
    .superRefine((data, ctx) => {
        /**
         * Slider specific validation
         */
        if (data.type === "SLIDER") {
            if (!data.product) {
                ctx.addIssue({
                    path: ["product"],
                    message: "Product is required for slider banner",
                    code: z.ZodIssueCode.custom,
                });
            }

            if (data.discountPercentage === undefined) {
                ctx.addIssue({
                    path: ["discountPercentage"],
                    message: "Discount percentage is required for slider banner",
                    code: z.ZodIssueCode.custom,
                });
            }
        }
    });

/**
 * Update banner schema
 */
export const updateBannerSchema = z.object({
    title: z.string().min(2).optional(),
    subtitle: z.string().min(2).optional(),
    image: z.string().min(2).optional(),

    type: BannerTypeEnum.optional(),
    position: BannerPositionEnum.optional(),

    product: z.string().min(24).optional(),

    discountPercentage: z
        .number()
        .min(1)
        .max(99)
        .optional(),

    ctaText: z.string().min(2).optional(),
    ctaLink: z.string().min(2).optional(),

    priority: z.number().min(0).optional(),

    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),

    isActive: z.boolean().optional(),
});

/**
 * Types
 */
export type CreateBannerInput = z.infer<
    typeof createBannerSchema
>;

export type UpdateBannerInput = z.infer<
    typeof updateBannerSchema
>;
