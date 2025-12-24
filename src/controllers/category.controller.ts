import { FastifyReply, FastifyRequest } from "fastify";
import Category from "../models/category.model";

/**
 * Controller for Category CRUD operations
 */
export default class CategoryController {
  /**
   * Create category
   */
  static async createCategory(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const category = await Category.create(request.body);

      return reply.code(201).send(category);
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }

  /**
   * Get all categories
   */
  static async getCategories(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const categories = await Category.find()
        .sort({ createdAt: -1 });

      return reply.send(categories);
    } catch (error: any) {
      return reply.code(500).send({
        message: error.message,
      });
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const category = await Category.findById(id);

      if (!category) {
        return reply.code(404).send({
          message: "Category not found",
        });
      }

      return reply.send(category);
    } catch (error: any) {
      return reply.code(400).send({
        message: "Invalid category ID",
      });
    }
  }

  /**
   * Update category
   */
  static async updateCategory(
    request: FastifyRequest<{
      Params: { id: string };
      Body: Partial<{ name: string; slug: string; isActive: boolean }>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const category = await Category.findByIdAndUpdate(
        id,
        request.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!category) {
        return reply.code(404).send({
          message: "Category not found",
        });
      }

      return reply.send(category);
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }

  /**
   * Delete category (soft delete)
   */
  static async deleteCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const category = await Category.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!category) {
        return reply.code(404).send({
          message: "Category not found",
        });
      }

      return reply.send({
        message: "Category deactivated successfully",
      });
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }
}
