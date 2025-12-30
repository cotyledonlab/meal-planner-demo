-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RecipeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('PREP', 'COOK', 'REST', 'ASSEMBLE');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "cookTimeMinutes" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" "RecipeDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "prepTimeMinutes" INTEGER,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "sourceAttribution" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "status" "RecipeStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "totalTimeMinutes" INTEGER;

-- CreateTable
CREATE TABLE "GeneratedImage" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "GeneratedImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepType" "StepType" NOT NULL DEFAULT 'COOK',
    "instruction" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "tips" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeNutrition" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbohydrates" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "cholesterol" DOUBLE PRECISION,
    "saturatedFat" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeNutrition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DietTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllergenTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllergenTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeDietTag" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "dietTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeDietTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeAllergenTag" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "allergenTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeAllergenTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStatusHistory" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "status" "RecipeStatus" NOT NULL,
    "changedBy" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeImage" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prompt" TEXT,
    "model" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedImage_createdAt_idx" ON "GeneratedImage"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedImage_createdById_idx" ON "GeneratedImage"("createdById");

-- CreateIndex
CREATE INDEX "RecipeStep_recipeId_stepNumber_idx" ON "RecipeStep"("recipeId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStep_recipeId_stepNumber_key" ON "RecipeStep"("recipeId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeNutrition_recipeId_key" ON "RecipeNutrition"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeNutrition_recipeId_idx" ON "RecipeNutrition"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "DietTag_name_key" ON "DietTag"("name");

-- CreateIndex
CREATE INDEX "DietTag_name_idx" ON "DietTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AllergenTag_name_key" ON "AllergenTag"("name");

-- CreateIndex
CREATE INDEX "AllergenTag_name_idx" ON "AllergenTag"("name");

-- CreateIndex
CREATE INDEX "RecipeDietTag_recipeId_idx" ON "RecipeDietTag"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeDietTag_dietTagId_idx" ON "RecipeDietTag"("dietTagId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeDietTag_recipeId_dietTagId_key" ON "RecipeDietTag"("recipeId", "dietTagId");

-- CreateIndex
CREATE INDEX "RecipeAllergenTag_recipeId_idx" ON "RecipeAllergenTag"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeAllergenTag_allergenTagId_idx" ON "RecipeAllergenTag"("allergenTagId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeAllergenTag_recipeId_allergenTagId_key" ON "RecipeAllergenTag"("recipeId", "allergenTagId");

-- CreateIndex
CREATE INDEX "RecipeStatusHistory_recipeId_createdAt_idx" ON "RecipeStatusHistory"("recipeId", "createdAt");

-- CreateIndex
CREATE INDEX "RecipeImage_recipeId_idx" ON "RecipeImage"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeImage_recipeId_isPrimary_idx" ON "RecipeImage"("recipeId", "isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_status_idx" ON "Recipe"("status");

-- CreateIndex
CREATE INDEX "Recipe_status_publishedAt_idx" ON "Recipe"("status", "publishedAt");

-- AddForeignKey
ALTER TABLE "GeneratedImage" ADD CONSTRAINT "GeneratedImage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeNutrition" ADD CONSTRAINT "RecipeNutrition_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeDietTag" ADD CONSTRAINT "RecipeDietTag_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeDietTag" ADD CONSTRAINT "RecipeDietTag_dietTagId_fkey" FOREIGN KEY ("dietTagId") REFERENCES "DietTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeAllergenTag" ADD CONSTRAINT "RecipeAllergenTag_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeAllergenTag" ADD CONSTRAINT "RecipeAllergenTag_allergenTagId_fkey" FOREIGN KEY ("allergenTagId") REFERENCES "AllergenTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStatusHistory" ADD CONSTRAINT "RecipeStatusHistory_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeImage" ADD CONSTRAINT "RecipeImage_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
