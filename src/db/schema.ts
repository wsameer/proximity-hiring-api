import {
  varchar,
  timestamp,
  boolean,
  pgTable,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),

  // Custom fields for the app
  userType: pgEnum("user_type", ["job_seeker", "job_giver"])(
    "userType"
  ).notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  openForContact: boolean("openForContact").default(true).notNull(),
  contactClosedAt: timestamp("contactClosedAt"),
});
