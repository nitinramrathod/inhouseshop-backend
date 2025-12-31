import UserModel from "../models/user.model";
import { FastifyRequest, FastifyReply } from "fastify";
import { loginSchema } from "../schemas/auth.schema";
import { validateZod } from "../utils/zodValidator";

interface LoginRequestBody {
  email: string;
  password: string;
}

class AuthController {
  static async login(
    request: FastifyRequest<{ Body: LoginRequestBody }>,
    reply: FastifyReply
  ) {
    try {
      const validationResult = validateZod(loginSchema, request.body);

      if (!validationResult.success) {
        return reply
          .code(validationResult.statusCode)
          .send({
            message: validationResult.message,
            errors: validationResult.errors,
          });
      }

      const { email, password } = validationResult.data;

      const user = await UserModel.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        return reply.status(404).send({
          errors: [{ password: "Email or password is incorrect" }],
          message: 'Email or password is incorrect'
        });
      }

      const token = await reply.jwtSign(
        { id: user._id, email: user.email },
        { expiresIn: "48h" }
      );

      return reply.status(200).send({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.firstName,
          email: user.email,
        },
      });
    } catch (err) {
      return reply.status(500).send({
        error: "Failed to login",
        details: err,
      });
    }
  }

  static async logout(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    // Implement later
    return reply.send({ message: "Logout successful" });
  }
}

export default AuthController;
