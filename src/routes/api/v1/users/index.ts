import { FastifyInstance } from "fastify";
import UserController from "../../../../controllers/user.controller";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    UserController.createUser
  );

  fastify.get(
    "/",
    UserController.getUsers
  );

  fastify.get(
    "/:id",
    UserController.getUserById
  );

  fastify.put(
    "/:id",
    UserController.updateUser
  );

  fastify.delete(
    "/:id",
    UserController.deleteUser
  );
}
