import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async (fastify) => {

  const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

  fastify.register(cors, {
    origin: (origin, cb) => {
        // allow REST clients / Postman with no origin
        if (!origin) return cb(null, true);

        if (allowedOrigins.includes(origin)) {
          cb(null, true);
        } else {
          cb(new Error("Not allowed by CORS"), false);
        }
      },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Needed for cookies or Authorization headers
  });
});