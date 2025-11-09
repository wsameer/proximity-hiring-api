DROP INDEX "user_account_type_idx";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "accountType";--> statement-breakpoint
DROP TYPE "public"."account_type";