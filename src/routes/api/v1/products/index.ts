import { FastifyInstance } from "fastify";
import ProductController from "../../../../controllers/product.controller";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    ProductController.create
  );

  fastify.get("/", ProductController.getAll);

  fastify.get(
    "/:id",    
    ProductController.getById
  );

  fastify.put(
    "/:id",   
    ProductController.update
  );

  fastify.delete(
    "/:id",    
    ProductController.delete
  );
}
