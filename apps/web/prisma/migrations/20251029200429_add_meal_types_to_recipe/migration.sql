-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "mealTypes" TEXT[] NOT NULL DEFAULT '{}';
