import { convertToNormalizedUnit, formatQuantity } from '~/lib/unitConverter';

export type ExportIngredient = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
};

export type ExportRecipe = {
  id: string;
  title: string;
  minutes: number;
  calories: number;
  instructionsMd: string;
  isVegetarian: boolean;
  isDairyFree: boolean;
  servingsDefault: number;
  ingredients: ExportIngredient[];
};

export type ExportMealPlanItem = {
  id: string;
  dayIndex: number;
  mealType: string;
  servings: number;
  recipe: ExportRecipe;
};

export type ExportMealPlan = {
  id: string;
  startDate: Date;
  days: number;
  items: ExportMealPlanItem[];
};

export type ExportPlanDay = {
  dayIndex: number;
  date: Date;
  items: ExportMealPlanItem[];
};

const MEAL_TYPE_ORDER = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
  snack: 3,
};

const DEFAULT_MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

/**
 * Normalize a meal plan fetched from the database or API into a structure that
 * is safe to use in server-only contexts (e.g. PDF generation or CSV export).
 */
export function normalizeMealPlanForExport(rawPlan: {
  id: string;
  startDate: Date | string;
  days: number;
  items: Array<{
    id: string;
    dayIndex: number;
    mealType: string;
    servings: number;
    recipe: {
      id: string;
      title: string;
      minutes: number;
      calories: number;
      instructionsMd: string;
      isVegetarian: boolean;
      isDairyFree: boolean;
      servingsDefault: number;
      ingredients: Array<{
        id: string;
        quantity: number;
        unit: string;
        ingredient: {
          id: string;
          name: string;
          category: string;
        };
      }>;
    };
  }>;
}): ExportMealPlan {
  const startDate =
    rawPlan.startDate instanceof Date ? rawPlan.startDate : new Date(rawPlan.startDate);

  return {
    id: rawPlan.id,
    startDate,
    days: rawPlan.days,
    items: rawPlan.items.map((item) => ({
      id: item.id,
      dayIndex: item.dayIndex,
      mealType: item.mealType,
      servings: item.servings,
      recipe: {
        id: item.recipe.id,
        title: item.recipe.title,
        minutes: item.recipe.minutes,
        calories: item.recipe.calories,
        instructionsMd: item.recipe.instructionsMd,
        isVegetarian: item.recipe.isVegetarian,
        isDairyFree: item.recipe.isDairyFree,
        servingsDefault: item.recipe.servingsDefault,
        ingredients: item.recipe.ingredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.ingredient.name,
          category: ingredient.ingredient.category,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        })),
      },
    })),
  };
}

/**
 * Group meal plan items by day index and provide each day with a concrete date.
 */
export function groupPlanByDay(plan: ExportMealPlan): ExportPlanDay[] {
  return Array.from({ length: plan.days }, (_, index) => {
    const dayDate = new Date(plan.startDate.getTime());
    dayDate.setDate(dayDate.getDate() + index);

    const items = plan.items
      .filter((item) => item.dayIndex === index)
      .sort(
        (a, b) =>
          (MEAL_TYPE_ORDER[a.mealType as keyof typeof MEAL_TYPE_ORDER] ?? 99) -
          (MEAL_TYPE_ORDER[b.mealType as keyof typeof MEAL_TYPE_ORDER] ?? 99)
      );

    return {
      dayIndex: index,
      date: dayDate,
      items,
    };
  });
}

/**
 * Derive a friendly plan title and ISO-safe file base name using the start date and duration.
 */
export function buildPlanDateMetadata(
  startDate: Date,
  days: number
): {
  label: string;
  fileSafeSegment: string;
  endDate: Date;
} {
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + Math.max(days - 1, 0));

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const label =
    days > 1
      ? `${formatter.format(startDate)} – ${formatter.format(endDate)}`
      : formatter.format(startDate);

  const fileSafeSegment = [
    startDate.getFullYear(),
    String(startDate.getMonth() + 1).padStart(2, '0'),
    String(startDate.getDate()).padStart(2, '0'),
  ].join('');

  return { label, fileSafeSegment, endDate };
}

/**
 * Create a file name for exports in a predictable format.
 */
export function createPlanFilename(
  prefix: string,
  startDate: Date,
  days: number,
  extension: string
) {
  const { fileSafeSegment } = buildPlanDateMetadata(startDate, days);
  const safePrefix = prefix
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${safePrefix || 'meal-plan'}-${fileSafeSegment}.${extension}`;
}

/**
 * Convert markdown instructions into a condensed list of steps.
 */
export function summarizeInstructions(markdown: string, maxSteps = 6): string[] {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+[\.).]\s+/, ''));

  const deduped: string[] = [];
  for (const line of lines) {
    if (line.length === 0) continue;
    if (deduped.length >= maxSteps) break;
    deduped.push(line);
  }

  return deduped;
}

/**
 * Map meal type keys to a human-friendly label. Falls back to title case if unknown.
 */
export function getMealTypeLabel(mealType: string): string {
  const normalized = mealType.toLowerCase();
  if (DEFAULT_MEAL_TYPE_LABELS[normalized]) {
    return DEFAULT_MEAL_TYPE_LABELS[normalized];
  }

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format an ingredient line with a readable quantity and unit.
 */
export function formatIngredientForExport(quantity: number, unit: string, name: string): string {
  try {
    const normalized = convertToNormalizedUnit(quantity, unit);
    return `${formatQuantity(normalized.quantity, normalized.unit)} ${name}`;
  } catch {
    const rounded = Math.round(quantity * 10) / 10;
    return `${rounded} ${unit} ${name}`.trim();
  }
}
