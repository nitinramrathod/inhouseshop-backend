import { FastifyInstance } from "fastify";
import CategoryController from "../../../../controllers/category.controller";

export default async function categoryRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    { preHandler: fastify.authenticate },
    CategoryController.createCategory
  );

  fastify.get(
    "/",
    { preHandler: fastify.authenticate },
    CategoryController.getCategories
  );

  fastify.get(
    "/:id",
    CategoryController.getCategoryById
  );

  fastify.put(
    "/:id",
    CategoryController.updateCategory
  );

  fastify.delete(
    "/:id",
    CategoryController.deleteCategory
  );
}
