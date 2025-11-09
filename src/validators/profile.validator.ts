/**
 * Profile validation schemas
 */
import { z } from "zod";

export const createProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  currentEmployer: z.string().min(1, "Current employer is required").max(255),
  currentJobTitle: z.string().min(1, "Job title is required").max(255),
  yearsOfExperience: z.number().int().min(0).max(70),
  topSkills: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one skill required")
    .max(5, "Maximum 5 skills allowed"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currentEmployer: z.string().min(1).max(255).optional(),
  currentJobTitle: z.string().min(1).max(255).optional(),
  yearsOfExperience: z.number().int().min(0).max(70).optional(),
  topSkills: z.array(z.string().min(1).max(50)).min(1).max(5).optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
