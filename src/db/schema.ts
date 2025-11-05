import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", ["job_seeker", "job_giver"]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),

    // Custom fields for the app
    userType: userTypeEnum().notNull(),
    isHidden: boolean("isHidden").default(false).notNull(),
    openForContact: boolean("openForContact").default(true).notNull(),
    contactClosedAt: timestamp("contactClosedAt"),
  },
  (table) => [
    index("user_email_idx").on(table.email),
    index("user_type_idx").on(table.userType),
  ]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
    index("session_expires_at_idx").on(table.expiresAt),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_idx").on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expires_at_idx").on(table.expiresAt),
  ]
);

// // ============================================
// // 2. JOB SEEKER PROFILES
// // ============================================
// export const jobSeekerProfiles = pgTable(
//   "job_seeker_profile",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     userId: text("userId").notNull().unique()
//       .references(() => users.id, { onDelete: "cascade" }),
//     headline: varchar("headline", { length: 255 }),
//     yearsOfExperience: integer("yearsOfExperience"),
//     topSkills: jsonb("topSkills").$type<string[]>().default(sql`'[]'::jsonb`),
//     customLink1: varchar("customLink1", { length: 500 }),
//     customLink2: varchar("customLink2", { length: 500 }),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//     updatedAt: timestamp("updatedAt").defaultNow().notNull(),
//   },
//   (table) => ({
//     userIdIdx: index("job_seeker_user_id_idx").on(table.userId),
//   })
// );

// // ============================================
// // 3. JOB GIVER PROFILES
// // ============================================
// export const jobGiverProfiles = pgTable(
//   "job_giver_profile",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     userId: text("userId").notNull().unique()
//       .references(() => users.id, { onDelete: "cascade" }),
//     companyName: varchar("companyName", { length: 255 }).notNull(),
//     industry: varchar("industry", { length: 100 }),
//     website: varchar("website", { length: 500 }),
//     responseRate: numeric("responseRate", { precision: 3, scale: 2 }).default("0.00"),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//     updatedAt: timestamp("updatedAt").defaultNow().notNull(),
//   },
//   (table) => ({
//     userIdIdx: index("job_giver_user_id_idx").on(table.userId),
//   })
// );

// // ============================================
// // 4. JOB LISTINGS
// // ============================================
// export const jobListings = pgTable(
//   "job_listing",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     jobGiverId: text("jobGiverId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     title: varchar("title", { length: 255 }).notNull(),
//     description: text("description"),
//     industry: varchar("industry", { length: 100 }),
//     employerName: varchar("employerName", { length: 255 }),
//     location: geography("location", { type: "point" }).notNull(),
//     workMode: pgEnum("work_mode", ["remote", "hybrid", "onsite"])("workMode").notNull(),
//     employmentType: pgEnum("employment_type", ["full_time", "part_time", "contract", "freelance"])("employmentType").notNull(),
//     experienceRange: varchar("experienceRange", { length: 100 }),
//     payRange: varchar("payRange", { length: 100 }),
//     isActive: boolean("isActive").default(true).notNull(),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//     updatedAt: timestamp("updatedAt").defaultNow().notNull(),
//     expiresAt: timestamp("expiresAt"),
//   },
//   (table) => ({
//     jobGiverIdIdx: index("job_listing_job_giver_id_idx").on(table.jobGiverId),
//     locationIdx: index("job_listing_location_idx").using("gist", table.location),
//     isActiveIdx: index("job_listing_is_active_idx").on(table.isActive),
//   })
// );

// // ============================================
// // 5. MATCHES (Job Seeker + Job Giver Connection)
// // ============================================
// export const matches = pgTable(
//   "match",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     jobSeekerId: text("jobSeekerId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     jobGiverId: text("jobGiverId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     jobListingId: uuid("jobListingId").notNull()
//       .references(() => jobListings.id, { onDelete: "cascade" }),
//     status: pgEnum("match_status", ["pending", "accepted", "rejected", "out_of_range"])("status").default("pending").notNull(),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//     updatedAt: timestamp("updatedAt").defaultNow().notNull(),
//     expiresAt: timestamp("expiresAt"),
//   },
//   (table) => ({
//     jobSeekerIdIdx: index("match_job_seeker_id_idx").on(table.jobSeekerId),
//     jobGiverIdIdx: index("match_job_giver_id_idx").on(table.jobGiverId),
//     jobListingIdIdx: index("match_job_listing_id_idx").on(table.jobListingId),
//     statusIdx: index("match_status_idx").on(table.status),
//     uniqueMatch: unique("unique_match").on(table.jobSeekerId, table.jobGiverId, table.jobListingId),
//   })
// );

