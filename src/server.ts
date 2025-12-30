import Fastify from "fastify";
import app from "./app";

const server = Fastify({
  logger: true,
});

const PORT = Number(process.env.PORT) || 8080;

async function start() {
  try {
    await server.register(app);

    const address = await server.listen({
      port: PORT,
      host: "0.0.0.0", // 🔥 THIS IS CRITICAL
    });

    server.log.info(`🚀 Server listening at ${address}`);

    // Optional: show raw socket binding
    const addr = server.server.address();
    console.log("🔎 Actual socket binding:", addr);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();





