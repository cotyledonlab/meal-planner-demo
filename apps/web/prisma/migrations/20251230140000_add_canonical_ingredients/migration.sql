-- CreateTable
CREATE TABLE "CanonicalIngredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isGlutenFree" BOOLEAN NOT NULL DEFAULT true,
    "isDairyFree" BOOLEAN NOT NULL DEFAULT true,
    "containsGluten" BOOLEAN NOT NULL DEFAULT false,
    "containsDairy" BOOLEAN NOT NULL DEFAULT false,
    "containsEggs" BOOLEAN NOT NULL DEFAULT false,
    "containsNuts" BOOLEAN NOT NULL DEFAULT false,
    "containsPeanuts" BOOLEAN NOT NULL DEFAULT false,
    "containsSoy" BOOLEAN NOT NULL DEFAULT false,
    "containsShellfish" BOOLEAN NOT NULL DEFAULT false,
    "containsFish" BOOLEAN NOT NULL DEFAULT false,
    "containsSesame" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanonicalIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "canonicalIngredientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonicalIngredientAllergen" (
    "id" TEXT NOT NULL,
    "canonicalIngredientId" TEXT NOT NULL,
    "allergenTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanonicalIngredientAllergen_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN "canonicalIngredientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CanonicalIngredient_name_key" ON "CanonicalIngredient"("name");

-- CreateIndex
CREATE INDEX "CanonicalIngredient_category_idx" ON "CanonicalIngredient"("category");

-- CreateIndex
CREATE INDEX "CanonicalIngredient_isVegetarian_isVegan_idx" ON "CanonicalIngredient"("isVegetarian", "isVegan");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientAlias_alias_key" ON "IngredientAlias"("alias");

-- CreateIndex
CREATE INDEX "IngredientAlias_canonicalIngredientId_idx" ON "IngredientAlias"("canonicalIngredientId");

-- CreateIndex
CREATE INDEX "CanonicalIngredientAllergen_canonicalIngredientId_idx" ON "CanonicalIngredientAllergen"("canonicalIngredientId");

-- CreateIndex
CREATE INDEX "CanonicalIngredientAllergen_allergenTagId_idx" ON "CanonicalIngredientAllergen"("allergenTagId");

-- CreateIndex
CREATE UNIQUE INDEX "CanonicalIngredientAllergen_canonicalIngredientId_allergenTagId_key" ON "CanonicalIngredientAllergen"("canonicalIngredientId", "allergenTagId");

-- CreateIndex
CREATE INDEX "Ingredient_canonicalIngredientId_idx" ON "Ingredient"("canonicalIngredientId");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_canonicalIngredientId_fkey" FOREIGN KEY ("canonicalIngredientId") REFERENCES "CanonicalIngredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientAlias" ADD CONSTRAINT "IngredientAlias_canonicalIngredientId_fkey" FOREIGN KEY ("canonicalIngredientId") REFERENCES "CanonicalIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalIngredientAllergen" ADD CONSTRAINT "CanonicalIngredientAllergen_canonicalIngredientId_fkey" FOREIGN KEY ("canonicalIngredientId") REFERENCES "CanonicalIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalIngredientAllergen" ADD CONSTRAINT "CanonicalIngredientAllergen_allergenTagId_fkey" FOREIGN KEY ("allergenTagId") REFERENCES "AllergenTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
