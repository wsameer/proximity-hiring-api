import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import type { AppContext } from "../types/app.js";

const userRoutes = new Hono<AppContext>();

/**
 * GET /api/me
 * Returns current authenticated user's details
 * @protected
 */
userRoutes.get("/api/me", requireAuth, async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  return c.json({
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      emailVerified: user!.emailVerified,
      image: user!.image,
      createdAt: user!.createdAt,
      updatedAt: user!.updatedAt,
    },
    session: {
      id: session!.id,
      expiresAt: session!.expiresAt,
    },
  });
});

/**
 * GET /api/protected
 * Example protected route
 * @protected
 */
userRoutes.get("/api/protected", requireAuth, async (c) => {
  const user = c.get("user");

  return c.json({
    message: "This is a protected route",
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
    },
  });
});

export default userRoutes;
