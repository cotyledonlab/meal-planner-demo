-- Make deprecated Recipe fields nullable for phased migration
-- These fields will be removed in a future migration once all code uses the new fields

-- Make minutes nullable (deprecated: use totalTimeMinutes or prepTimeMinutes + cookTimeMinutes)
ALTER TABLE "Recipe" ALTER COLUMN "minutes" DROP NOT NULL;

-- Make instructionsMd nullable (deprecated: use steps relation)
ALTER TABLE "Recipe" ALTER COLUMN "instructionsMd" DROP NOT NULL;
