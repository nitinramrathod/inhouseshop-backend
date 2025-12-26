import { FastifyReply, FastifyRequest } from "fastify";
import Cart from "../models/cart.model";
import Product from "../models/product.model";

export default class CartController {
  /* GET CART */
  static async getCart(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { ownerType, ownerId } = getCartOwner(request);

    const cart = await Cart.findOne({ ownerType, ownerId })
      .populate("items.product");

    return reply.send({
      success: true,
      data: cart || { items: [], totalAmount: 0 },
    });
  }

  /* ADD TO CART */
  static async addToCart(
    request: FastifyRequest<{
      Body: { productId: string; quantity: number };
    }>,
    reply: FastifyReply
  ) {
    const { ownerType, ownerId } = getCartOwner(request);
    const { productId, quantity } = request.body;

    const product = await Product.findById(productId);
    if (!product) {
      return reply.code(404).send({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ ownerType, ownerId });

    if (!cart) {
      cart = await Cart.create({
        ownerType,
        ownerId,
        items: [],
        totalAmount: 0,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    return reply.code(201).send({
      success: true,
      data: cart,
    });
  }

  /* UPDATE ITEM QUANTITY */
  static async updateCartItem(
    request: FastifyRequest<{
      Params: { productId: string };
      Body: { quantity: number };
    }>,
    reply: FastifyReply
  ) {
    const { ownerType, ownerId } = getCartOwner(request);
    const { productId } = request.params;
    const { quantity } = request.body;

    const cart = await Cart.findOne({ ownerType, ownerId });
    if (!cart) {
      return reply.code(404).send({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return reply.code(404).send({ message: "Item not found" });
    }

    item.quantity = quantity;

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    return reply.send({
      success: true,
      data: cart,
    });
  }

  /* REMOVE ITEM */
  static async removeItem(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    const { ownerType, ownerId } = getCartOwner(request);

    const cart = await Cart.findOne({ ownerType, ownerId });
    if (!cart) {
      return reply.code(404).send({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== request.params.productId
    );

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    return reply.send({
      success: true,
      data: cart,
    });
  }

  /* CLEAR CART */
  static async clearCart(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { ownerType, ownerId } = getCartOwner(request);

    await Cart.findOneAndDelete({ ownerType, ownerId });

    return reply.send({
      success: true,
      message: "Cart cleared",
    });
  }
}

/* Helper */
function getCartOwner(request: any) {
  if (request.user?.id) {
    return { ownerType: "USER", ownerId: request.user.id };
  }

  const guestId = request.headers["x-guest-id"];
  if (!guestId) {
    throw new Error("Guest ID missing");
  }

  return { ownerType: "GUEST", ownerId: guestId };
}
