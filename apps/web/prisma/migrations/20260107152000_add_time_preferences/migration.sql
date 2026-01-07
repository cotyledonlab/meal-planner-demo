-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "weeknightMaxTimeMinutes" INTEGER;
ALTER TABLE "UserPreferences" ADD COLUMN     "weeklyTimeBudgetMinutes" INTEGER;
ALTER TABLE "UserPreferences" ADD COLUMN     "prioritizeWeeknights" BOOLEAN NOT NULL DEFAULT true;
