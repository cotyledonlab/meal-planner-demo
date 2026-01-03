import {
  getRecipeTotalTime,
  type RecipeStep,
  type StepType,
} from '@meal-planner-demo/types';
import { convertToNormalizedUnit, formatQuantity } from '~/lib/unitConverter';

export type ExportIngredient = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
};

export type ExportRecipeStep = {
  stepNumber: number;
  stepType: StepType;
  instruction: string;
  durationMinutes: number | null;
  tips: string | null;
};

export type ExportDietTag = {
  name: string;
};

export type ExportRecipe = {
  id: string;
  title: string;
  calories: number;
  servingsDefault: number;
  ingredients: ExportIngredient[];

  // New normalized fields
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  totalTimeMinutes: number;
  steps: ExportRecipeStep[];
  dietTags: ExportDietTag[];

  /**
   * @deprecated Use totalTimeMinutes instead
   */
  minutes: number;
  /**
   * @deprecated Use steps instead
   */
  instructionsMd: string;
  /**
   * @deprecated Use dietTags instead
   */
  isVegetarian: boolean;
  /**
   * @deprecated Use dietTags instead
   */
  isDairyFree: boolean;
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

// Raw recipe type from database with both old and new fields
type RawRecipeForExport = {
  id: string;
  title: string;
  calories: number;
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
  // New fields (optional for backward compatibility)
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  steps?: Array<{
    stepNumber: number;
    stepType: StepType;
    instruction: string;
    durationMinutes: number | null;
    tips: string | null;
  }>;
  dietTags?: Array<{ dietTag: { name: string } }>;
  // Legacy fields
  minutes?: number;
  instructionsMd?: string;
  isVegetarian?: boolean;
  isDairyFree?: boolean;
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
    recipe: RawRecipeForExport;
  }>;
}): ExportMealPlan {
  const startDate =
    rawPlan.startDate instanceof Date ? rawPlan.startDate : new Date(rawPlan.startDate);

  return {
    id: rawPlan.id,
    startDate,
    days: rawPlan.days,
    items: rawPlan.items.map((item) => {
      const recipe = item.recipe;
      const totalTime = getRecipeTotalTime(recipe);

      // Convert steps from relation or parse from markdown
      const steps: ExportRecipeStep[] =
        recipe.steps && recipe.steps.length > 0
          ? recipe.steps.map((s) => ({
              stepNumber: s.stepNumber,
              stepType: s.stepType,
              instruction: s.instruction,
              durationMinutes: s.durationMinutes,
              tips: s.tips,
            }))
          : parseInstructionsToSteps(recipe.instructionsMd ?? '');

      // Extract diet tags from relation or compute from legacy fields
      const dietTags: ExportDietTag[] = recipe.dietTags
        ? recipe.dietTags.map((dt) => ({ name: dt.dietTag.name }))
        : computeLegacyDietTags(recipe);

      // Check diet properties using new tags or legacy fields
      const isVegetarian = dietTags.some((t) => t.name.toLowerCase() === 'vegetarian') ||
        recipe.isVegetarian === true;
      const isDairyFree = dietTags.some((t) => t.name.toLowerCase() === 'dairy-free') ||
        recipe.isDairyFree === true;

      return {
        id: item.id,
        dayIndex: item.dayIndex,
        mealType: item.mealType,
        servings: item.servings,
        recipe: {
          id: recipe.id,
          title: recipe.title,
          calories: recipe.calories,
          servingsDefault: recipe.servingsDefault,
          ingredients: recipe.ingredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.ingredient.name,
            category: ingredient.ingredient.category,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
          // New fields
          prepTimeMinutes: recipe.prepTimeMinutes ?? null,
          cookTimeMinutes: recipe.cookTimeMinutes ?? null,
          totalTimeMinutes: totalTime,
          steps,
          dietTags,
          // Legacy fields (for backward compatibility)
          minutes: totalTime,
          instructionsMd: recipe.instructionsMd ?? stepsToMarkdown(steps),
          isVegetarian,
          isDairyFree,
        },
      };
    }),
  };
}

/**
 * Parse markdown instructions into step objects (fallback for legacy data)
 */
function parseInstructionsToSteps(markdown: string): ExportRecipeStep[] {
  if (!markdown) return [];

  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+[\.).]\s+/, ''));

  return lines.map((instruction, index) => ({
    stepNumber: index + 1,
    stepType: 'PREP' as StepType,
    instruction,
    durationMinutes: null,
    tips: null,
  }));
}

/**
 * Convert steps back to markdown (for legacy field compatibility)
 */
function stepsToMarkdown(steps: ExportRecipeStep[]): string {
  return steps
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map((step) => `${step.stepNumber}. ${step.instruction}`)
    .join('\n');
}

/**
 * Compute diet tags from legacy boolean fields
 */
function computeLegacyDietTags(recipe: RawRecipeForExport): ExportDietTag[] {
  const tags: ExportDietTag[] = [];
  if (recipe.isVegetarian) tags.push({ name: 'vegetarian' });
  if (recipe.isDairyFree) tags.push({ name: 'dairy-free' });
  return tags;
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
 * Get instructions from recipe (prefers steps array, falls back to markdown)
 */
export function getInstructionsFromRecipe(
  recipe: { steps?: ExportRecipeStep[]; instructionsMd?: string },
  maxSteps = 6
): string[] {
  // Prefer structured steps
  if (recipe.steps && recipe.steps.length > 0) {
    return recipe.steps
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .slice(0, maxSteps)
      .map((step) => step.instruction);
  }

  // Fall back to parsing markdown
  return summarizeInstructions(recipe.instructionsMd ?? '', maxSteps);
}

/**
 * Convert markdown instructions into a condensed list of steps.
 * @deprecated Use getInstructionsFromRecipe instead
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
 * Check if recipe has a specific diet tag
 */
export function hasDietTagInExport(recipe: ExportRecipe, tagName: string): boolean {
  return recipe.dietTags.some((t) => t.name.toLowerCase() === tagName.toLowerCase());
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
