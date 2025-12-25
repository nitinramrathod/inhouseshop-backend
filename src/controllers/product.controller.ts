import { FastifyReply, FastifyRequest } from "fastify";
import Product from "../models/product.model";
import {
  CreateProductInput,
  UpdateProductInput,
  createProductSchema,
} from "../schemas/product.schema";
import { validateZod } from "../utils/zodValidator";

export default class ProductController {
  /* CREATE */
  static async create(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
  ) {

    if (!request.isMultipart()) {
      return reply
        .status(422)
        .send({ error: "Request must be multipart/form-data" });
    } 

    // await uploadCloudinary(part);

    const validationResult = validateZod(
      createProductSchema,
      request.body
    );

      if (!validationResult.success) {
      return reply
        .code(validationResult.statusCode)
        .send({
          message: validationResult.message,
          errors: validationResult.errors,
        });
    }

    const product = await Product.create(validationResult.data);

    return reply.code(201).send({
      success: true,
      data: product,
    });
  }

  /* GET ALL */
  static async getAll(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    const products = await Product.find().sort({ createdAt: -1 });

    return reply.send({
      success: true,
      count: products.length,
      data: products,
    });
  }

  /* GET ONE */
  static async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const product = await Product.findById(request.params.id);

    if (!product) {
      return reply.code(404).send({ message: "Product not found" });
    }

    return reply.send({
      success: true,
      data: product,
    });
  }

  /* UPDATE */
  static async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateProductInput;
    }>,
    reply: FastifyReply
  ) {
    const product = await Product.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true }
    );

    if (!product) {
      return reply.code(404).send({ message: "Product not found" });
    }

    return reply.send({
      success: true,
      data: product,
    });
  }

  /* DELETE */
  static async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const product = await Product.findByIdAndDelete(request.params.id);

    if (!product) {
      return reply.code(404).send({ message: "Product not found" });
    }

    return reply.send({
      success: true,
      message: "Product deleted",
    });
  }
}


