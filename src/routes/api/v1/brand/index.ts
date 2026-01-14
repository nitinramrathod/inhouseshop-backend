import { FastifyInstance } from "fastify";
import BrandController from "../../../../controllers/brand.controller";

export default async function brandRoutes(
  fastify: FastifyInstance
) {
  fastify.post(
    "/",
    { preHandler: fastify.authenticate },
    BrandController.createBrand
  );

  fastify.get(
    "/",
    BrandController.getBrands
  );

  fastify.get(
    "/:id",
    BrandController.getBrandById
  );

  fastify.put(
    "/:id",
    { preHandler: fastify.authenticate },
    BrandController.updateBrand
  );

  fastify.delete(
    "/:id",
    { preHandler: fastify.authenticate },
    BrandController.deleteBrand
  );
}
