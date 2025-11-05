import type { User, Session } from "../lib/auth.js";

// App context type for Hono
export type AppContext = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};
