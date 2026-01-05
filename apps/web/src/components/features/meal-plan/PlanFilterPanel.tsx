'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten', emoji: '🌾' },
  { id: 'dairy', label: 'Dairy', emoji: '🧀' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'nuts', label: 'Tree Nuts', emoji: '🥜' },
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { id: 'soy', label: 'Soy', emoji: '🫘' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'sesame', label: 'Sesame', emoji: '🌱' },
] as const;

const MAX_TIME_OPTIONS = [
  { value: null, label: 'Any time' },
  { value: 15, label: '15 min or less' },
  { value: 30, label: '30 min or less' },
  { value: 45, label: '45 min or less' },
  { value: 60, label: '1 hour or less' },
  { value: 90, label: '90 min or less' },
] as const;

export interface PlanFilters {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
  maxTotalTime: number | null;
  excludeAllergenTagIds: string[];
  isVegetarian: boolean;
  isDairyFree: boolean;
}

interface PlanFilterPanelProps {
  currentFilters: PlanFilters;
  onFiltersChange: (filters: PlanFilters) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function PlanFilterPanel({
  currentFilters,
  onFiltersChange,
  onRegenerate,
  isRegenerating,
}: PlanFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof PlanFilters>(key: K, value: PlanFilters[K]) => {
    onFiltersChange({ ...currentFilters, [key]: value });
  };

  const toggleAllergen = (allergenId: string) => {
    const current = currentFilters.excludeAllergenTagIds;
    const updated = current.includes(allergenId)
      ? current.filter((a) => a !== allergenId)
      : [...current, allergenId];
    updateFilter('excludeAllergenTagIds', updated);
  };

  const hasActiveFilters =
    currentFilters.difficulty !== null ||
    currentFilters.maxTotalTime !== null ||
    currentFilters.excludeAllergenTagIds.length > 0 ||
    currentFilters.isVegetarian ||
    currentFilters.isDairyFree;

  const activeFilterCount = [
    currentFilters.difficulty !== null,
    currentFilters.maxTotalTime !== null,
    currentFilters.excludeAllergenTagIds.length > 0,
    currentFilters.isVegetarian,
    currentFilters.isDairyFree,
  ].filter(Boolean).length;

  return (
    <Card className="overflow-hidden">
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <div>
            <span className="font-semibold text-gray-900">Adjust Filters</span>
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {activeFilterCount} active
              </span>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-5">
          {/* Dietary preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Dietary Preferences</Label>
            <div className="flex flex-wrap gap-2">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition',
                  currentFilters.isVegetarian
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={currentFilters.isVegetarian}
                  onChange={(e) => updateFilter('isVegetarian', e.target.checked)}
                  className="sr-only"
                  disabled={isRegenerating}
                />
                <span>🌱</span>
                <span>Vegetarian</span>
              </label>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition',
                  currentFilters.isDairyFree
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={currentFilters.isDairyFree}
                  onChange={(e) => updateFilter('isDairyFree', e.target.checked)}
                  className="sr-only"
                  disabled={isRegenerating}
                />
                <span>🥛</span>
                <span>Dairy-free</span>
              </label>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <Label
              htmlFor="filter-difficulty"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Recipe Difficulty
            </Label>
            <div className="relative">
              <select
                id="filter-difficulty"
                value={currentFilters.difficulty ?? ''}
                onChange={(e) =>
                  updateFilter(
                    'difficulty',
                    e.target.value === '' ? null : (e.target.value as 'EASY' | 'MEDIUM' | 'HARD')
                  )
                }
                disabled={isRegenerating}
                className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value="">Any difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* Max cooking time */}
          <div>
            <Label
              htmlFor="filter-maxTime"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Maximum Cooking Time
            </Label>
            <div className="relative">
              <select
                id="filter-maxTime"
                value={currentFilters.maxTotalTime ?? ''}
                onChange={(e) =>
                  updateFilter(
                    'maxTotalTime',
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                disabled={isRegenerating}
                className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 transition hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              >
                {MAX_TIME_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value ?? ''}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* Allergen exclusions */}
          <div>
            <Label className="block text-sm font-semibold text-gray-900 mb-1">
              Exclude Allergens
            </Label>
            <p className="text-xs text-gray-500 mb-3">Select allergens to exclude from recipes</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <label
                  key={allergen.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition',
                    currentFilters.excludeAllergenTagIds.includes(allergen.id)
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                    isRegenerating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={currentFilters.excludeAllergenTagIds.includes(allergen.id)}
                    onChange={() => toggleAllergen(allergen.id)}
                    className="sr-only"
                    disabled={isRegenerating}
                  />
                  <span>{allergen.emoji}</span>
                  <span>{allergen.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Regenerate button */}
          <Button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            variant="premium"
            className="w-full"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Regenerating Plan...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate Plan</span>
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default PlanFilterPanel;
