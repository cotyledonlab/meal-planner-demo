'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Wand2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ALLERGEN_TAGS, DIET_TAGS } from '@meal-planner-demo/types';
import type { RouterOutputs } from '~/trpc/react';
import { api } from '~/trpc/react';

type AdminRecipe = RouterOutputs['adminRecipe']['get'];

type DraftIngredient = {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
};

type DraftStep = {
  instruction: string;
  stepType?: 'PREP' | 'COOK' | 'REST' | 'ASSEMBLE';
  durationMinutes?: number;
  tips?: string;
};

type DraftNutrition = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
};

type DraftImage = {
  url?: string;
  prompt?: string;
  model?: string;
  altText?: string;
};

type RecipeDraftState = {
  id?: string;
  title: string;
  description: string;
  servingsDefault: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  calories: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  mealTypes: Array<'breakfast' | 'lunch' | 'dinner'>;
  ingredients: DraftIngredient[];
  steps: DraftStep[];
  nutrition?: DraftNutrition;
  dietTags: string[];
  allergenTags: string[];
  image?: DraftImage;
  sourcePrompt?: string;
};

type PromptState = {
  cuisine: string;
  mealTypes: Array<'breakfast' | 'lunch' | 'dinner'>;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  servingsDefault: number;
  totalTimeMinutes: number;
  includeIngredients: string;
  avoidIngredients: string;
  dietTags: string[];
  allergenTags: string[];
};

const MEAL_TYPES: PromptState['mealTypes'] = ['breakfast', 'lunch', 'dinner'];
const DIFFICULTIES: PromptState['difficulty'][] = ['EASY', 'MEDIUM', 'HARD'];

function mapRecipeToDraft(recipe: AdminRecipe): RecipeDraftState {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description ?? '',
    servingsDefault: recipe.servingsDefault,
    prepTimeMinutes: recipe.prepTimeMinutes ?? 0,
    cookTimeMinutes: recipe.cookTimeMinutes ?? 0,
    totalTimeMinutes: recipe.totalTimeMinutes ?? 0,
    calories: recipe.calories,
    difficulty: recipe.difficulty,
    mealTypes: recipe.mealTypes as RecipeDraftState['mealTypes'],
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: ingredient.ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
    steps: recipe.steps.map((step) => ({
      instruction: step.instruction,
      stepType: step.stepType,
      durationMinutes: step.durationMinutes ?? undefined,
      tips: step.tips ?? undefined,
    })),
    nutrition: recipe.nutrition
      ? {
          calories: recipe.nutrition.calories,
          protein: recipe.nutrition.protein,
          carbohydrates: recipe.nutrition.carbohydrates,
          fat: recipe.nutrition.fat,
          fiber: recipe.nutrition.fiber ?? undefined,
          sugar: recipe.nutrition.sugar ?? undefined,
          sodium: recipe.nutrition.sodium ?? undefined,
        }
      : undefined,
    dietTags: recipe.dietTags.map((tag) => tag.dietTag.name),
    allergenTags: recipe.allergenTags.map((tag) => tag.allergenTag.name),
    image: recipe.images[0]
      ? {
          url: recipe.images[0].url,
          prompt: recipe.images[0].prompt ?? undefined,
          model: recipe.images[0].model ?? undefined,
          altText: recipe.images[0].altText ?? undefined,
        }
      : undefined,
  };
}

function createDefaultDraft(): RecipeDraftState {
  return {
    title: '',
    description: '',
    servingsDefault: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    totalTimeMinutes: 30,
    calories: 500,
    difficulty: 'MEDIUM',
    mealTypes: ['dinner'],
    ingredients: [{ name: '', quantity: 1, unit: 'pcs' }],
    steps: [{ instruction: '', stepType: 'COOK' }],
    nutrition: {
      calories: 500,
      protein: 25,
      carbohydrates: 60,
      fat: 18,
    },
    dietTags: [],
    allergenTags: [],
  };
}

