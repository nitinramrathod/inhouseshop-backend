import { FastifyReply, FastifyRequest } from "fastify";
import Product from "../models/product.model";
import {
  CreateProductInput,
  UpdateProductInput,
} from "../schemas/product.schema";

/* CREATE */
export const createProduct = async (
  request: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply
) => {
  const product = await Product.create(request.body);

  return reply.code(201).send({
    success: true,
    data: product,
  });
};

/* GET ALL */
export const getProducts = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  const products = await Product.find().sort({ createdAt: -1 });

  return reply.send({
    success: true,
    count: products.length,
    data: products,
  });
};

/* GET ONE */
export const getProductById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const product = await Product.findById(request.params.id);

  if (!product) {
    return reply.code(404).send({ message: "Product not found" });
  }

  return reply.send({ success: true, data: product });
};

/* UPDATE */
export const updateProduct = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateProductInput;
  }>,
  reply: FastifyReply
) => {
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
};

/* DELETE */
export const deleteProduct = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const product = await Product.findByIdAndDelete(request.params.id);

  if (!product) {
    return reply.send({ message: "Product not found" });
  }

  return reply.send({
    success: true,
    message: "Product deleted",
  });
};
