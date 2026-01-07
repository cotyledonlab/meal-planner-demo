import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealPlanWizard from '~/components/features/meal-plan/MealPlanWizard';

describe('MealPlanWizard', () => {
  it('should render all form fields', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} />);

    expect(screen.getByLabelText(/Who's joining you for meals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How often do you want to cook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How far ahead should we plan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vegetarian/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dairy-free/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Anything you'd rather skip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weeknight max time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weekly time budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioritize quicker weeknights/i)).toBeInTheDocument();
  });

  it('should render chevron icons for all select elements', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(<MealPlanWizard onComplete={mockOnComplete} />);

    // Check that all select elements have the appearance-none class
    const selects = container.querySelectorAll('select.appearance-none');
    expect(selects).toHaveLength(4);

    // Check that all chevron icons are present
    const chevronIcons = container.querySelectorAll('svg.pointer-events-none');
    expect(chevronIcons).toHaveLength(4);

    // Verify chevrons are positioned correctly
    chevronIcons.forEach((icon) => {
      expect(icon.parentElement?.classList.contains('relative')).toBe(true);
      expect(icon.classList.contains('absolute')).toBe(true);
      expect(icon.classList.contains('right-4')).toBe(true);
    });
  });

  it('should have proper padding on select elements to accommodate chevron icons', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(<MealPlanWizard onComplete={mockOnComplete} />);

    const selects = container.querySelectorAll('select.appearance-none');
    selects.forEach((select) => {
      // Verify right padding is added (pr-12) to prevent text overlap with icon
      expect(select.classList.contains('pr-12')).toBe(true);
    });
  });

  it('should call onComplete with correct values when form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} />);

    const householdSelect = screen.getByLabelText(/Who's joining you for meals/i);
    const mealsSelect = screen.getByLabelText(/How often do you want to cook/i);
    const daysSelect = screen.getByLabelText(/How far ahead should we plan/i);
    const vegetarianCheckbox = screen.getByLabelText(/Vegetarian/i);
    const submitButton = screen.getByRole('button', { name: /Create My Plan/i });

    await user.selectOptions(householdSelect, '4');
    await user.selectOptions(mealsSelect, '2');
    await user.selectOptions(daysSelect, '3');
    await user.click(vegetarianCheckbox);
    await user.click(submitButton);

    expect(mockOnComplete).toHaveBeenCalledWith({
      householdSize: 4,
      mealsPerDay: 2,
      days: 3,
      isVegetarian: true,
      isDairyFree: false,
      dislikes: '',
      weeknightMaxTimeMinutes: null,
      weeklyTimeBudgetMinutes: null,
      prioritizeWeeknights: true,
      // Advanced filters (defaults)
      difficulty: null,
      maxTotalTime: null,
      excludeAllergens: [],
    });
  });

  it('should render close button when onClose is provided', () => {
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText(/Cancel and return to dashboard/i);
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText(/Cancel and return to dashboard/i);
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should limit days to 3 for non-premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={false} />);

    const daysSelect = screen.getByLabelText(/How far ahead should we plan/i);
    const options = Array.from((daysSelect as HTMLSelectElement).options);

    // Check that options 4-7 are disabled for non-premium users
    expect(options.find((opt) => opt.value === '4')?.disabled).toBe(true);
    expect(options.find((opt) => opt.value === '5')?.disabled).toBe(true);
    expect(options.find((opt) => opt.value === '6')?.disabled).toBe(true);
    expect(options.find((opt) => opt.value === '7')?.disabled).toBe(true);
    expect(options.find((opt) => opt.value === '3')?.disabled).toBe(false);
  });

  it('should allow all day options for premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={true} />);

    const daysSelect = screen.getByLabelText(/How far ahead should we plan/i);
    const options = Array.from((daysSelect as HTMLSelectElement).options);

    // Check that all options are enabled for premium users
    options.forEach((option) => {
      expect(option.disabled).toBe(false);
    });
  });

  it('should display premium notice for non-premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={false} />);

    expect(screen.getByText(/Basic users limited to 3 days/i)).toBeInTheDocument();
    expect(screen.getByText(/Upgrade to premium for 4-7 day plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlock time-first planning with Premium/i)).toBeInTheDocument();
  });

  it('should not display premium notice for premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={true} />);

    expect(screen.queryByText(/Basic users limited to 3 days/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Unlock time-first planning with Premium/i)).not.toBeInTheDocument();
  });

  it('should disable time-first controls for non-premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={false} />);

    expect(screen.getByLabelText(/Weeknight max time/i)).toBeDisabled();
    expect(screen.getByLabelText(/Weekly time budget/i)).toBeDisabled();
  });

  it('should enable time-first controls for premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={true} />);

    expect(screen.getByLabelText(/Weeknight max time/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Weekly time budget/i)).not.toBeDisabled();
  });

  it('should maintain accessibility with chevron icons', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(<MealPlanWizard onComplete={mockOnComplete} />);

    // Verify chevron icons have aria-hidden to prevent screen reader announcement
    const chevronIcons = container.querySelectorAll('svg.pointer-events-none');
    chevronIcons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('should have enhanced visual feedback for checkboxes on mobile', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(<MealPlanWizard onComplete={mockOnComplete} />);

    const vegetarianCheckbox = container.querySelector('#isVegetarian');
    const dairyFreeCheckbox = container.querySelector('#isDairyFree');

    // Verify larger checkbox size (28px instead of 24px)
    expect(vegetarianCheckbox?.classList.contains('h-7')).toBe(true);
    expect(vegetarianCheckbox?.classList.contains('w-7')).toBe(true);
    expect(dairyFreeCheckbox?.classList.contains('h-7')).toBe(true);
    expect(dairyFreeCheckbox?.classList.contains('w-7')).toBe(true);

    // Verify background fill when checked
    expect(vegetarianCheckbox?.classList.contains('checked:bg-emerald-600')).toBe(true);
    expect(vegetarianCheckbox?.classList.contains('checked:border-emerald-600')).toBe(true);
    expect(dairyFreeCheckbox?.classList.contains('checked:bg-emerald-600')).toBe(true);
    expect(dairyFreeCheckbox?.classList.contains('checked:border-emerald-600')).toBe(true);

    // Verify transition animation
    expect(vegetarianCheckbox?.classList.contains('transition-all')).toBe(true);
    expect(dairyFreeCheckbox?.classList.contains('transition-all')).toBe(true);

    // Verify scale animation on tap
    expect(vegetarianCheckbox?.classList.contains('active:scale-90')).toBe(true);
    expect(dairyFreeCheckbox?.classList.contains('active:scale-90')).toBe(true);
  });

  it('should have scale animation on parent label for touch feedback', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(<MealPlanWizard onComplete={mockOnComplete} />);

    const vegetarianLabel = container.querySelector('label[for="isVegetarian"]');
    const dairyFreeLabel = container.querySelector('label[for="isDairyFree"]');

    // Verify parent label has active scale for better touch feedback
    expect(vegetarianLabel?.classList.contains('active:scale-[0.98]')).toBe(true);
    expect(dairyFreeLabel?.classList.contains('active:scale-[0.98]')).toBe(true);
  });

  it('should render persistent header with MealMind branding', () => {
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    const { container } = render(
      <MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />
    );

    expect(screen.getByText('MealMind')).toBeInTheDocument();

    // Check for the header (sticky top-0) containing the brand icon and name
    const header = container.querySelector('.sticky.top-0');
    expect(header).toBeInTheDocument();
    expect(header?.textContent).toContain('MealMind');
    // Check for the SVG icon in the header
    expect(header?.querySelector('svg')).toBeInTheDocument();
  });

  it('should render progress indicator showing Step 1 of 1', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} />);

    expect(screen.getByText('Step 1 of 1')).toBeInTheDocument();
  });

  it('should render Cancel button text instead of X icon', () => {
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    expect(
      screen.getByRole('button', { name: /Cancel and return to dashboard/i })
    ).toHaveTextContent('Cancel');
  });

  it('should show confirmation dialog when closing with user input', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    // Make a change to the form
    const householdSelect = screen.getByLabelText(/Who's joining you for meals/i);
    await user.selectOptions(householdSelect, '4');

    // Click cancel button
    const closeButton = screen.getByLabelText(/Cancel and return to dashboard/i);
    await user.click(closeButton);

    // Should show confirmation dialog
    expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should not show confirmation dialog when closing without user input', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    // Click cancel button without making any changes
    const closeButton = screen.getByLabelText(/Cancel and return to dashboard/i);
    await user.click(closeButton);

    // Should not show confirmation dialog
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close wizard when user confirms discard in confirmation dialog', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    // Make a change to the form
    const householdSelect = screen.getByLabelText(/Who's joining you for meals/i);
    await user.selectOptions(householdSelect, '4');

    // Click cancel button
    const closeButton = screen.getByLabelText(/Cancel and return to dashboard/i);
    await user.click(closeButton);

    // Click Discard button in confirmation dialog
    const discardButton = screen.getByRole('button', { name: /Discard/i });
    await user.click(discardButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not close wizard when user cancels discard in confirmation dialog', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    // Make a change to the form
    const householdSelect = screen.getByLabelText(/Who's joining you for meals/i);
    await user.selectOptions(householdSelect, '4');

    // Click cancel button
    const closeButton = screen.getByLabelText(/Cancel and return to dashboard/i);
    await user.click(closeButton);

    // Click Keep Editing button in confirmation dialog
    const keepEditingButton = screen.getByRole('button', { name: /Keep Editing/i });
    await user.click(keepEditingButton);

    // Dialog should be closed but wizard should still be open
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
