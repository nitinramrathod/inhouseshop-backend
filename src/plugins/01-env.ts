import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

export default fp(async (app) => {
  await app.register(fastifyEnv, {
    dotenv: true,
    schema: {
      type: "object",
      required: [
        "MONGODB_URI",
        "JWT_SECRET",
        "PORT",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "HOST",
        "CORS_ORIGIN"
      ],
      properties: {
        MONGODB_URI: { type: "string" },
        JWT_SECRET: { type: "string" },
        PORT: { type: "string" },
        CLOUDINARY_CLOUD_NAME: { type: "string" },
        CLOUDINARY_API_KEY: { type: "string" },
        CLOUDINARY_API_SECRET: { type: "string" },
        HOST: { type: "string" },
        CORS_ORIGIN: { type: "string" }
      }
    }
  });
});
