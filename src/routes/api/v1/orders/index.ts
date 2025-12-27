import { FastifyInstance } from "fastify";
import OrderController from "../../../../controllers/order.controller";

export default async function orderRoutes(
  fastify: FastifyInstance
) {
  fastify.post(
    "/",
    { preHandler: fastify.authenticate },
    OrderController.createOrder
  );

  fastify.get(
    "/",
    { preHandler: fastify.authenticate },
    OrderController.getOrders
  );

  fastify.get(
    "/my",
    OrderController.getMyOrders
  );

  fastify.get(
    "/:id",
    OrderController.getOrderById
  );

  fastify.put(
    "/:id/status",
    OrderController.updateOrderStatus
  );
}
