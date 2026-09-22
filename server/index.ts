import { createServer } from "http";
import { config } from "./src/config";
import { logger } from "./src/utils/logger";
import { createWsServer } from "./src/ws/server";

console.log("Server Started!");

const server = createServer();
const wss = createWsServer(server);

function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  wss.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force-exit if graceful shutdown hangs
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", err => {
  logger.error("Uncaught exception", { error: String(err) });
  process.exit(1);
});

process.on("unhandledRejection", reason => {
  logger.error("Unhandled rejection", { reason: String(reason) });
});

server.listen(config.port);
console.log(`Listening on port ${config.port}`);
