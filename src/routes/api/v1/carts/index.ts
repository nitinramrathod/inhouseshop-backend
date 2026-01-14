import { FastifyInstance } from "fastify";
import CartController from "../../../../controllers/cart.controller";

export default async function cartRoutes(
  fastify: FastifyInstance
) {
  fastify.get("/", 
    { preHandler: fastify.authenticate },
     CartController.getCart);

  fastify.post("/", { preHandler: fastify.authenticate }, CartController.addToCart)

  fastify.post("/merge", 
    { preHandler: fastify.authenticate },
     CartController.mergeGuestCart);

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
