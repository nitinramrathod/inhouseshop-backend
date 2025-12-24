import { FastifyReply, FastifyRequest } from "fastify";
import User from "../models/user.model";

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
      const user = await User.create(request.body);

      const userObj = user.toObject();
    //   delete userObj.password;

      return reply.code(201).send(userObj);
    } catch (error: any) {
      return reply.code(400).send({
        message: error.message,
      });
    }
  }

  /**
   * Get all users todo
   */
  static async getUsers(
    _request: FastifyRequest,
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
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

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
    request: FastifyRequest<{
      Params: { id: string };
      Body: Partial<Record<string, any>>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        request.body,
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
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

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
