import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ImageProps } from 'next/image';
import MealPlanView from './MealPlanView';

// Mock next/image to strip Next.js-specific props
vi.mock('next/image', () => ({
  default: ({ alt, src, ...props }: ImageProps) => {
    const { fill, priority, placeholder, blurDataURL, sizes, ...imgProps } = props;
    void fill;
    void priority;
    void placeholder;
    void blurDataURL;
    void sizes;
    const resolvedSrc = typeof src === 'string' ? src : '';
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={resolvedSrc} {...imgProps} />
    );
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock tRPC react
vi.mock('~/trpc/react', () => ({
  api: {
    plan: {
      swapRecipe: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
        }),
      },
    },
  },
}));

describe('MealPlanView', () => {
  const baseRecipe = {
    id: 'recipe-1',
    title: 'Weeknight Pasta',
    imageUrl: null,
    calories: 450,
    servingsDefault: 2,
    minutes: 30,
    instructionsMd: null,
    isVegetarian: false,
    isDairyFree: false,
    ingredients: [
      {
        id: 'ing-1',
        quantity: 1,
        unit: 'cup',
        ingredient: { id: 'i-1', name: 'Pasta', category: 'grain' },
      },
    ],
  };

  const planWithTimes = {
    id: 'plan-1',
    startDate: new Date('2025-01-06T00:00:00.000Z'),
    days: 2,
    items: [
      {
        id: 'item-1',
        dayIndex: 0,
        mealType: 'lunch',
        servings: 2,
        recipe: { ...baseRecipe, id: 'recipe-1', totalTimeMinutes: 20 },
      },
      {
        id: 'item-2',
        dayIndex: 0,
        mealType: 'dinner',
        servings: 2,
        recipe: { ...baseRecipe, id: 'recipe-2', totalTimeMinutes: 30 },
      },
      {
        id: 'item-3',
        dayIndex: 1,
        mealType: 'lunch',
        servings: 2,
        recipe: { ...baseRecipe, id: 'recipe-3', totalTimeMinutes: 40 },
      },
      {
        id: 'item-4',
        dayIndex: 1,
        mealType: 'dinner',
        servings: 2,
        recipe: { ...baseRecipe, id: 'recipe-4', totalTimeMinutes: 10 },
      },
    ],
  };

  it('renders EmptyState when no plan or preferences are provided', () => {
    render(<MealPlanView />);

    expect(screen.getByText("Let's create your first meal plan!")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start planning/i })).toBeInTheDocument();
  });

  it('renders the preview content within EmptyState', () => {
    render(<MealPlanView />);

    expect(screen.getByText("You'll get:")).toBeInTheDocument();
    expect(screen.getByText('7 days of personalized meals')).toBeInTheDocument();
    expect(screen.getByText('Automatic shopping list')).toBeInTheDocument();
    expect(screen.getByText('Nutritional information')).toBeInTheDocument();
    expect(screen.getByText('Step-by-step recipes')).toBeInTheDocument();
  });

  it('renders the EmptyState action link pointing to /planner', () => {
    render(<MealPlanView />);

    const link = screen.getByRole('link', { name: /start planning/i });
    expect(link).toHaveAttribute('href', '/planner');
  });

  it('renders the EmptyState description', () => {
    render(<MealPlanView />);

    expect(
      screen.getByText(/Start planning delicious, healthy meals for the week/)
    ).toBeInTheDocument();
  });

  it('shows weekly total, day totals, and over-budget warning', () => {
    render(
      <MealPlanView
        plan={planWithTimes}
        timePreferences={{
          weeknightMaxTimeMinutes: null,
          weeklyTimeBudgetMinutes: 80,
          prioritizeWeeknights: true,
        }}
      />
    );

    expect(screen.getByText('Weekly total time')).toBeInTheDocument();
    expect(screen.getByText('100 min')).toBeInTheDocument();
    expect(screen.getByText('Time-First')).toBeInTheDocument();
    expect(screen.getByText('Weekly budget set')).toBeInTheDocument();
    expect(screen.getByText('Over weekly budget by 20 min.')).toBeInTheDocument();
    expect(screen.getAllByText(/50 min/)).toHaveLength(2);
  });

  it('hides time-first label when prioritizeWeeknights is disabled', () => {
    render(
      <MealPlanView
        plan={planWithTimes}
        timePreferences={{
          weeknightMaxTimeMinutes: null,
          weeklyTimeBudgetMinutes: null,
          prioritizeWeeknights: false,
        }}
      />
    );

    expect(screen.queryByText('Time-First')).not.toBeInTheDocument();
  });
});
