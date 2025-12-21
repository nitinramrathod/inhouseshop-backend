import fp from 'fastify-plugin'
import sensible from '@fastify/sensible'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default fp(async function (
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  fastify.register(sensible)
})

