import fastify from 'fastify';
import App from './app';

try {
  process.loadEnvFile()
} catch {}

const server = fastify({ logger: true });
const port:number = Number(process.env.PORT) || 3001;
const host:string = process.env.HOST || '0.0.0.0';

server.register(App);

server.listen({ port,  host }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});


