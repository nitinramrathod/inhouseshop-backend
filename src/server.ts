// import fastify from 'fastify';
// import App from './app';
// import {config} from 'dotenv'

// config()

// // try {
// //   process.loadEnvFile()
// // } catch {}

// const server = fastify({ logger: true });
// const port:number = Number(process.env.PORT) || 3001;
// const host:string = '0.0.0.0';
// // const host:string = process.env.HOST || '0.0.0.0';

// server.register(App);

// server.listen({ port,  host }, (err, address) => {
//   if (err) {
//     server.log.error(err);
//     process.exit(1);
//   }
//   console.log(`🚀 Server listening at ${address}`);
// });

import Fastify from "fastify";
import app from "./app";

const server = Fastify({ logger: true });

const PORT = Number(process.env.PORT) || 8081;
const HOST = "0.0.0.0";

async function start() {
  try {
    await server.register(app);

    const address = await server.listen({ port: PORT, host: HOST });

    server.log.info(`🚀 Server listening at ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();




