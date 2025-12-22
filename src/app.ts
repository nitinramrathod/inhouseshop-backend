import path from 'node:path'
import AutoLoad from '@fastify/autoload'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { connectDB } from './config/dbconnect';

// Pass --options via CLI arguments in command to enable these options.
const options: FastifyPluginOptions = {}

export default async function app(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> {
  // Place here your custom code!

   await connectDB();

  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts }
  })

  // This loads all routes defined in routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts }
  })
}

export { options }
