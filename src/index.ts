import { Elysia } from "elysia";

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
  .listen(PORT);

console.log(
  `🚀 Server is running at http://0.0.0.0:${app.server?.port}`
);
