import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ImageProps } from 'next/image';
import RecipeCard from '~/components/features/recipe/RecipeCard';

// Track onError callbacks for testing
let capturedOnError: (() => void) | undefined;
let currentSrc: string | undefined;

// Mock next/image to capture onError and track src changes
vi.mock('next/image', () => ({
  default: ({ alt, src, onError, ...props }: ImageProps & { onError?: () => void }) => {
    capturedOnError = onError;
    currentSrc = typeof src === 'string' ? src : '';
    const { fill, priority, placeholder, blurDataURL, sizes, ...imgProps } = props;
    void fill;
    void priority;
    void placeholder;
    void blurDataURL;
    void sizes;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={currentSrc} data-testid="recipe-image" {...imgProps} />
    );
  },
}));

// Mock recipeUtils
vi.mock('~/lib/recipeUtils', () => ({
  calculateDifficulty: () => 'Easy',
  getDifficultyColor: () => 'bg-green-100 text-green-800',
  RECIPE_PLACEHOLDER_IMAGE: '/images/placeholder-recipe.jpg',
}));

const mockMealPlanItem = {
  id: 'item-1',
  dayIndex: 0,
  mealType: 'dinner',
  servings: 4,
  recipe: {
    id: 'recipe-1',
    title: 'Test Recipe',
    calories: 500,
    minutes: 30,
    imageUrl: 'https://example.com/broken-image.jpg',
    isVegetarian: false,
    isDairyFree: false,
    instructionsMd: null,
    ingredients: [
      {
        id: 'ing-1',
        quantity: 2,
        unit: 'cups',
        ingredient: { id: 'i-1', name: 'Rice', category: 'Grains' },
      },
    ],
  },
};

describe('RecipeCard Component', () => {
  beforeEach(() => {
    capturedOnError = undefined;
    currentSrc = undefined;
  });

  it('renders recipe title and details', () => {
    render(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('dinner')).toBeInTheDocument();
    expect(screen.getByText('500 kcal')).toBeInTheDocument();
  });

  it('displays recipe image with provided URL', () => {
    render(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    const image = screen.getByTestId('recipe-image');
    expect(image).toHaveAttribute('src', 'https://example.com/broken-image.jpg');
  });

  it('falls back to placeholder image on error', () => {
    const { rerender } = render(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    // Simulate image load error
    expect(capturedOnError).toBeDefined();
    capturedOnError?.();

    rerender(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    const image = screen.getByTestId('recipe-image');
    expect(image).toHaveAttribute('src', '/images/placeholder-recipe.jpg');
  });

  it('does not trigger infinite loop when placeholder also fails', () => {
    const { rerender } = render(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    // First error - should switch to placeholder
    capturedOnError?.();
    rerender(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    expect(screen.getByTestId('recipe-image')).toHaveAttribute(
      'src',
      '/images/placeholder-recipe.jpg'
    );

    // Second error - guard should prevent state update
    capturedOnError?.();
    rerender(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    // Should still be placeholder (no change)
    expect(screen.getByTestId('recipe-image')).toHaveAttribute(
      'src',
      '/images/placeholder-recipe.jpg'
    );
  });

  it('resets error state when recipe image changes', () => {
    const { rerender } = render(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);

    // Trigger error to switch to placeholder
    capturedOnError?.();
    rerender(<RecipeCard item={mockMealPlanItem} onOpenDetail={vi.fn()} />);
    expect(screen.getByTestId('recipe-image')).toHaveAttribute(
      'src',
      '/images/placeholder-recipe.jpg'
    );

    // Update item with new recipe image
    const updatedItem = {
      ...mockMealPlanItem,
      recipe: {
        ...mockMealPlanItem.recipe,
        imageUrl: 'https://example.com/new-valid-image.jpg',
      },
    };

    rerender(<RecipeCard item={updatedItem} onOpenDetail={vi.fn()} />);

    // Error state should be reset, showing new image URL
    expect(screen.getByTestId('recipe-image')).toHaveAttribute(
      'src',
      'https://example.com/new-valid-image.jpg'
    );
  });

  it('calls onOpenDetail when clicked', () => {
    const onOpenDetail = vi.fn();
    render(<RecipeCard item={mockMealPlanItem} onOpenDetail={onOpenDetail} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onOpenDetail).toHaveBeenCalledWith(mockMealPlanItem);
  });
});
