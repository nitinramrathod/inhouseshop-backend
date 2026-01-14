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

    const cart = await Cart.findOne({ ownerType, ownerId }).populate({
      path: "items.product",
      select: "title images discountedPrice price",
    });

    if (!cart) {
      return reply.send({
        success: true,
        data: {
          _id: null,
          totalAmount: 0,
          items: [],
        },
      });
    }

    const responseCart = {
      _id: cart._id,
      totalAmount: cart.totalAmount,
      items: cart.items.map((item: any) => ({
        id: item.product._id,
        title: item.product.title,
        image: item.product.images?.[0] ?? null,
        price: item.price,
        discountedPrice: item.product.discountedPrice ?? item.price,
        quantity: item.quantity,
      })),
    };

    return reply.send({
      success: true,
      data: responseCart,
    });
  }


  /* ADD TO CART */
  static async addToCart(
    request: FastifyRequest,
    reply: FastifyReply
  ) {

    try {

      const { ownerType, ownerId } = getCartOwner(request);
      const { productId, quantity } = request.body as { productId: string; quantity: number };

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

      // ✅ Populate for response only
      const populatedCart = await Cart.findById(cart._id).populate({
        path: "items.product",
        select: "title images discountedPrice price",
      });

      const responseCart = {
        _id: populatedCart?._id,
        totalAmount: populatedCart?.totalAmount,
        items: populatedCart?.items.map((item: any) => ({
          id: item.product._id,
          title: item.product.title,
          image: item.product.images?.[0] ?? null,
          price: item.price,
          discountedPrice: item.product.discountedPrice ?? item.price,
          quantity: item.quantity,
        })),
      };

      return reply.code(201).send({
        success: true,
        data: responseCart,
      });

    } catch (error: any) {
      console.log('error==>', error)

      return reply.code(500).send({
        success: false,
        message: error.message,
        error,
      });
    }
  }

  // static async mergeCart(
  //   request: FastifyRequest,
  //   reply: FastifyReply
  // ) {
  //   try {

  //     const { ownerType, ownerId } = getCartOwner(request);
  //     const { items: guestItems } = request.body as {
  //       items: {
  //         productId: string;
  //         quantity: number;
  //       }[]
  //     };

  //     if (!guestItems || guestItems.length === 0) {
  //       return reply.code(200).send({ success: true, data: [] });
  //     }

  //     let cart = await Cart.findOne({ ownerType, ownerId });

  //     if (!cart) {
  //       cart = await Cart.create({
  //         ownerType,
  //         ownerId,
  //         items: [],
  //         totalAmount: 0,
  //       });
  //     }

  //     // Convert existing cart items to map
  //     const cartItemMap = new Map<string, number>();

  //     cart.items.forEach((item) => {
  //       cartItemMap.set(item.product.toString(), item.quantity);
  //     });

  //     // Merge guest items
  //     for (const guestItem of guestItems) {
  //       const existingQty = cartItemMap.get(guestItem.productId) || 0;
  //       cartItemMap.set(
  //         guestItem.productId,
  //         existingQty + guestItem.quantity
  //       );
  //     }

  //     // Rebuild cart items with DB prices
  //     const mergedItems = [];
  //     let totalAmount = 0;

  //     for (const [productId, quantity] of cartItemMap.entries()) {
  //       const product = await Product.findById(productId);

  //       if (!product) continue;

  //       const price = product.price;
  //       totalAmount += price * quantity;

  //       mergedItems.push({
  //         product: product._id,
  //         quantity,
  //         price,
  //       });
  //     }

  //     cart.items = mergedItems;
  //     cart.totalAmount = totalAmount;

  //     await cart.save();

  //     return reply.code(200).send({
  //       success: true,
  //       data: cart,
  //     });

  //   } catch (error) {
  //     return reply.code(500).send({
  //       success: false,
  //       error
  //     });
  //   }
  // }

  static async mergeGuestCart(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { ownerType, ownerId } = getCartOwner(request);
    const { items: guestItems } = request.body as {
      items: { productId: string; quantity: number }[];
    };

    if (!guestItems || guestItems.length === 0) {
      return reply.code(200).send({ success: true, data: [] });
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

    /** 1️⃣ Build quantity map */
    const quantityMap = new Map<string, number>();

    cart.items.forEach((item) => {
      quantityMap.set(item.product.toString(), item.quantity);
    });

    guestItems.forEach((item) => {
      quantityMap.set(
        item.productId,
        (quantityMap.get(item.productId) || 0) + item.quantity
      );
    });

    /** 2️⃣ Fetch products in one query (IMPORTANT) */
    const productIds = Array.from(quantityMap.keys());

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      products.map((p) => [p._id.toString(), p])
    );

    /** 3️⃣ Rebuild cart items */
    const mergedItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of quantityMap.entries()) {
      const product = productMap.get(productId);
      if (!product) continue;

      const price = product.price;
      totalAmount += price * quantity;

      mergedItems.push({
        product: product._id,
        quantity,
        price,
      });
    }

    cart.items = mergedItems;
    cart.totalAmount = totalAmount;
    await cart.save();

    /** 4️⃣ BUILD FRONTEND-READY RESPONSE */
    const responseItems = mergedItems.map((item) => {
      const product = productMap.get(item.product.toString());

      return {
        id: product!._id,
        title: product!.title,
        image: product!.images?.[0] ?? null,
        price: item.price,
        discountedPrice: product!.discountedPrice ?? item.price,
        quantity: item.quantity,
      };
    });

    return reply.code(200).send({
      success: true,
      data: {
        items: responseItems,
        totalAmount,
      },
    });

  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      success: false,
      message: "Failed to merge cart",
    });
  }
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

  const guestId = request?.headers["x-guest-id"];
  if (!guestId) {
    throw new Error("Guest ID missing");
  }

  return { ownerType: "GUEST", ownerId: guestId };
}
