import {
  text,
  varchar,
  timestamp,
  boolean,
  pgTable,
  pgEnum,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),

  // Custom fields for proximity hiring
  userType: pgEnum("user_type", ["job_seeker", "job_giver"])(
    "userType"
  ).notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  openForContact: boolean("openForContact").default(true).notNull(),
  contactClosedAt: timestamp("contactClosedAt"),
});
