import { FastifyReply, FastifyRequest } from "fastify";
import Order from "../models/order.model";
import {
  CreateOrderInput,
  createOrderSchema,
} from "../schemas/order.schema";
import { validateZod } from "../utils/zodValidator";
import { Types } from "mongoose";

export default class OrderController {
  /* CREATE ORDER */
  static async createOrder(
    request: FastifyRequest,
    reply: FastifyReply
  ) {

    try {
      const body = request.body as CreateOrderInput

      const validationResult = validateZod(
        createOrderSchema,
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

      const input = validationResult.data;

      const userId = (request as any).user?.id;

      const orderData = {
        user: new Types.ObjectId(userId),

        items: input.items.map(item => ({
          product: new Types.ObjectId(item.product),
          quantity: item.quantity,
          price: item.price,
        })),

        totalAmount: input.totalAmount,

        paymentStatus: input.paymentMethod === "ONLINE" ? "PAID" : "PENDING",
      };

      const order = await Order.create(orderData);

      return reply.code(201).send({
        success: true,
        data: order,
      });

    } catch (error) {
      console.log('error==>', error)
    }
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
    request: FastifyRequest,
    reply: FastifyReply
  ) {
        const {id} = request.params as {id:string};

    const order = await Order.findById(id)
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
    request: FastifyRequest,
    reply: FastifyReply
  ) {

     const {id} = request.params as {id:string};
     const {status} = request.body as { status: string };
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
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
