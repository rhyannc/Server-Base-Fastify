-- AlterTable
ALTER TABLE "public"."user_subscriptions" ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "paymentMethodId" TEXT;
