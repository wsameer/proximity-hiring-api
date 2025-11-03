import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import postgres from "postgres";
import * as schema from "../db/schema";

const connectionString = env.DATABASE_URL!;

// for query purposes
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

// for migrations
export const migrationClient = postgres(connectionString, { max: 1 });
