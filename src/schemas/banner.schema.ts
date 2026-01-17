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
const sliderMetaSchema = z.object({
  product: z
    .string()
    .length(24, "Invalid product ID"),

  discountPercentage: z
    .number()
    .min(1, "Discount must be at least 1%")
    .max(99, "Discount cannot exceed 99%"),
})

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
    sliderMeta: sliderMetaSchema.optional(),

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
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),

    endAt: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),

    isActive: z.boolean().optional(),
})
    .superRefine((data, ctx) => {
        /**
         * Slider specific validation
         */

        if (data.type === "SLIDER" && !data.sliderMeta) {
            ctx.addIssue({
                path: ["sliderMeta"],
                message: "sliderMeta is required for SLIDER banners",
                code: z.ZodIssueCode.custom,
            })
        }

        // if (data.type === "SLIDER") {
        //     if (!data?.sliderMeta?.product) {
        //         ctx.addIssue({
        //             path: ["product"],
        //             message: "Product is required for slider banner",
        //             code: z.ZodIssueCode.custom,
        //         });
        //     }
        //     if (data?.sliderMeta?.discountPercentage === undefined) {
        //         ctx.addIssue({
        //             path: ["discountPercentage"],
        //             message: "Discount percentage is required for slider banner",
        //             code: z.ZodIssueCode.custom,
        //         });
        //     }
        // }
        if (data.startAt && data.endAt) {
            if (new Date(data.startAt) > new Date(data.endAt)) {
                ctx.addIssue({
                    path: ['endAt'],
                    message: 'End date must be after start date',
                    code: z.ZodIssueCode.custom,
                })
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

     sliderMeta: sliderMetaSchema.optional(),

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
