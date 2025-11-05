import type { Context, Next } from "hono";
import { auth } from "../lib/auth.js";
import type { AppContext } from "../types/app.js";

/**
 * Session middleware - populates user and session in context for all routes
 * This runs on every request and doesn't block - just adds data to context
 */
export const sessionMiddleware = async (
  c: Context<AppContext>,
  next: Next
) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
  } else {
    c.set("user", session.user);
    c.set("session", session.session);
  }

  await next();
};

/**
 * Authentication guard - blocks requests without valid authentication
 * Use this middleware on protected routes that require a logged-in user
 */
export const requireAuth = async (c: Context<AppContext>, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json(
      {
        error: "Unauthorized",
        message: "You must be logged in to access this resource",
      },
      401
    );
  }

  await next();
};
