-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "mealTypes" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "checked" BOOLEAN NOT NULL DEFAULT false;
