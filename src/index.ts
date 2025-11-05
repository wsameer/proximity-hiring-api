import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { auth, type Session, type User } from "./lib/auth.js";
import { env } from "./config/env.js";

const app = new Hono<{
  // middleware to save the session and user in a context
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", logger());

// CORS
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

// Wildcard route - add validations for every route
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Mount BetterAuth routes at /api/auth
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Public routes
app.get("/", (c) => {
  return c.json({
    message: "Welcome to Hono + BetterAuth API",
    endpoints: {
      signup: "POST /api/auth/sign-up/email",
      signin: "POST /api/auth/sign-in/email",
      signout: "POST /api/auth/sign-out",
      session: "GET /api/auth/get-session",
    },
  });
});

app.get("/api/hello", (c) => {
  return c.json({
    ok: true,
    message: "Hello Jobximity API!",
  });
});

// Protected routes
app.get("/api/protected", async (c) => {
  return c.json({
    message: "This is a protected route",
    user: "user data here", // get session.user here
  });
});

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

const port = env.PORT;
const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on ${info.address}/${info.port}`);
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
