-- CreateEnum
CREATE TYPE "SkillTier" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "Usage" ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "provider" TEXT;

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "icon" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "tier" "SkillTier" NOT NULL DEFAULT 'FREE',
    "priceUsd" DOUBLE PRECISION,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "installs" INTEGER NOT NULL DEFAULT 0,
    "manifest" JSONB NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillInstall" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillInstall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "SkillInstall_agentId_idx" ON "SkillInstall"("agentId");

-- CreateIndex
CREATE INDEX "SkillInstall_userId_idx" ON "SkillInstall"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillInstall_skillId_agentId_key" ON "SkillInstall"("skillId", "agentId");

-- AddForeignKey
ALTER TABLE "SkillInstall" ADD CONSTRAINT "SkillInstall_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
