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
    CategoryController.getCategories
  );

  fastify.get(
    "/:id",
    CategoryController.getCategoryById
  );

  fastify.put(
    "/:id",
     { preHandler: fastify.authenticate },
    CategoryController.updateCategory
  );

  fastify.delete(
    "/:id",
     { preHandler: fastify.authenticate },
    CategoryController.deleteCategory
  );
}
