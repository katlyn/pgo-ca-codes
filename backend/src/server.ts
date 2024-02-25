import fastify from "fastify";
import fastifyCors from "@fastify/cors";

import traps from "@dnlup/fastify-traps";
import fastifyStatic from "@fastify/static";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import routes from "./routes.js";

interface ServerOptions {}

export default async function buildServer(opts: ServerOptions = {}) {
  const server = fastify({ ...opts });

  await server.register(traps, { strict: false });
  await server.register(fastifyCors);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const frontendRoot = join(__dirname, "../../frontend/dist");
  await server.register(fastifyStatic, {
    root: frontendRoot,
  });

  server.setNotFoundHandler(async (_, reply) => {
    return reply.sendFile("404.html");
  });

  await server.register(routes, {
    prefix: "/api",
  });

  return server;
}
