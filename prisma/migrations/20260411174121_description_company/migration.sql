/*
  Warnings:

  - You are about to drop the column `paymentMethodId` on the `user_subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `companies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "description" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."user_subscriptions" DROP COLUMN "paymentMethodId";

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "public"."companies"("slug");
