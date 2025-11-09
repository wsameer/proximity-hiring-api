import { Hono } from "hono";
import type { AppContext } from "../types/app.js";

const publicRoutes = new Hono<AppContext>();

/**
 * GET /
 * Welcome route with API documentation
 */
publicRoutes.get("/", (c) => {
  return c.json({
    message: "Welcome to Jobximity API",
    version: "1.0.0",
    description: "Hyperlocal, privacy-first hiring platform",
    endpoints: {
      auth: {
        signup: "POST /api/auth/sign-up/email",
        signin: "POST /api/auth/sign-in/email",
        signout: "POST /api/auth/sign-out",
        session: "GET /api/auth/get-session",
      },
      profile: {
        complete: "POST /api/profile/complete (protected)",
        get: "GET /api/profile (protected)",
        update: "PUT /api/profile (protected)",
        status: "GET /api/profile/status (protected)",
      },
      user: {
        me: "GET /api/me (protected)",
        protected: "GET /api/protected (protected)",
      },
      public: {
        hello: "GET /api/hello",
        health: "GET /health",
      },
    },
  });
});

/**
 * GET /api/hello
 * Public hello endpoint, shows user info if authenticated
 */
publicRoutes.get("/api/hello", (c) => {
  const user = c.get("user");

  return c.json({
    ok: true,
    message: user ? `Hello ${user.name}!` : "Hello Jobximity API!",
    authenticated: !!user,
  });
});

/**
 * GET /health
 * Health check endpoint for monitoring
 */
publicRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default publicRoutes;
