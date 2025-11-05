import { Hono } from "hono";
import { auth } from "../lib/auth.js";
import type { AppContext } from "../types/app.js";

const authRoutes = new Hono<AppContext>();

/**
 * Mount all BetterAuth routes
 * Handles sign-up, sign-in, sign-out, session management, etc.
 */
authRoutes.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRoutes;
