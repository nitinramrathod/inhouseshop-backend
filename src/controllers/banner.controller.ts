import { FastifyReply, FastifyRequest } from "fastify";
import Banner from "../models/banner.model";
import { validateZod } from "../utils/zodValidator";
import bodyParser from "../utils/bodyParser";
import { createBannerSchema, updateBannerSchema } from "../schemas/banner.schema";
import { Types } from "mongoose";

export default class BannerController {
    /**
     * Create banner / slider
     */
    static async createBanner(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            if (!request.isMultipart()) {
                return reply
                    .status(422)
                    .send({ error: "Request must be multipart/form-data" });
            }

            const fields: any = await bodyParser(request);

            const validationResult = validateZod(
                createBannerSchema,
                {
                    ...fields,
                    sliderMeta:{...fields.sliderMeta, discountPercentage: Number(fields.discountPercentage)},                    
                    priority: Number(fields?.priority || 0)
                }
            );

            if (!validationResult.success) {
                return reply
                    .code(validationResult.statusCode)
                    .send({
                        message: validationResult.message,
                        errors: validationResult.errors,
                    });
            }

            const payload = validationResult.data;

            const banner = await Banner.create({
                ...payload, sliderMeta: payload.sliderMeta
                    ? {
                        ...payload.sliderMeta,
                        product: payload.sliderMeta.product
                            ? new Types.ObjectId(payload.sliderMeta.product)
                            : undefined,
                    }
                    : undefined,
            });

            return reply.code(201).send(banner);
        } catch (error: any) {
            return reply.code(400).send({
                message: error.message,
            });
        }
    }

    /**
     * Get all banners (admin use)
     */
    static async getBanners(
        _request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const banners = await Banner.find()
                .sort({ createdAt: -1 }).populate({
                    path: "sliderMeta.product",
                    select: "slug price discountedPrice",
                });

            return reply.send(banners);
        } catch (error: any) {
            return reply.code(500).send({
                message: error.message,
            });
        }
    }

    /**
     * Get active banners for frontend (by position)
     * ?position=HOME_TOP_LEFT_SLIDER
     */
    static async getActiveBanners(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { position } = request.query as {
                position?: string;
            };

            const now = new Date();

            const query: any = {
                isActive: true,
                $and: [
                    {
                        $or: [
                            { startAt: { $exists: false } },
                            { startAt: { $lte: now } },
                        ],
                    },
                    {
                        $or: [
                            { endAt: { $exists: false } },
                            { endAt: { $gte: now } },
                        ],
                    },
                ],
            };

            if (position) {
                query.position = position;
            }

            const banners = await Banner.find(query)
                .sort({ priority: -1 }).populate({
                path: "sliderMeta.product",
                select: "slug price discountedPrice",
            });

            return reply.send(banners);
        } catch (error: any) {
            return reply.code(500).send({
                message: error.message,
            });
        }
    }

    /**
     * Get banner by ID
     */
    static async getBannerById(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params as { id: string };

            const banner = await Banner.findById(id);

            if (!banner) {
                return reply.code(404).send({
                    message: "Banner not found",
                });
            }

            return reply.send(banner);
        } catch (error: any) {
            return reply.code(400).send({
                message: "Invalid banner ID",
            });
        }
    }

    /**
     * Update banner
     */
    static async updateBanner(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params as { id: string };

            if (!request.isMultipart()) {
                return reply
                    .status(422)
                    .send({ error: "Request must be multipart/form-data" });
            }

            const fields: any = await bodyParser(request);

            const validationResult = validateZod(
                updateBannerSchema,
                fields
            );

            if (!validationResult.success) {
                return reply
                    .code(validationResult.statusCode)
                    .send({
                        message: validationResult.message,
                        errors: validationResult.errors,
                    });
            }

            const banner = await Banner.findByIdAndUpdate(
                id,
                validationResult.data,
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!banner) {
                return reply.code(404).send({
                    message: "Banner not found",
                });
            }

            return reply.send(banner);
        } catch (error: any) {
            return reply.code(400).send({
                message: error.message,
            });
        }
    }

    /**
     * Delete banner (soft delete)
     */
    static async deleteBanner(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params as { id: string };

            const banner = await Banner.findByIdAndUpdate(
                id,
                { isActive: false },
                { new: true }
            );

            if (!banner) {
                return reply.code(404).send({
                    message: "Banner not found",
                });
            }

            return reply.send({
                message: "Banner deactivated successfully",
            });
        } catch (error: any) {
            return reply.code(400).send({
                message: error.message,
            });
        }
    }
}
