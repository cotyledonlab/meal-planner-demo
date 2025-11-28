import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Hero from './Hero';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Hero Component', () => {
  it('renders the hero heading with proper text content', () => {
    render(<Hero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the new emotional tagline is present
    expect(heading.textContent).toContain('Your Family, Fed and Happy');
  });

  it('renders call-to-action buttons', () => {
    render(<Hero />);

    const getStartedButton = screen.getByRole('link', { name: /start planning free/i });
    const signInButton = screen.getByRole('link', { name: /sign in/i });

    expect(getStartedButton).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
    expect(getStartedButton).toHaveAttribute('href', '/auth/signup');
    expect(signInButton).toHaveAttribute('href', '/auth/signin');
  });

  it('renders the subtext with emotional messaging', () => {
    render(<Hero />);

    const subtext = screen.getByText(/stop stressing about/i);
    expect(subtext).toBeInTheDocument();
    expect(subtext.textContent).toContain('more time with the people who matter');
  });

  it('includes background illustration with proper aria-label', () => {
    render(<Hero />);

    const image = screen.getByRole('img', {
      name: /family sharing a home-cooked meal together/i,
    });
    expect(image).toBeInTheDocument();
  });
});
