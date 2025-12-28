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
    request: FastifyRequest,
    reply: FastifyReply
  ) {

    const body = request.body as CreateReviewInput;

    const validationResult = validateZod(
      createReviewSchema,
      body
    );

    if (!validationResult.success) {
      return reply
        .code(validationResult.statusCode)
        .send({
          message: validationResult.message,
          errors: validationResult.errors,
        });
    }

    const userId = (request as any).user?.id;

    const review = await Review.create({
      user: userId,
      ...validationResult.data,
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
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = (request as any).user?.id;

    const {id} = request.params as {id:string};
    const body = request.body as Partial<CreateReviewInput>

    const review = await Review.findOneAndUpdate(
      { _id: id, user: userId },
      body,
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
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = (request as any).user?.id;
     const {id} = request.params as {id:string};

    const review = await Review.findOneAndDelete({
      _id: id,
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
