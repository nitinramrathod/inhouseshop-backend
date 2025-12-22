import { FastifyInstance } from "fastify";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../../../controllers/product.controller";

import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from "../../../../schemas/product.schema";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/products",
    {
      schema: {
        body: createProductSchema,
      },
    },
    createProduct
  );

  fastify.get("/products", getProducts);

  fastify.get(
    "/products/:id",
    {
      schema: {
        params: productIdSchema,
      },
    },
    getProductById
  );

  fastify.put(
    "/products/:id",
    {
      schema: {
        params: productIdSchema,
        body: updateProductSchema,
      },
    },
    updateProduct
  );

  fastify.delete(
    "/products/:id",
    {
      schema: {
        params: productIdSchema,
      },
    },
    deleteProduct
  );
}
