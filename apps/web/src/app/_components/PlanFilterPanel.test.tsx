import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanFilterPanel, {
  type PlanFilters,
  type TimePreferences,
} from '~/components/features/meal-plan/PlanFilterPanel';

const defaultFilters: PlanFilters = {
  difficulty: null,
  maxTotalTime: null,
  excludeAllergenTagIds: [],
  isVegetarian: false,
  isDairyFree: false,
};

const defaultTimePreferences: TimePreferences = {
  weeknightMaxTimeMinutes: null,
  weeklyTimeBudgetMinutes: null,
  prioritizeWeeknights: true,
};

describe('PlanFilterPanel', () => {
  it('should render collapsed by default', () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    expect(screen.getByText('Adjust Filters')).toBeInTheDocument();
    // Should not show filter controls when collapsed
    expect(screen.queryByText('Dietary Preferences')).not.toBeInTheDocument();
  });

  it('should expand when header is clicked', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    // Should now show filter controls
    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('Recipe Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Maximum Cooking Time')).toBeInTheDocument();
    expect(screen.getByText('Time-first planning')).toBeInTheDocument();
    expect(screen.getByText('Exclude Allergens')).toBeInTheDocument();
  });

  it('should call onFiltersChange when vegetarian is toggled', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    // Expand the panel
    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    // Click vegetarian checkbox
    const vegetarianLabel = screen.getByText('Vegetarian');
    await user.click(vegetarianLabel);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      isVegetarian: true,
    });
  });

  it('should call onFiltersChange when difficulty is changed', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    // Expand the panel
    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    // Change difficulty
    const difficultySelect = screen.getByLabelText('Recipe Difficulty');
    await user.selectOptions(difficultySelect, 'EASY');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      difficulty: 'EASY',
    });
  });

  it('should call onRegenerate when regenerate button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    // Expand the panel
    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    // Click regenerate
    const regenerateButton = screen.getByRole('button', { name: /Regenerate Plan/i });
    await user.click(regenerateButton);

    expect(mockOnRegenerate).toHaveBeenCalled();
  });

  it('should show loading state when regenerating', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={true}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    // Expand the panel
    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    expect(screen.getByText('Regenerating Plan...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Regenerating Plan/i })).toBeDisabled();
  });

  it('should show active filter count badge', async () => {
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    const filtersWithActive: PlanFilters = {
      difficulty: 'EASY',
      maxTotalTime: 30,
      excludeAllergenTagIds: ['gluten'],
      isVegetarian: true,
      isDairyFree: false,
    };

    render(
      <PlanFilterPanel
        currentFilters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    // Should show "4 active" badge (difficulty, maxTotalTime, allergens, isVegetarian)
    expect(screen.getByText('4 active')).toBeInTheDocument();
  });

  it('should toggle allergen exclusion when clicked', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    // Expand the panel
    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    // Click gluten allergen
    const glutenLabel = screen.getByText('Gluten');
    await user.click(glutenLabel);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      excludeAllergenTagIds: ['gluten'],
    });
  });

  it('should update time preferences when weeknight max time changes', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={true}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    const weeknightSelect = screen.getByLabelText('Weeknight max time');
    await user.selectOptions(weeknightSelect, '30');

    expect(mockOnTimePreferencesChange).toHaveBeenCalledWith({
      ...defaultTimePreferences,
      weeknightMaxTimeMinutes: 30,
    });
  });

  it('should show premium lock state for free users', async () => {
    const user = userEvent.setup();
    const mockOnFiltersChange = vi.fn();
    const mockOnRegenerate = vi.fn();
    const mockOnTimePreferencesChange = vi.fn();

    render(
      <PlanFilterPanel
        currentFilters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRegenerate={mockOnRegenerate}
        isRegenerating={false}
        isPremium={false}
        timePreferences={defaultTimePreferences}
        onTimePreferencesChange={mockOnTimePreferencesChange}
      />
    );

    const header = screen.getByRole('button', { name: /Adjust Filters/i });
    await user.click(header);

    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    expect(screen.getByLabelText('Weeknight max time')).toBeDisabled();
  });
});
