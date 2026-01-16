import { FastifyReply, FastifyRequest } from "fastify";
import Product from "../models/product.model";
import {
  CreateProductInput,
  UpdateProductInput,
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";
import { validateZod } from "../utils/zodValidator";
import bodyParser from "../utils/bodyParser";
import { generateSKU } from "../utils/generateSKU";
import Category, { ICategory } from "../models/category.model";
import mongoose from "mongoose";
import { generateUniqueSlug } from "../utils/generateUniqueSlug";

export default class ProductController {
  /* CREATE */
  static async create(
    request: FastifyRequest,
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


    const slug = await generateUniqueSlug(fields.title, Product);

    const validationResult = validateZod(
      createProductSchema,
      {
        ...fields,
        sku: generateSKU(category?.name, fields.brand),
        images,
        slug,
        price: Number(fields.price),
        discountedPrice: fields.discountedPrice ? Number(fields.discountedPrice) : 0,
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

    const product = await Product.create(validationResult.data);

    return reply.code(201).send({
      success: true,
      data: product,
    });
  }

  static async getAll(
  request: FastifyRequest,
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
  } = request.query as any;

  const skip = (page - 1) * limit;

  /* ---------------- FILTER ---------------- */
  const filter: any = { isActive };

  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = minPrice;
    if (maxPrice) filter.price.$lte = maxPrice;
  }

  if (hasDiscount === true) {
    filter.discountPrice = { $exists: true, $ne: null };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  /* ---------------- SORT ---------------- */
  const sort: any = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  /* ---------------- AGGREGATION ---------------- */
  const products = await Product.aggregate([
    { $match: filter },

    {
      $lookup: {
        from: "reviews", // collection name
        localField: "_id",
        foreignField: "product",
        as: "reviews",
      },
    },

    {
      $addFields: {
        reviewCount: { $size: "$reviews" },
        averageRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.rating" },
            0,
          ],
        },
      },
    },

    {
      $project: {
        reviews: 0, // hide reviews array
      },
    },

    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
  ]);

  const totalItems = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);

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
  static async getBySlug(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { slug } = request.params as { slug: string };

  const product = await Product.aggregate([
    {
      $match: { slug },
    },

    /* ----------- LOOKUP REVIEWS ----------- */
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
      },
    },

    /* ----------- LOOKUP USERS (OPTIONAL) ----------- */
    {
      $lookup: {
        from: "users",
        localField: "reviews.user",
        foreignField: "_id",
        as: "reviewUsers",
      },
    },

    /* ----------- MERGE USER INTO REVIEW ----------- */
    {
      $addFields: {
        reviews: {
          $map: {
            input: "$reviews",
            as: "review",
            in: {
              _id: "$$review._id",
              rating: "$$review.rating",
              comment: "$$review.comment",
              createdAt: "$$review.createdAt",
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$reviewUsers",
                      as: "user",
                      cond: {
                        $eq: ["$$user._id", "$$review.user"],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    /* ----------- CALCULATE RATING ----------- */
    {
      $addFields: {
        reviewCount: { $size: "$reviews" },
        averageRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $round: [{ $avg: "$reviews.rating" }, 1] },
            0,
          ],
        },
      },
    },

    {
      $project: {
        reviewUsers: 0, // cleanup
      },
    },
  ]);

  if (!product.length) {
    return reply.code(404).send({ message: "Product not found" });
  }

  return reply.send({
    success: true,
    data: product[0],
  });
}


  /* UPDATE */
  static async update(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params as { id: string };

      const product: any = await Product.findById(id);

      if (!product) {
        return reply
          .status(422)
          .send({ error: "Product not found for given id" });
      }
      let existingImages = product.images;      
      
      const fields: any = await bodyParser(request);

      const removedImages: string[] = Object.keys(fields).filter(key => key.startsWith("removedImages["))
        .sort((a, b) => {
          const ai = Number(a.match(/\d+/)?.[0]);
          const bi = Number(b.match(/\d+/)?.[0]);
          return ai - bi;
        })
        .map(key => fields[key]);

      if(removedImages.length > 0){
       existingImages = existingImages.filter(
        (imgUrl: string) => !removedImages.includes(imgUrl)
      );

      }

      const images: string[] = Object.keys(fields).filter(key => key.startsWith("images["))
        .sort((a, b) => {
          const ai = Number(a.match(/\d+/)?.[0]);
          const bi = Number(b.match(/\d+/)?.[0]);
          return ai - bi;
        })
        .map(key => fields[key]);

      const category: ICategory | null = await Category.findById(fields.category);

      const updatedImages = [...existingImages, ...images]

      if (!category) {
        return reply
          .status(422)
          .send({ error: "Category not found for given category id" });
      }

      const validationResult = validateZod(
        updateProductSchema,
        {
          ...fields,
          images:updatedImages,
          price: Number(fields.price),
          discountedPrice: fields.discountedPrice ? Number(fields.discountedPrice) : 0,
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

      const updateProduct = await Product.findByIdAndUpdate(
        id,
        {
          ...fields,
          images:updatedImages,
          price: Number(fields.price),
          discountPrice: fields.discountPrice ? Number(fields.discountPrice) : 0,
          stock: Number(fields.stock)
        },
        { new: true }
      );

      if (!updateProduct) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return reply.send({
        success: true,
        data: updateProduct,
      });

    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  }


  /* DELETE */
  static async delete(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { id } = request.params as { id: string };

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return reply.code(404).send({ message: "Product not found" });
    }

    return reply.send({
      success: true,
      message: "Product deleted",
    });
  }
}


