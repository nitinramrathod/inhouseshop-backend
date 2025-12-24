import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';

export default fp(async (fastify) => {
  fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // optional: 10MB max file size
    },
  });
});