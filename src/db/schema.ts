/**
 * Complete database schema for Jobximity
 * All tables defined here to avoid circular dependencies
 */
import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  integer,
  index,
  uuid,
  unique,
  real,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

// User-related enums
export const verificationLevelEnum = pgEnum("verification_level", [
  "level_0", // no verification this is the default
  "level_1_giver", // verification level 1 only during adding a job listing
]);
export const onlineStatusEnum = pgEnum("online_status", ["online", "offline"]);

// Listing-related enums
export const listingTypeEnum = pgEnum("listing_type", ["job_listing", "job_referral"]);
export const workModeEnum = pgEnum("work_mode", ["remote", "hybrid", "onsite"]);
export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "freelance",
]);

// Match-related enums
export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "accepted",
  "declined",
  "out_of_range",
]);

// Chat-related enums
export const conversationStatusEnum = pgEnum("conversation_status", [
  "active",
  "archived",
  "deleted",
]);

// Moderation-related enums
export const reportTypeEnum = pgEnum("report_type", [
  "profile",
  "listing",
  "message",
  "other",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "action_taken",
  "dismissed",
]);

// ============================================
// USER TABLES
// ============================================

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),

    // Avatar generation TODO: replace with image later
    avatarUrl: text("avatar_url"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    // Profile fields (required by PRD)
    // Note: All users are seekers by default. No account type needed.
    currentEmployer: text("current_employer"),
    currentJobTitle: text("current_job_title"),
    yearsOfExperience: integer("years_of_experience"),
    topSkills: text("top_skills").array().default([]),

    // Verification (everyone starts level_0)
    verificationLevel: verificationLevelEnum()
      .default("level_0")
      .notNull(),

    // Presence tracking
    onlineStatus: onlineStatusEnum()
      .default("offline")
      .notNull(),
    lastSeenAt: timestamp("last_seen_at"),

    // Privacy controls
    isHidden: boolean("is_hidden").default(false).notNull(),
    openForContact: boolean("open_for_contact").default(true).notNull(),
    contactClosedAt: timestamp("contact_closed_at"),
  },
  (table) => [
    index("user_email_idx").on(table.email),
    index("user_online_status_idx").on(table.onlineStatus),
    index("user_verification_level_idx").on(table.verificationLevel),
  ]
);

// ============================================
// AUTH TABLES (BetterAuth)
// ============================================

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
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
      .$onUpdate(() => new Date())
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
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expires_at_idx").on(table.expiresAt),
  ]
);

// ============================================
// LOCATION TABLES
// ============================================

export const userLocation = pgTable(
  "user_location",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    // H3 cell for privacy
    h3Cell: varchar("h3_cell", { length: 15 }).notNull(),

    // Actual coordinates
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),

    // PostGIS geometry column added via migration SQL

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_location_user_id_idx").on(table.userId),
    index("user_location_h3_cell_idx").on(table.h3Cell),
  ]
);

// ============================================
// LISTING TABLES
// ============================================

export const jobListing = pgTable(
  "job_listing",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    listingType: listingTypeEnum().notNull(),

    title: text("title").notNull(),
    description: text("description"),
    industry: text("industry"),
    employerName: text("employer_name").notNull(),

    city: text("city").notNull(),
    workMode: workModeEnum().notNull(),
    employmentType: employmentTypeEnum().notNull(),

    experienceRange: text("experience_range"),
    payRange: text("pay_range"),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("job_listing_user_id_idx").on(table.userId),
    index("job_listing_type_idx").on(table.listingType),
    index("job_listing_is_active_idx").on(table.isActive),
    index("job_listing_city_idx").on(table.city),
  ]
);

export const listingCount = pgTable(
  "listing_count",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),

    activeJobListings: integer("active_job_listings").default(0).notNull(),
    activeJobReferrals: integer("active_job_referrals").default(0).notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

// ============================================
// MATCH TABLES
// ============================================

export const matchRequest = pgTable(
  "match_request",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    targetId: text("target_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    listingId: uuid("listing_id").references(() => jobListing.id, {
      onDelete: "cascade",
    }),

    status: matchStatusEnum().default("pending").notNull(),

    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),

    wasInRangeAtRequest: timestamp("was_in_range_at_request")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("match_request_requester_id_idx").on(table.requesterId),
    index("match_request_target_id_idx").on(table.targetId),
    index("match_request_listing_id_idx").on(table.listingId),
    index("match_request_status_idx").on(table.status),
    unique("unique_match_request").on(
      table.requesterId,
      table.targetId,
      table.listingId
    ),
  ]
);

// ============================================
// CHAT TABLES
// ============================================

export const chatConversation = pgTable(
  "chat_conversation",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    matchId: uuid("match_id")
      .notNull()
      .unique()
      .references(() => matchRequest.id, { onDelete: "cascade" }),

    status: conversationStatusEnum()
      .default("active")
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    archivedAt: timestamp("archived_at"),
  },
  (table) => [
    index("chat_conversation_match_id_idx").on(table.matchId),
    index("chat_conversation_status_idx").on(table.status),
    index("chat_conversation_expires_at_idx").on(table.expiresAt),
  ]
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => chatConversation.id, { onDelete: "cascade" }),

    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    message: text("message").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("chat_message_conversation_id_idx").on(table.conversationId),
    index("chat_message_sender_id_idx").on(table.senderId),
    index("chat_message_created_at_idx").on(table.createdAt),
  ]
);

// ============================================
// MODERATION TABLES
// ============================================

export const report = pgTable(
  "report",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    reportedUserId: text("reported_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    reportType: reportTypeEnum().notNull(),
    reason: text("reason").notNull(),
    status: reportStatusEnum()
      .default("pending")
      .notNull(),

    relatedId: uuid("related_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    index("report_reporter_id_idx").on(table.reporterId),
    index("report_reported_user_id_idx").on(table.reportedUserId),
    index("report_status_idx").on(table.status),
  ]
);

export const userBlock = pgTable(
  "user_block",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    blockedUserId: text("blocked_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    reason: text("reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_block_user_id_idx").on(table.userId),
    index("user_block_blocked_user_id_idx").on(table.blockedUserId),
    unique("unique_user_block").on(table.userId, table.blockedUserId),
  ]
);
