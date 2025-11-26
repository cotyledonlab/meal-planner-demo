import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MealPlanView from './MealPlanView';

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
});
