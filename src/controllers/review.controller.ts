import { FastifyReply, FastifyRequest } from "fastify";
import Review from "../models/review.model";
import {
  createReviewSchema,
  CreateReviewInput,
} from "../schemas/review.schema";
import { validateZod } from "../utils/zodValidator";

export default class ReviewController {
  /* CREATE REVIEW */
  static async createReview(
    request: FastifyRequest<{ Body: CreateReviewInput }>,
    reply: FastifyReply
  ) {
    const validatedBody = validateZod(
      createReviewSchema,
      request.body
    );

    const userId = (request as any).user?.id;

    const review = await Review.create({
      user: userId,
      ...validatedBody,
    });

    return reply.code(201).send({
      success: true,
      data: review,
    });
  }

  /* GET REVIEWS BY PRODUCT */
  static async getProductReviews(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    const reviews = await Review.find({
      product: request.params.productId,
    })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    return reply.send({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  }

  /* UPDATE REVIEW */
  static async updateReview(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Partial<CreateReviewInput>;
    }>,
    reply: FastifyReply
  ) {
    const userId = (request as any).user?.id;

    const review = await Review.findOneAndUpdate(
      { _id: request.params.id, user: userId },
      request.body,
      { new: true }
    );

    if (!review) {
      return reply.code(404).send({
        message: "Review not found or unauthorized",
      });
    }

    return reply.send({
      success: true,
      data: review,
    });
  }

  /* DELETE REVIEW */
  static async deleteReview(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = (request as any).user?.id;

    const review = await Review.findOneAndDelete({
      _id: request.params.id,
      user: userId,
    });

    if (!review) {
      return reply.code(404).send({
        message: "Review not found or unauthorized",
      });
    }

    return reply.send({
      success: true,
      message: "Review deleted",
    });
  }
}
