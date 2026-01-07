type RecipeTimeFields = {
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
};

type PlanItemWithRecipe<TRecipe extends RecipeTimeFields> = {
  recipe: TRecipe;
};

type PlanWithItems<TItem extends PlanItemWithRecipe<RecipeTimeFields>> = {
  items: TItem[];
};

const resolveTotalTimeMinutes = (recipe: RecipeTimeFields): number | null => {
  if (recipe.totalTimeMinutes != null) {
    return recipe.totalTimeMinutes;
  }

  if (recipe.prepTimeMinutes != null || recipe.cookTimeMinutes != null) {
    return (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  }

  return null;
};

const normalizeRecipeTotalTime = <TRecipe extends RecipeTimeFields>(recipe: TRecipe): TRecipe => {
  if (recipe.totalTimeMinutes != null) {
    return recipe;
  }

  const resolved = resolveTotalTimeMinutes(recipe);
  if (resolved == null) {
    return recipe;
  }

  return { ...recipe, totalTimeMinutes: resolved };
};

export const normalizePlanRecipeTimes = <
  TRecipe extends RecipeTimeFields,
  TItem extends PlanItemWithRecipe<TRecipe>,
  TPlan extends PlanWithItems<TItem>,
>(
  plan: TPlan | null
): TPlan | null => {
  if (!plan) {
    return plan;
  }

  const items = plan.items.map((item) => {
    const normalizedRecipe = normalizeRecipeTotalTime(item.recipe);
    if (normalizedRecipe === item.recipe) {
      return item;
    }

    return { ...item, recipe: normalizedRecipe } as TItem;
  });

  return { ...plan, items };
};
