import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../config/env";
import * as schema from "./schema";

const connectionString = env.DATABASE_URL!;

// for query purposes
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

// for migrations
export const migrationClient = postgres(connectionString, { max: 1 });
