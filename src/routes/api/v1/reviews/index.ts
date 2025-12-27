import { FastifyInstance } from "fastify";
import ReviewController from "../../../../controllers/review.controller";

export default async function reviewRoutes(
  fastify: FastifyInstance
) {
  fastify.post(
    "/",
    { preHandler: fastify.authenticate },
    ReviewController.createReview
  );

  fastify.get(
    "/product/:productId",
    ReviewController.getProductReviews
  );

  fastify.put(
    "/:id",
    ReviewController.updateReview
  );

  fastify.delete(
    "/:id",
    ReviewController.deleteReview
  );
}
