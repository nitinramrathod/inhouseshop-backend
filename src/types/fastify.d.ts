import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      MONGODB_URI: string
      JWT_SECRET: string
      PORT: string
      CLOUDINARY_API_KEY: string
      CLOUDINARY_API_SECRET: string
      CLOUDINARY_CLOUD_NAME: string
    }
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user: {
      userId: string;
      email: string;
      role?: string;
      iat: number;
      exp: number;
    };
  }
}