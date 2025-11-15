import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealPlanWizard from './MealPlanWizard';

describe('MealPlanWizard', () => {
  it('should render all form fields', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} />);

    expect(screen.getByLabelText(/How many people/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How many meals per day/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How many days to plan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vegetarian/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dairy-free/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Foods to avoid/i)).toBeInTheDocument();
  });

  it('should render chevron icons for all select elements', () => {
    const mockOnComplete = vi.fn();
    const { container } = render(<MealPlanWizard onComplete={mockOnComplete} />);

    // Check that all three select elements have the appearance-none class
    const selects = container.querySelectorAll('select.appearance-none');
    expect(selects).toHaveLength(3);

    // Check that all three chevron icons are present
    const chevronIcons = container.querySelectorAll('svg.pointer-events-none');
    expect(chevronIcons).toHaveLength(3);

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

    const householdSelect = screen.getByLabelText(/How many people/i);
    const mealsSelect = screen.getByLabelText(/How many meals per day/i);
    const daysSelect = screen.getByLabelText(/How many days to plan/i);
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
    });
  });

  it('should render close button when onClose is provided', () => {
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText(/Close and return to dashboard/i);
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();
    const mockOnClose = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText(/Close and return to dashboard/i);
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should limit days to 3 for non-premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={false} />);

    const daysSelect = screen.getByLabelText(/How many days to plan/i);
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

    const daysSelect = screen.getByLabelText(/How many days to plan/i);
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
  });

  it('should not display premium notice for premium users', () => {
    const mockOnComplete = vi.fn();
    render(<MealPlanWizard onComplete={mockOnComplete} isPremium={true} />);

    expect(screen.queryByText(/Basic users limited to 3 days/i)).not.toBeInTheDocument();
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
});