// // ============================================
// // 6. CHATS (Auto-delete after 7 days)
// // ============================================
// export const chats = pgTable(
//   "chat",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     matchId: uuid("matchId").notNull()
//       .references(() => matches.id, { onDelete: "cascade" }),
//     senderId: text("senderId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     recipientId: text("recipientId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     message: text("message").notNull(),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//     expiresAt: timestamp("expiresAt").defaultNow(), // 7 days from creation
//   },
//   (table) => ({
//     matchIdIdx: index("chat_match_id_idx").on(table.matchId),
//     senderIdIdx: index("chat_sender_id_idx").on(table.senderId),
//     expiresAtIdx: index("chat_expires_at_idx").on(table.expiresAt),
//   })
// );

// // ============================================
// // 7. JOB REFERRALS
// // ============================================
// export const jobReferrals = pgTable(
//   "job_referral",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     createdByUserId: text("createdByUserId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     referredUserEmail: varchar("referredUserEmail", { length: 255 }).notNull(),
//     jobListingId: uuid("jobListingId")
//       .references(() => jobListings.id, { onDelete: "set null" }),
//     jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
//     companyName: varchar("companyName", { length: 255 }).notNull(),
//     message: text("message"),
//     status: pgEnum("referral_status", ["pending", "accepted", "rejected"])("status").default("pending").notNull(),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//     updatedAt: timestamp("updatedAt").defaultNow().notNull(),
//   },
//   (table) => ({
//     createdByUserIdIdx: index("job_referral_created_by_user_id_idx").on(table.createdByUserId),
//     referredEmailIdx: index("job_referral_referred_email_idx").on(table.referredUserEmail),
//     statusIdx: index("job_referral_status_idx").on(table.status),
//   })
// );

// // ============================================
// // 8. USER BLOCKS (Cannot see each other)
// // ============================================
// export const userBlocks = pgTable(
//   "user_block",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     userId: text("userId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     blockedUserId: text("blockedUserId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     reason: varchar("reason", { length: 255 }),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//   },
//   (table) => ({
//     userIdIdx: index("user_block_user_id_idx").on(table.userId),
//     uniqueBlock: unique("unique_block").on(table.userId, table.blockedUserId),
//   })
// );

// // ============================================
// // 9. NOTIFICATIONS
// // ============================================
// export const notifications = pgTable(
//   "notification",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     userId: text("userId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     type: pgEnum("notification_type", ["match", "message", "referral", "system"])("type").notNull(),
//     title: varchar("title", { length: 255 }).notNull(),
//     body: text("body"),
//     relatedId: uuid("relatedId"), // Can reference match, chat, etc.
//     isRead: boolean("isRead").default(false).notNull(),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//   },
//   (table) => ({
//     userIdIdx: index("notification_user_id_idx").on(table.userId),
//     isReadIdx: index("notification_is_read_idx").on(table.isRead),
//   })
// );

// // ============================================
// // 10. ACTIVITY LOG (Audit trail)
// // ============================================
// export const activityLogs = pgTable(
//   "activity_log",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     userId: text("userId").notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     action: varchar("action", { length: 100 }).notNull(),
//     resourceType: varchar("resourceType", { length: 50 }),
//     resourceId: varchar("resourceId", { length: 255 }),
//     details: jsonb("details"),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//   },
//   (table) => ({
//     userIdIdx: index("activity_log_user_id_idx").on(table.userId),
//     createdAtIdx: index("activity_log_created_at_idx").on(table.createdAt),
//   })
// );

// // ============================================
// // RELATIONS (TypeORM-like access patterns)
// // ============================================
// export const usersRelations = relations(users, ({ one, many }) => ({
//   jobSeekerProfile: one(jobSeekerProfiles),
//   jobGiverProfile: one(jobGiverProfiles),
//   jobListings: many(jobListings),
//   matchesAsSeeker: many(matches, { relationName: "seeker" }),
//   matchesAsGiver: many(matches, { relationName: "giver" }),
//   sentChats: many(chats, { relationName: "sender" }),
//   receivedChats: many(chats, { relationName: "recipient" }),
//   referralsCreated: many(jobReferrals),
//   blockedUsers: many(userBlocks, { relationName: "blocker" }),
//   notifications: many(notifications),
//   activityLogs: many(activityLogs),
// }));

// export const jobListingsRelations = relations(jobListings, ({ one, many }) => ({
//   jobGiver: one(users, { fields: [jobListings.jobGiverId], references: [users.id] }),
//   matches: many(matches),
//   referrals: many(jobReferrals),
// }));

// export const matchesRelations = relations(matches, ({ one, many }) => ({
//   jobSeeker: one(users, {
//     fields: [matches.jobSeekerId],
//     references: [users.id],
//     relationName: "seeker"
//   }),
//   jobGiver: one(users, {
//     fields: [matches.jobGiverId],
//     references: [users.id],
//     relationName: "giver"
//   }),
//   jobListing: one(jobListings),
//   chats: many(chats),
// }));

// export const chatsRelations = relations(chats, ({ one }) => ({
//   match: one(matches),
//   sender: one(users, {
//     fields: [chats.senderId],
//     references: [users.id],
//     relationName: "sender"
//   }),
//   recipient: one(users, {
//     fields: [chats.recipientId],
//     references: [users.id],
//     relationName: "recipient"
//   }),
// }));
