import { FastifyReply, FastifyRequest } from "fastify";
import User from "../models/user.model";
import { validateZod } from "../utils/zodValidator";
import { createUserSchema } from "../schemas/user.schema";

/**
 * Controller for User CRUD operations
 */
export default class UserController {
  /**
   * Create a new user
   */
  static async createUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const validationResult = validateZod(
      createUserSchema,
      request.body
    );

    if (!validationResult.success) {
      return reply
        .code(validationResult.statusCode)
        .send({
          message: validationResult.message,
          errors: validationResult.errors,
        });
    }

    const {email} = validationResult.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return reply.code(409).send({
        message: "Email already registered",
      });
    }

    const newUser = await User.create(validationResult.data);
    
    const { password, _id, ...safeUser } = newUser.toObject();    

    return reply.code(201).send({ user: safeUser });

  } catch (error: any) {
    console.error(error);
    return reply.code(500).send({
      message: "Internal Server Error",
    });
  }
}

  /**
   * Get all users todo
   */
  static async getUsers(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      return reply.send(users);
    } catch (error: any) {
      return reply.code(500).send({
        message: error.message,
      });
    }
  }

  /**
   * Get single user by ID
   */
  static async getUserById(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params as { id: string };

      const user = await User.findById(id).select("-password");

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }

      return reply.send(user);
    } catch (error: any) {
      return reply.code(400).send({
        message: "Invalid user ID",
      });
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any

      const updatedUser = await User.findByIdAndUpdate(
        id,
        body,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      if (!updatedUser) {
        return reply.code(404).send({ message: "User not found" });
      }

      return reply.send(updatedUser);
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }

  /**
   * Delete (soft delete) user
   */
  static async deleteUser(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params as { id: string };

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      ).select("-password");

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }

      return reply.send({
        message: "User deactivated successfully",
      });
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }
}
