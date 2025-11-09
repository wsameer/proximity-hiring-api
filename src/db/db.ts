import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../config/env.js";
import * as schema from "./schema.js";

const connectionString = env.DATABASE_URL!;

// Connection pool for queries (default max: 10)
const queryClient = postgres(connectionString, { max: 10 });

export const db = drizzle(queryClient, { schema });

// Dedicated connection for migrations (max: 1)
export const migrationClient = postgres(connectionString, { max: 1 });
