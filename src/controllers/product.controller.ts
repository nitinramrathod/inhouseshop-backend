import { FastifyReply, FastifyRequest } from "fastify";
import Product from "../models/product.model";
import {
  CreateProductInput,
  UpdateProductInput,
  createProductSchema,
} from "../schemas/product.schema";
import { validateZod } from "../utils/zodValidator";
import bodyParser from "../utils/bodyParser";
import { generateSKU } from "../utils/generateSKU";
import Category, { ICategory } from "../models/category.model";

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

    const fields: any = await bodyParser(request);

    const images: string[] = Object.keys(fields).filter(key => key.startsWith("images["))
      .sort((a, b) => {
        const ai = Number(a.match(/\d+/)?.[0]);
        const bi = Number(b.match(/\d+/)?.[0]);
        return ai - bi;
      })
      .map(key => fields[key]);

    const category: ICategory | null = await Category.findById(fields.category);

    if (!category) {
      return reply
        .status(422)
        .send({ error: "Category not found for given category id" });
    }

    const validationResult = validateZod(
      createProductSchema,
      {
        ...fields,
        sku: generateSKU(category?.name, fields.brand),
        images,
        price: Number(fields.price),
        discountPrice: fields.discountPrice ? Number(fields.discountPrice) : 0,
        stock: Number(fields.stock)
      }
    );

    if (!validationResult.success) {
      return reply
        .code(validationResult.statusCode)
        .send({
          message: validationResult.message,
          errors: validationResult.errors,
        });
    }

    console.log('validationResult.data', validationResult.data)

    const product = await Product.create(validationResult.data);

    return reply.code(201).send({
      success: true,
      data: product,
    });
  }

  /* GET ALL */
  static async getAll(
    request: FastifyRequest<{
      Querystring: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        hasDiscount?: boolean;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      };
    }>,
    reply: FastifyReply
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      hasDiscount,
      isActive = true,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = request.query;

    const skip = (page - 1) * limit;

    /* ------------------ FILTER BUILDING ------------------ */
    const filter: any = {};

    // Active products only
    filter.isActive = isActive;

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    // Discount filter
    if (hasDiscount === true) {
      filter.discountPrice = { $exists: true, $ne: null };
    }

    // Search (name + description + brand)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    /* ------------------ SORTING ------------------ */
    const sort: any = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    /* ------------------ DB QUERIES ------------------ */
    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    /* ------------------ RESPONSE ------------------ */
    return reply.send({
      success: true,
      data: products,

      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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


