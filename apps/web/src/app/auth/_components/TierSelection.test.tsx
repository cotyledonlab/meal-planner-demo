import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TierSelection from './TierSelection';

describe('TierSelection', () => {
  it('should render both premium and free tier options', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByText('Choose your plan')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Free Tier')).toBeInTheDocument();
    expect(screen.getByText('€4.99')).toBeInTheDocument();
    expect(screen.getByText('€0')).toBeInTheDocument();
  });

  it('should show premium as recommended', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('should show payment notice when premium is selected', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(
      screen.getByText(/Payment details will be collected in the next step/)
    ).toBeInTheDocument();
    expect(screen.getByText(/no real charges will be made/)).toBeInTheDocument();
  });

  it('should not show payment notice when free tier is selected', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="basic" onTierSelect={mockOnTierSelect} />);

    expect(screen.queryByText(/Payment details will be collected/)).not.toBeInTheDocument();
  });

  it('should call onTierSelect when premium tier is clicked', async () => {
    const user = userEvent.setup();
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="basic" onTierSelect={mockOnTierSelect} />);

    const premiumButton = screen.getByRole('button', { name: /Premium/ });
    await user.click(premiumButton);

    expect(mockOnTierSelect).toHaveBeenCalledWith('premium');
  });

  it('should call onTierSelect when free tier is clicked', async () => {
    const user = userEvent.setup();
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    const freeButton = screen.getByRole('button', { name: /Free Tier/ });
    await user.click(freeButton);

    expect(mockOnTierSelect).toHaveBeenCalledWith('basic');
  });

  it('should show selected indicator for premium tier', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    const premiumButton = screen.getByRole('button', { name: /Premium/ });
    expect(premiumButton).toHaveTextContent('Selected');
  });

  it('should show selected indicator for free tier', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="basic" onTierSelect={mockOnTierSelect} />);

    const freeButton = screen.getByRole('button', { name: /Free Tier/ });
    expect(freeButton).toHaveTextContent('Selected');
  });

  it('should display premium features from shared constants', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByText('Everything in Free')).toBeInTheDocument();
    expect(screen.getByText(/Find the best value supermarkets/)).toBeInTheDocument();
    expect(screen.getByText(/Advanced customisation for picky eaters/)).toBeInTheDocument();
    expect(screen.getByText(/Multiple meal plans for busy weeks/)).toBeInTheDocument();
  });

  it('should display free tier features from shared constants', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="basic" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByText(/Weekly meal-prep recipes your family will love/)).toBeInTheDocument();
    expect(screen.getByText(/Automatic shopping list/)).toBeInTheDocument();
    expect(screen.getByText('Basic dietary preferences')).toBeInTheDocument();
    expect(screen.getByText(/Friendly email support/)).toBeInTheDocument();
  });

  it('should display psychological pricing elements for premium', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByText(/Less than the price of a coffee/)).toBeInTheDocument();
    expect(screen.getByText(/Just €0.16\/day/)).toBeInTheDocument();
  });

  it('should show value comparison against meal kits', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByText(/Meal kits/)).toBeInTheDocument();
    expect(screen.getByText(/€50-80\/week/)).toBeInTheDocument();
    expect(screen.getByText(/Save €20\/week on groceries/)).toBeInTheDocument();
  });

  it('should show trust signals when premium is selected', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByText(/30-day money-back guarantee/)).toBeInTheDocument();
    expect(screen.getByText(/Cancel anytime, no questions asked/)).toBeInTheDocument();
  });

  it('should show billing period toggle', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    expect(screen.getByRole('button', { name: /Monthly/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Annual/ })).toBeInTheDocument();
  });

  it('should toggle between monthly and annual pricing', async () => {
    const user = userEvent.setup();
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    // Should show monthly price by default
    expect(screen.getByText('€4.99')).toBeInTheDocument();

    // Click annual toggle
    const annualButton = screen.getByRole('button', { name: /Annual/ });
    await user.click(annualButton);

    // Should show annual price
    expect(screen.getByText('€49')).toBeInTheDocument();
    expect(screen.getByText(/€4.08\/month billed annually/)).toBeInTheDocument();
  });

  it('should show savings percentage on annual toggle button', () => {
    const mockOnTierSelect = vi.fn();
    render(<TierSelection selectedTier="premium" onTierSelect={mockOnTierSelect} />);

    const annualButton = screen.getByRole('button', { name: /Annual/ });
    expect(annualButton).toHaveTextContent('Save 18%');
  });
});
