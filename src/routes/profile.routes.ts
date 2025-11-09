/**
 * Profile management routes
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../middleware/auth.js";
import type { AppContext } from "../types/app.js";
import {
  createProfileSchema,
  updateProfileSchema,
} from "../validators/profile.validator.js";
import {
  completeProfile,
  updateProfile,
  getProfile,
  hasCompletedProfile,
} from "../services/profile.service.js";

const profileRoutes = new Hono<AppContext>();

/**
 * POST /api/profile/complete
 * Complete profile after signup
 * @protected
 */
profileRoutes.post(
  "/api/profile/complete",
  requireAuth,
  zValidator("json", createProfileSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    try {
      // Check if profile already completed
      const isComplete = await hasCompletedProfile(user!.id);
      if (isComplete) {
        return c.json(
          {
            error: "Profile already completed",
            message: "Use PUT /api/profile to update your profile",
          },
          400
        );
      }

      const profile = await completeProfile(user!.id, data);

      return c.json({
        message: "Profile completed successfully",
        profile: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          currentEmployer: profile.currentEmployer,
          currentJobTitle: profile.currentJobTitle,
          yearsOfExperience: profile.yearsOfExperience,
          topSkills: profile.topSkills,
          verificationLevel: profile.verificationLevel,
        },
      });
    } catch (error) {
      console.error("Profile completion error:", error);
      return c.json(
        {
          error: "Failed to complete profile",
          message: "An error occurred while completing your profile",
        },
        500
      );
    }
  }
);

/**
 * GET /api/profile
 * Get current user's profile
 * @protected
 */
profileRoutes.get("/api/profile", requireAuth, async (c) => {
  const user = c.get("user");

  try {
    const profile = await getProfile(user!.id);

    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json(
      {
        error: "Failed to fetch profile",
        message: "An error occurred while fetching your profile",
      },
      500
    );
  }
});

/**
 * PUT /api/profile
 * Update user profile
 * @protected
 */
profileRoutes.put(
  "/api/profile",
  requireAuth,
  zValidator("json", updateProfileSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    try {
      const profile = await updateProfile(user!.id, data);

      return c.json({
        message: "Profile updated successfully",
        profile: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          currentEmployer: profile.currentEmployer,
          currentJobTitle: profile.currentJobTitle,
          yearsOfExperience: profile.yearsOfExperience,
          topSkills: profile.topSkills,
          verificationLevel: profile.verificationLevel,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      return c.json(
        {
          error: "Failed to update profile",
          message: "An error occurred while updating your profile",
        },
        500
      );
    }
  }
);

/**
 * GET /api/profile/status
 * Check if profile is completed
 * @protected
 */
profileRoutes.get("/api/profile/status", requireAuth, async (c) => {
  const user = c.get("user");

  try {
    const isComplete = await hasCompletedProfile(user!.id);

    return c.json({
      profileCompleted: isComplete,
    });
  } catch (error) {
    console.error("Profile status check error:", error);
    return c.json(
      {
        error: "Failed to check profile status",
      },
      500
    );
  }
});

export default profileRoutes;
