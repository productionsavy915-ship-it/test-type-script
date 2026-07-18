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
        status: "healthy redis",
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
  .get("/api_check", async () => {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: "API_BASE_URL is not configured in .env" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const response = await fetch(`${baseUrl}/state-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: "SAVY/L37_01-L-LV-S-S-T2",
        }),
      });

      const data = await response.text();
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch from external API",
          details: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
  .listen(PORT);

console.log(
  `🚀 Server is running at http://0.0.0.0:${app.server?.port}`
);
