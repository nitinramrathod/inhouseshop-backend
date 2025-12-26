import { FastifyReply, FastifyRequest } from "fastify";
import Order from "../models/order.model";
import {
  CreateOrderInput,
  createOrderSchema,
} from "../schemas/order.schema";
import { validateZod } from "../utils/zodValidator";

export default class OrderController {
  /* CREATE ORDER */
  static async createOrder(
    request: FastifyRequest<{ Body: CreateOrderInput }>,
    reply: FastifyReply
  ) {
    const validatedBody = validateZod(
      createOrderSchema,
      request.body
    );

    // assuming user is attached by auth middleware
    const userId = (request as any).user?.id;

    const order = await Order.create({
      user: userId,
      ...validatedBody,
    });

    return reply.code(201).send({
      success: true,
      data: order,
    });
  }

  /* GET ALL ORDERS (ADMIN) */
  static async getOrders(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    const orders = await Order.find()
      .populate("user", "email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    return reply.send({
      success: true,
      count: orders.length,
      data: orders,
    });
  }

  /* GET USER ORDERS */
  static async getMyOrders(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = (request as any).user?.id;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    return reply.send({
      success: true,
      count: orders.length,
      data: orders,
    });
  }

  /* GET SINGLE ORDER */
  static async getOrderById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const order = await Order.findById(request.params.id)
      .populate("user", "email")
      .populate("items.product", "name price");

    if (!order) {
      return reply.code(404).send({ message: "Order not found" });
    }

    return reply.send({
      success: true,
      data: order,
    });
  }

  /* UPDATE ORDER STATUS (ADMIN) */
  static async updateOrderStatus(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { status: string };
    }>,
    reply: FastifyReply
  ) {
    const order = await Order.findByIdAndUpdate(
      request.params.id,
      { status: request.body.status },
      { new: true }
    );

    if (!order) {
      return reply.code(404).send({ message: "Order not found" });
    }

    return reply.send({
      success: true,
      data: order,
    });
  }
}
