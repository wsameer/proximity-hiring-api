/**
 * Profile service - Business logic for user profiles
 */
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { user } from "../db/schema.js";
import { generateAvatarUrl } from "../lib/avatar.js";
import type { CreateProfileInput, UpdateProfileInput } from "../validators/profile.validator.js";

/**
 * Complete user profile after signup
 * Called after BetterAuth creates the user
 */
export async function completeProfile(userId: string, data: CreateProfileInput) {
  // Generate avatar from name
  const avatarUrl = generateAvatarUrl(data.name);

  // Update user with profile data
  const [updatedUser] = await db
    .update(user)
    .set({
      name: data.name,
      currentEmployer: data.currentEmployer,
      currentJobTitle: data.currentJobTitle,
      yearsOfExperience: data.yearsOfExperience,
      topSkills: data.topSkills,
      avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return updatedUser;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
  // If name changes, regenerate avatar
  const updates: any = { ...data, updatedAt: new Date() };
  if (data.name) {
    updates.avatarUrl = generateAvatarUrl(data.name);
  }

  const [updatedUser] = await db
    .update(user)
    .set(updates)
    .where(eq(user.id, userId))
    .returning();

  return updatedUser;
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string) {
  const profile = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      avatarUrl: true,
      currentEmployer: true,
      currentJobTitle: true,
      yearsOfExperience: true,
      topSkills: true,
      verificationLevel: true,
      onlineStatus: true,
      lastSeenAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return profile;
}

/**
 * Check if user has completed their profile
 */
export async function hasCompletedProfile(userId: string): Promise<boolean> {
  const profile = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      currentEmployer: true,
      currentJobTitle: true,
      yearsOfExperience: true,
      topSkills: true,
    },
  });

  if (!profile) return false;

  return !!(
    profile.currentEmployer &&
    profile.currentJobTitle &&
    profile.yearsOfExperience !== null &&
    profile.topSkills &&
    profile.topSkills.length > 0
  );
}