function createDefaultPrompt(): PromptState {
  return {
    cuisine: '',
    mealTypes: ['dinner'],
    difficulty: 'MEDIUM',
    servingsDefault: 4,
    totalTimeMinutes: 30,
    includeIngredients: '',
    avoidIngredients: '',
    dietTags: [],
    allergenTags: [],
  };
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function toggleWithMinOne<T>(list: T[], value: T): T[] {
  if (list.includes(value) && list.length === 1) {
    return list;
  }
  return toggleValue(list, value);
}

function parseListInput(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

type ZodIssue = {
  path?: Array<string | number>;
  message?: string;
  code?: string;
  validation?: string;
};

type ZodErrorShape = {
  issues?: ZodIssue[];
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

type TrpcErrorLike = {
  message?: string;
  data?: { zodError?: ZodErrorShape };
};

function normalizeImageUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${trimmed}`;
  }
  return trimmed;
}

function parseZodIssues(message: string): ZodIssue[] | null {
  try {
    const parsed = JSON.parse(message);
    if (Array.isArray(parsed)) {
      return parsed as ZodIssue[];
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.issues)) {
      return parsed.issues as ZodIssue[];
    }
  } catch {
    return null;
  }
  return null;
}

function formatFormError(error: TrpcErrorLike, fallback: string): string {
  const message = error.message?.trim();
  const fieldErrors = error.data?.zodError?.fieldErrors;
  if (fieldErrors?.image?.length) {
    return fieldErrors.image.join(' ');
  }

  const issues = message ? parseZodIssues(message) : null;
  if (issues?.length) {
    const mapped = issues.map((issue) => {
      const path = issue.path?.join('.') ?? '';
      if (path === 'image.url' || issue.message === 'Invalid url') {
        return 'Image URL must be a full URL (include http/https).';
      }
      return issue.message ?? 'Invalid input.';
    });
    return mapped.join(' ');
  }

  if (message) {
    if (message.includes('Invalid url')) {
      return 'Image URL must be a full URL (include http/https).';
    }
    return message;
  }

  return fallback;
}

interface AdminRecipeBuilderClientProps {
  isConfigured: boolean;
  initialRecipe?: AdminRecipe;
}

export default function AdminRecipeBuilderClient({
  isConfigured,
  initialRecipe,
}: AdminRecipeBuilderClientProps) {
  const [draft, setDraft] = useState<RecipeDraftState>(
    initialRecipe ? mapRecipeToDraft(initialRecipe) : createDefaultDraft()
  );
  const [prompt, setPrompt] = useState<PromptState>(createDefaultPrompt());
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(initialRecipe?.id ?? null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imagePromptTouched, setImagePromptTouched] = useState(false);
  const router = useRouter();

  const generateMutation = api.adminRecipe.generateDraft.useMutation({
    onSuccess: (data) => {
      setDraft((prev) => ({
        ...prev,
        ...data,
        dietTags: data.dietTags ?? [],
        allergenTags: data.allergenTags ?? [],
        nutrition: data.nutrition ?? prev.nutrition,
        sourcePrompt: data.sourcePrompt,
      }));
      setFormError(null);
    },
    onError: (error) => {
      setFormError(formatFormError(error, 'Unable to generate a recipe draft.'));
    },
  });

  const saveMutation = api.adminRecipe.saveDraft.useMutation({
    onSuccess: (data) => {
      setLastSavedId(data?.id ?? null);
      setFormError(null);
      toast.success('Draft saved.');
    },
    onError: (error) => {
      setFormError(formatFormError(error, 'Unable to save draft.'));
    },
  });

  const publishMutation = api.adminRecipe.publish.useMutation({
    onSuccess: () => {
      setFormError(null);
      toast.success('Recipe published.');
      router.push('/dashboard/admin/recipes');
    },
    onError: (error) => {
      setFormError(formatFormError(error, 'Unable to publish recipe.'));
    },
  });

  const imageMutation = api.adminImage.generate.useMutation({
    onSuccess: (image) => {
      const normalizedUrl = normalizeImageUrl(image.publicUrl);
      setDraft((prev) => ({
        ...prev,
        image: {
          url: normalizedUrl,
          prompt: image.prompt ?? undefined,
          model: image.model ?? undefined,
          altText: prev.image?.altText,
        },
      }));
      setFormError(null);
      toast.success('Image generated.');
    },
    onError: (error) => {
      setFormError(formatFormError(error, 'Unable to generate image.'));
    },
  });

  const canGenerate = isConfigured && !generateMutation.isPending;
  const canGenerateImage = isConfigured && !imageMutation.isPending;
  const isSaving = saveMutation.isPending || publishMutation.isPending;
  const hasImage = Boolean(draft.image?.url?.trim());

  const title = useMemo(
    () => (initialRecipe ? 'Edit recipe draft' : 'New recipe draft'),
    [initialRecipe]
  );

  useEffect(() => {
    if (imagePromptTouched) return;
    const titleText = draft.title.trim();
    const descriptionText = draft.description.trim();
    if (!titleText && !descriptionText) return;
    const summary = descriptionText ? ` ${descriptionText}` : '';
    setImagePrompt(`Overhead plated shot of ${titleText || 'a finished recipe'}${summary}`.trim());
  }, [draft.title, draft.description, imagePromptTouched]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600">Admin recipe builder</p>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate a structured recipe draft, then review before publishing.
          </p>
        </div>
        <Link
          href="/dashboard/admin/recipes"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Back to list
        </Link>
      </div>

      {formError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Prompt builder</h2>
            {!isConfigured && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Gemini not configured
              </span>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Cuisine
              <input
                className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                value={prompt.cuisine}
                onChange={(event) => setPrompt({ ...prompt, cuisine: event.target.value })}
                placeholder="Mediterranean"
              />
            </label>

            <div>
              <p className="text-sm font-semibold text-gray-700">Meal types</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setPrompt({ ...prompt, mealTypes: toggleWithMinOne(prompt.mealTypes, type) })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      prompt.mealTypes.includes(type)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Difficulty</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPrompt({ ...prompt, difficulty: level })}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      prompt.difficulty === level
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Servings
                <input
                  type="number"
                  min={1}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={prompt.servingsDefault}
                  onChange={(event) =>
                    setPrompt({ ...prompt, servingsDefault: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Total minutes
                <input
                  type="number"
                  min={5}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={prompt.totalTimeMinutes}
                  onChange={(event) =>
                    setPrompt({ ...prompt, totalTimeMinutes: Number(event.target.value) })
                  }
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-700">
              Include ingredients (comma separated)
              <textarea
                className="mt-2 min-h-[90px] w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                value={prompt.includeIngredients}
                onChange={(event) =>
                  setPrompt({ ...prompt, includeIngredients: event.target.value })
                }
              />
            </label>

            <label className="block text-sm font-semibold text-gray-700">
              Avoid ingredients (comma separated)
              <textarea
                className="mt-2 min-h-[90px] w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                value={prompt.avoidIngredients}
                onChange={(event) => setPrompt({ ...prompt, avoidIngredients: event.target.value })}
              />
            </label>

            <div>
              <p className="text-sm font-semibold text-gray-700">Diet tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DIET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setPrompt({ ...prompt, dietTags: toggleValue(prompt.dietTags, tag) })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      prompt.dietTags.includes(tag)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Allergen tags to avoid</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALLERGEN_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setPrompt({ ...prompt, allergenTags: toggleValue(prompt.allergenTags, tag) })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      prompt.allergenTags.includes(tag)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!canGenerate}
              onClick={() => {
                setFormError(null);
                generateMutation.mutate({
                  cuisine: prompt.cuisine.trim() || null,
                  mealTypes: prompt.mealTypes,
                  difficulty: prompt.difficulty,
                  servingsDefault: prompt.servingsDefault,
                  totalTimeMinutes: prompt.totalTimeMinutes,
                  includeIngredients: parseListInput(prompt.includeIngredients),
                  avoidIngredients: parseListInput(prompt.avoidIngredients),
                  dietTags: prompt.dietTags,
                  allergenTags: prompt.allergenTags,
                });
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate draft
                </>
              )}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Draft editor</h2>
            {draft.sourcePrompt && <span className="text-xs text-gray-400">AI draft ready</span>}
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Title
                <input
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Calories
                <input
                  type="number"
                  min={50}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={draft.calories}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      calories: Number(event.target.value),
                      nutrition: draft.nutrition
                        ? { ...draft.nutrition, calories: Number(event.target.value) }
                        : draft.nutrition,
                    })
                  }
                />
              </label>
            </div>

            <label className="text-sm font-semibold text-gray-700">
              Description
              <textarea
                className="mt-2 min-h-[90px] w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-gray-700">
                Servings
                <input
                  type="number"
                  min={1}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={draft.servingsDefault}
                  onChange={(event) =>
                    setDraft({ ...draft, servingsDefault: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Prep minutes
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={draft.prepTimeMinutes}
                  onChange={(event) =>
                    setDraft({ ...draft, prepTimeMinutes: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Cook minutes
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={draft.cookTimeMinutes}
                  onChange={(event) =>
                    setDraft({ ...draft, cookTimeMinutes: Number(event.target.value) })
                  }
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Total minutes
                <input
                  type="number"
                  min={5}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={draft.totalTimeMinutes}
                  onChange={(event) =>
                    setDraft({ ...draft, totalTimeMinutes: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Difficulty
                <select
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  value={draft.difficulty}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      difficulty: event.target.value as RecipeDraftState['difficulty'],
                    })
                  }
                >
                  {DIFFICULTIES.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Meal types</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, mealTypes: toggleWithMinOne(draft.mealTypes, type) })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      draft.mealTypes.includes(type)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Ingredients</p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      ingredients: [...draft.ingredients, { name: '', quantity: 1, unit: 'pcs' }],
                    })
                  }
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Add ingredient
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {draft.ingredients.map((ingredient, index) => (
                  <div key={`ingredient-${index}`} className="grid gap-2 sm:grid-cols-4">
                    <input
                      className="rounded-2xl border border-gray-200 px-3 py-2 text-sm sm:col-span-2"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(event) => {
                        const next = [...draft.ingredients];
                        next[index] = { ...ingredient, name: event.target.value };
                        setDraft({ ...draft, ingredients: next });
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Qty"
                      value={ingredient.quantity}
                      onChange={(event) => {
                        const next = [...draft.ingredients];
                        next[index] = { ...ingredient, quantity: Number(event.target.value) };
                        setDraft({ ...draft, ingredients: next });
                      }}
                    />
                    <input
                      className="rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(event) => {
                        const next = [...draft.ingredients];
                        next[index] = { ...ingredient, unit: event.target.value };
                        setDraft({ ...draft, ingredients: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Steps</p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      steps: [...draft.steps, { instruction: '', stepType: 'COOK' }],
                    })
                  }
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Add step
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {draft.steps.map((step, index) => (
                  <div key={`step-${index}`} className="rounded-2xl border border-gray-100 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">Step {index + 1}</span>
                      <select
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs"
                        value={step.stepType ?? 'COOK'}
                        onChange={(event) => {
                          const next = [...draft.steps];
                          next[index] = {
                            ...step,
                            stepType: event.target.value as DraftStep['stepType'],
                          };
                          setDraft({ ...draft, steps: next });
                        }}
                      >
                        {['PREP', 'COOK', 'REST', 'ASSEMBLE'].map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      className="min-h-[80px] w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Instruction"
                      value={step.instruction}
                      onChange={(event) => {
                        const next = [...draft.steps];
                        next[index] = { ...step, instruction: event.target.value };
                        setDraft({ ...draft, steps: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Diet tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DIET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, dietTags: toggleValue(draft.dietTags, tag) })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      draft.dietTags.includes(tag)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Allergen tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALLERGEN_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        allergenTags: toggleValue(draft.allergenTags, tag),
                      })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      draft.allergenTags.includes(tag)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Nutrition</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      nutrition: draft.nutrition
                        ? undefined
                        : {
                            calories: draft.calories,
                            protein: 20,
                            carbohydrates: 40,
                            fat: 15,
                          },
                    })
                  }
                >
                  {draft.nutrition ? 'Remove nutrition' : 'Add nutrition'}
                </button>
              </div>
              {draft.nutrition && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      'calories',
                      'protein',
                      'carbohydrates',
                      'fat',
                      'fiber',
                      'sugar',
                      'sodium',
                    ] as const
                  ).map((field) => (
                    <label key={field} className="text-xs font-semibold text-gray-600">
                      {field}
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                        value={draft.nutrition?.[field] ?? ''}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setDraft({
                            ...draft,
                            nutrition: {
                              ...(draft.nutrition ?? {
                                calories: draft.calories,
                                protein: 0,
                                carbohydrates: 0,
                                fat: 0,
                              }),
                              [field]: value,
                            },
                          });
                        }}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Image (required)</p>
              <div className="mt-2 space-y-2">
                <label className="text-xs font-semibold text-gray-600">
                  Image prompt
                  <textarea
                    className="mt-1 min-h-[70px] w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Overhead shot of lemon herb chicken with roasted asparagus on a rustic plate..."
                    value={imagePrompt}
                    onChange={(event) => {
                      setImagePromptTouched(true);
                      setImagePrompt(event.target.value);
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={!canGenerateImage}
                  onClick={() => {
                    const fallbackPrompt = draft.title
                      ? `Overhead plated shot of ${draft.title} on a rustic ceramic plate, natural light, shallow depth of field.`
                      : '';
                    const promptValue = imagePrompt.trim() || fallbackPrompt;
                    if (!promptValue) {
                      setFormError('Add an image prompt before generating.');
                      return;
                    }
                    imageMutation.mutate({ prompt: promptValue, aspectRatio: '1:1' });
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {imageMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      Generate image
                    </>
                  )}
                </button>
                {!isConfigured && (
                  <p className="text-xs text-amber-700">
                    Provide <code className="rounded bg-amber-100 px-1">GEMINI_API_KEY</code> to
                    enable image generation.
                  </p>
                )}
                {!hasImage && (
                  <p className="text-xs text-amber-700">
                    Add or generate an image before saving or publishing.
                  </p>
                )}
                <input
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Image URL"
                  value={draft.image?.url ?? ''}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      image: { ...(draft.image ?? {}), url: event.target.value },
                    })
                  }
                />
                <input
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Alt text"
                  value={draft.image?.altText ?? ''}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      image: { ...(draft.image ?? {}), altText: event.target.value },
                    })
                  }
                />
                <div className="text-xs text-gray-500">
                  Generate artwork in{' '}
                  <Link
                    href="/dashboard/admin/images"
                    className="font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    admin images
                  </Link>{' '}
                  and paste the URL here.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isSaving || !hasImage}
                onClick={() => {
                  setFormError(null);
                  const imageUrl = draft.image?.url?.trim();
                  if (!imageUrl) {
                    setFormError('Add an image URL before saving the draft.');
                    return;
                  }
                  const normalizedUrl = normalizeImageUrl(imageUrl);
                  const image = {
                    url: normalizedUrl,
                    prompt: draft.image?.prompt?.trim() ?? undefined,
                    model: draft.image?.model?.trim() ?? undefined,
                    altText: draft.image?.altText?.trim() ?? undefined,
                  };
                  saveMutation.mutate({
                    ...draft,
                    id: lastSavedId ?? draft.id,
                    image,
                    nutrition: draft.nutrition ?? undefined,
                  });
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Save draft
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={!lastSavedId || isSaving || !hasImage}
                onClick={() => {
                  if (!lastSavedId) {
                    setFormError('Save the draft before publishing.');
                    return;
                  }
                  if (!hasImage) {
                    setFormError('Add an image before publishing.');
                    return;
                  }
                  publishMutation.mutate({ id: lastSavedId });
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Publish recipe
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
