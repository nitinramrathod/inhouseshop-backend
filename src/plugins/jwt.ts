import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'ASDF@173*jwt_secret',
  });
  
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        
       await request.jwtVerify();

      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  );
});
