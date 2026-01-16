import { FastifyInstance } from "fastify";
import BannerController from "../../../../controllers/banner.controller";

export default async function bannerRoutes(
  fastify: FastifyInstance
) {
  /**
   * Create banner (Admin only)
   */
  fastify.post(
    "/",
    { preHandler: fastify.authenticate },
    BannerController.createBanner
  );

  /**
   * Get all banners (Public)
   * Optional query params:
   * - position
   * - type
   * - isActive
   */
  fastify.get(
    "/",
    BannerController.getBanners
  );
  
  fastify.get(
    "/active",
    BannerController.getActiveBanners
  );

  /**
   * Get banner by ID (Public)
   */
  fastify.get(
    "/:id",
    BannerController.getBannerById
  );

  /**
   * Update banner (Admin only)
   */
  fastify.put(
    "/:id",
    { preHandler: fastify.authenticate },
    BannerController.updateBanner
  );

  /**
   * Delete banner (Soft delete) (Admin only)
   */
  fastify.delete(
    "/:id",
    { preHandler: fastify.authenticate },
    BannerController.deleteBanner
  );
}
