import { FastifyReply, FastifyRequest } from "fastify";
import Order from "../models/order.model";
import Product from "../models/product.model";
import {
  CreateOrderInput,
  createOrderSchema,
} from "../schemas/order.schema";
import { validateZod } from "../utils/zodValidator";
import mongoose, { Types } from "mongoose";
import { getCartOwner } from "../utils/getCartOwner";
import cartModel from "../models/cart.model";

export default class OrderController {
  /* CREATE ORDER */

static async createOrder(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* ---------------- VALIDATION ---------------- */
    const body = request.body as CreateOrderInput;

    const validationResult = validateZod(
      createOrderSchema,
      body
    );

    if (!validationResult.success) {
      await session.abortTransaction();
      return reply.code(validationResult.statusCode).send({
        message: validationResult.message,
        errors: validationResult.errors,
      });
    }

    const input = validationResult.data;
    const { ownerType, ownerId } = getCartOwner(request);

    /* ---------------- FETCH CART ---------------- */
    const cart = await cartModel.findOne(
      { ownerType, ownerId },
      null,
      { session }
    );

    /* ---------------- FETCH PRODUCTS (1 QUERY) ---------------- */
    const productIds = input.items.map(
      item => new Types.ObjectId(item.productId)
    );

    const products = await Product.find(
      {
        _id: { $in: productIds },
        isActive: true,
      },
      null,
      { session }
    );

    if (products.length !== productIds.length) {
      throw new Error(
        "One or more products are invalid or inactive"
      );
    }

    /* ---------------- MAP PRODUCTS ---------------- */
    const productMap = new Map(
      products.map(p => [p._id.toString(), p])
    );

    /* ---------------- BUILD ORDER ITEMS ---------------- */
    let totalAmount = 0;

    const orderItems = input.items.map(item => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const price =
        product.discountedPrice ?? product.price;

      totalAmount += price * item.quantity;

      return {
        product: product._id,
        quantity: item.quantity,
        price,
      };
    });

    /* ---------------- CREATE ORDER ---------------- */
    const order = await Order.create(
      [
        {
          user: new Types.ObjectId(ownerId),
          items: orderItems,
          totalAmount,
          shippingAddress: input.shippingAddress,
          paymentMethod: input.paymentMethod,
          paymentStatus:
            input.paymentMethod === "ONLINE"
              ? "PAID"
              : "PENDING",
        },
      ],
      { session }
    );

    /* ---------------- REMOVE ITEMS FROM CART ---------------- */
    if (cart) {
      const orderedProductIds = new Set(
        productIds.map(id => id.toString())
      );

      cart.items = cart.items.filter(
        item =>
          !orderedProductIds.has(
            item.product.toString()
          )
      );

      cart.totalAmount = cart.items.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );

      await cart.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return reply.code(201).send({
      success: true,
      data: order[0],
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create order error:", error);

    return reply.code(500).send({
      message: error.message || "Failed to create order",
    });
  }
}


  /* GET ALL ORDERS (ADMIN) */
  static async getOrders(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    const orders = await Order.find()
      .populate("user", "email firstName lastName")
      .populate("items.product", "title price")
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
      .populate("items.product", "name price title")
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

  /* DELETE ORDER (ADMIN - SOFT DELETE) */
static async deleteOrder(
  request: FastifyRequest,
  reply: FastifyReply
) {
try {
  

  const {id} = request.params as {id:string};

  const order = await Order.findById(id);

  if (!order) {
    return reply.code(404).send({
      success: false,
      message: "Order not found",
    });
  }

  if (order?.isDeleted) {
    return reply.code(400).send({
      success: false,
      message: "Order already deleted",
    });
  }

  order.isDeleted = true;
  order.deletedAt = new Date();

  await order.save();

  return reply.send({
    success: true,
    message: "Order deleted successfully",
  });

  } catch (error:any) {
  return reply.send({
    success: false,
    error,
    message: "Error in order deletion",
  });
}
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
