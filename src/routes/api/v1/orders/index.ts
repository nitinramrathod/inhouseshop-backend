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
    { preHandler: fastify.authenticate },
    OrderController.getMyOrders
  );

  fastify.get(
    "/:id",
    { preHandler: fastify.authenticate },
    OrderController.getOrderById
  );
  
  fastify.delete(
    "/:id",
    { preHandler: fastify.authenticate },
    OrderController.deleteOrder
  );

  fastify.put(
    "/:id/status",
    { preHandler: fastify.authenticate },
    OrderController.updateOrderStatus
  );
}
