-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'LAUNCH', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "config" JSONB,
ADD COLUMN     "customPrompt" TEXT,
ADD COLUMN     "gatewayPid" INTEGER,
ADD COLUMN     "port" INTEGER,
ADD COLUMN     "profilePath" TEXT,
ADD COLUMN     "telegramBotToken" TEXT;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "maxAgents" INTEGER NOT NULL DEFAULT 1,
    "maxTokensPerDay" INTEGER NOT NULL DEFAULT 10000,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
