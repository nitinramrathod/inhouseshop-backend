import { FastifyInstance } from "fastify";
import ProductController from "../../../../controllers/product.controller";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.post("/",
    { preHandler: fastify.authenticate },
    ProductController.create
  );

  fastify.get("/",
    ProductController.getAll);

  fastify.get(
    "/:id",
    ProductController.getById
  );

  fastify.put(
    "/:id",
    { preHandler: fastify.authenticate },
    ProductController.update
  );

  fastify.delete(
    "/:id",
    { preHandler: fastify.authenticate },
    ProductController.delete
  );
}
