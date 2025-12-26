import { FastifyInstance } from "fastify";
import OrderController from "../../../../controllers/order.controller";

export default async function orderRoutes(
  fastify: FastifyInstance
) {
  fastify.post(
    "/",
    OrderController.createOrder
  );

  fastify.get(
    "/",
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
