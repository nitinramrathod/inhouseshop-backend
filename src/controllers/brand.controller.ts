import { FastifyReply, FastifyRequest } from "fastify";
import Brand from "../models/brand.model";
import { validateZod } from "../utils/zodValidator";
import { createBrandSchema } from "../schemas/brand.schema";
import bodyParser from "../utils/bodyParser";
import { generateUniqueSlug } from "../utils/generateUniqueSlug";

/**
 * Controller for Brand CRUD operations
 */
export default class BrandController {
  /**
   * Create brand
   */
  static async createBrand(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      if (!request.isMultipart()) {
        return reply
          .status(422)
          .send({ error: "Request must be multipart/form-data" });
      }

      const fields: any = await bodyParser(request);

      // slug generated only on create
      const slug = await generateUniqueSlug(fields.name, Brand);

      const validationResult = validateZod(
        createBrandSchema,
        {
          ...fields,
          slug,
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

      const brand = await Brand.create(validationResult.data);

      return reply.code(201).send(brand);
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }

  /**
   * Get all brands
   */
  static async getBrands(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const brands = await Brand.find()
        .sort({ createdAt: -1 });

      return reply.send(brands);
    } catch (error: any) {
      return reply.code(500).send({
        message: error.message,
      });
    }
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params as { id: string };

      const brand = await Brand.findById(id);

      if (!brand) {
        return reply.code(404).send({
          message: "Brand not found",
        });
      }

      return reply.send(brand);
    } catch (error: any) {
      return reply.code(400).send({
        message: "Invalid brand ID",
      });
    }
  }

  /**
   * Update brand
   */
  static async updateBrand(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params as { id: string };

      if (!request.isMultipart()) {
        return reply
          .status(422)
          .send({ error: "Request must be multipart/form-data" });
      }

      const fields: any = await bodyParser(request);

      // IMPORTANT:
      // slug should NOT auto-change when name changes
      // only update slug if explicitly provided in fields

      const brand = await Brand.findByIdAndUpdate(
        id,
        fields,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!brand) {
        return reply.code(404).send({
          message: "Brand not found",
        });
      }

      return reply.send(brand);
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }

  /**
   * Delete brand (soft delete)
   */
  static async deleteBrand(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params as { id: string };

      const brand = await Brand.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!brand) {
        return reply.code(404).send({
          message: "Brand not found",
        });
      }

      return reply.send({
        message: "Brand deactivated successfully",
      });
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }
}
