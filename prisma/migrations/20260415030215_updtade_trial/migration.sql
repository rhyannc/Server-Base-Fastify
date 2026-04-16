/*
  Warnings:

  - You are about to drop the column `trailUsed` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."plans" ADD COLUMN     "isTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialDays" TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "trailUsed",
ADD COLUMN     "trialUsed" BOOLEAN NOT NULL DEFAULT false;
