import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pricing from '~/components/features/landing/Pricing';

describe('Pricing', () => {
  it('should render pricing section with heading', () => {
    render(<Pricing />);

    expect(screen.getByText('Choose what works for your family')).toBeInTheDocument();
    expect(screen.getByText(/Start free – no credit card required/)).toBeInTheDocument();
  });

  it('should render both free and premium tiers', () => {
    render(<Pricing />);

    expect(screen.getByText('Free Tier')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('€4.99')).toBeInTheDocument();
    expect(screen.getByText('€0')).toBeInTheDocument();
  });

  it('should show billing period toggle buttons', () => {
    render(<Pricing />);

    expect(screen.getByRole('button', { name: /Monthly/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Annual/ })).toBeInTheDocument();
  });

  it('should show monthly pricing by default', () => {
    render(<Pricing />);

    expect(screen.getByText('€4.99')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('should toggle to annual pricing when annual button clicked', async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    const annualButton = screen.getByRole('button', { name: /Annual/ });
    await user.click(annualButton);

    expect(screen.getByText('€49')).toBeInTheDocument();
    expect(screen.getByText('/year')).toBeInTheDocument();
  });

  it('should display annual monthly equivalent when annual selected', async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    const annualButton = screen.getByRole('button', { name: /Annual/ });
    await user.click(annualButton);

    expect(screen.getByText(/€4.08\/month billed annually/)).toBeInTheDocument();
  });

  it('should show savings percentage on annual toggle button', () => {
    render(<Pricing />);

    const annualButton = screen.getByRole('button', { name: /Annual/ });
    expect(annualButton).toHaveTextContent('Save 18%');
  });

  it('should display psychological pricing for premium tier', () => {
    render(<Pricing />);

    expect(screen.getByText(/Less than the price of a coffee/)).toBeInTheDocument();
    expect(screen.getByText(/Just €0.17\/day/)).toBeInTheDocument();
    expect(screen.getByText(/Avg. user saves 3 hours and €20\/week/)).toBeInTheDocument();
  });

  it('should show value comparison for premium tier', () => {
    render(<Pricing />);

    expect(screen.getByText('Compare: Meal kit services')).toBeInTheDocument();
    expect(screen.getByText(/€50-80\/week/)).toBeInTheDocument();
    expect(screen.getByText(/vs. Only €4.99\/month/)).toBeInTheDocument();
  });

  it('should update value comparison when toggling to annual', async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    const annualButton = screen.getByRole('button', { name: /Annual/ });
    await user.click(annualButton);

    expect(screen.getByText(/vs. Only €49\/year/)).toBeInTheDocument();
  });

  it('should display trust signals for premium tier', () => {
    render(<Pricing />);

    expect(screen.getByText(/30-day money-back guarantee/)).toBeInTheDocument();
    expect(screen.getByText(/Cancel anytime, no questions asked/)).toBeInTheDocument();
  });

  it('should show social proof message', () => {
    render(<Pricing />);

    expect(screen.getByText(/Join 1,000\+ families saving time & money/)).toBeInTheDocument();
  });

  it('should display premium as most popular', () => {
    render(<Pricing />);

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('should show CTA buttons for both tiers', () => {
    render(<Pricing />);

    expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go Premium' })).toBeInTheDocument();
  });

  it('should link to signup page for free tier', () => {
    render(<Pricing />);

    const freeButton = screen.getByRole('link', { name: 'Get Started' });
    expect(freeButton).toHaveAttribute('href', '/auth/signup');
  });

  it('should link to premium signup for premium tier', () => {
    render(<Pricing />);

    const premiumButton = screen.getByRole('link', { name: 'Go Premium' });
    expect(premiumButton).toHaveAttribute('href', '/auth/signup?tier=premium');
  });

  it('should display all premium features from constants', () => {
    render(<Pricing />);

    expect(screen.getByText('Everything in Free')).toBeInTheDocument();
    expect(
      screen.getByText(/Find the best value supermarkets – save €20\+ weekly/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Advanced customisation for picky eaters/)).toBeInTheDocument();
    expect(screen.getByText(/Multiple meal plans for busy weeks/)).toBeInTheDocument();
    expect(screen.getByText(/Priority support when you need us/)).toBeInTheDocument();
    expect(screen.getByText(/Export and share plans with family/)).toBeInTheDocument();
  });

  it('should display all free tier features from constants', () => {
    render(<Pricing />);

    expect(screen.getByText(/Weekly meal-prep recipes your family will love/)).toBeInTheDocument();
    expect(
      screen.getByText(/Automatic shopping list – never forget ingredients/)
    ).toBeInTheDocument();
    expect(screen.getByText('Basic dietary preferences')).toBeInTheDocument();
    expect(screen.getByText(/Friendly email support/)).toBeInTheDocument();
  });
});
