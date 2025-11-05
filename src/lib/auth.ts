import { betterAuth } from "better-auth";
import { env } from "../config/env.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db.js";

export const auth = betterAuth({
  appName: "jobximity",

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // no automatic signing after successful sign up
    requireEmailVerification: true,
  },

  trustedOrigins: ["http://localhost:3000"],
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
