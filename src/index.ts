import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { env } from "./config/env.js";
import type { AppContext } from "./types/app.js";

// Middleware
import { sessionMiddleware } from "./middleware/auth.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import publicRoutes from "./routes/public.routes.js";

const app = new Hono<AppContext>();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Logger middleware - logs all requests
app.use("*", logger());

// CORS middleware for auth routes
app.use(
  "/api/auth/**",
  cors({
    origin: "http://localhost:3001",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Session middleware - populates user/session in context for all routes
app.use("*", sessionMiddleware);

// ============================================
// MOUNT ROUTES
// ============================================

app.route("/", publicRoutes);
app.route("/", authRoutes);
app.route("/", userRoutes);

const port = env.PORT;
const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
