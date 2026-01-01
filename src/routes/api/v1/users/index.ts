import { FastifyInstance } from "fastify";
import UserController from "../../../../controllers/user.controller";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    // { preHandler: fastify.authenticate },
    UserController.createUser
  );

  fastify.get(
    "/",
    { preHandler: fastify.authenticate },
    UserController.getUsers
  );

  fastify.get(
    "/:id",
    { preHandler: fastify.authenticate },
    UserController.getUserById
  );

  fastify.put(
    "/:id",
     { preHandler: fastify.authenticate },
    UserController.updateUser
  );

  fastify.delete(
    "/:id",
     { preHandler: fastify.authenticate },
    UserController.deleteUser
  );
}
