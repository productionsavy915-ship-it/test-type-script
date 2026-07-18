import { Elysia } from "elysia";
import { getRedisClient } from "./utils/redis";

const PORT = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .get("/", () => {
    return {
      message: "Hello World",
      timestamp: new Date().toISOString(),
      status: "ok",
    };
  })
  .get("/health", () => {
    return {
      status: "healthy",
      uptime: process.uptime(),
    };
  })
  .get("/health_redis", async () => {
    try {
      const redis = await getRedisClient();
      const pingResult = await redis.ping();
      return {
        status: "healthy",
        redis: pingResult === "PONG" ? "connected" : "unknown",
      };
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          status: "unhealthy",
          error: error.message || "Failed to connect to Redis Cluster",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
  .listen(PORT);

console.log(
  `🚀 Server is running at http://0.0.0.0:${app.server?.port}`
);
