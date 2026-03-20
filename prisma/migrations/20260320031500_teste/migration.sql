/*
  Warnings:

  - The primary key for the `user_subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."user_subscriptions" DROP CONSTRAINT "user_subscriptions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_subscriptions_id_seq";
