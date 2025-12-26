import { FastifyInstance } from "fastify";
import CartController from "../../../../controllers/cart.controller";

export default async function cartRoutes(
  fastify: FastifyInstance
) {
  fastify.get("/", CartController.getCart);

  fastify.post("/", CartController.addToCart);

  fastify.put(
    "/:productId",
    CartController.updateCartItem
  );

  fastify.delete(
    "/:productId",
    CartController.removeItem
  );

  fastify.delete(
    "/",
    CartController.clearCart
  );
}
