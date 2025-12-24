import { FastifyPluginAsync } from "fastify";
import authController from "../../../../controllers/auth.controller"

const userRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/login", authController.login);
  fastify.get("/logout", authController.logout);
};

export default userRoutes;
