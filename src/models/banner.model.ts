import { Schema, model, Document, Types } from "mongoose";
import { BANNER_POSITIONS, BANNER_TYPES, BannerPosition, BannerType } from "../schemas/banner.schema";


/**
 * Slider-only metadata
 */
export interface ISliderMeta {
    product?: Types.ObjectId;
    discountPercentage?: number;
}

/**
 * Banner document
 */
export interface IBanner extends Document {
    title?: string;
    subtitle?: string;

    type: BannerType;
    position: BannerPosition;

    image: string;
    redirectUrl?: string;

    sliderMeta?: ISliderMeta;

    isActive: boolean;

    startAt?: Date;
    endAt?: Date;

    priority: number; // ordering within same position
}

/**
 * Slider meta sub-document
 */
const sliderMetaSchema = new Schema<ISliderMeta>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },

        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
        },
    },
    { _id: false }
);

/**
 * Banner schema
 */
const bannerSchema = new Schema<IBanner>(
    {
        title: {
            type: String,
        },

        subtitle: {
            type: String,
        },

        type: {
            type: String,
            enum: BANNER_TYPES,
            required: true,
        },

        position: {
            type: String,
            enum: BANNER_POSITIONS,
            required: true,
            index: true,
        },

        image: {
            type: String,
            required: true,
        },

        redirectUrl: {
            type: String,
        },

        sliderMeta: {
            type: sliderMetaSchema,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        startAt: {
            type: Date,
        },

        endAt: {
            type: Date,
        },

        priority: {
            type: Number,
            default: 0,
        }

    },
    { timestamps: true }
);

/**
 * Indexes for fast homepage queries
 */
bannerSchema.index({
    position: 1,
    isActive: 1,
    priority: -1,
});

export default model<IBanner>("Banner", bannerSchema);
