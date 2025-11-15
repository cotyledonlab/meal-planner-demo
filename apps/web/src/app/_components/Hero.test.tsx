import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Hero from './Hero';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />,
}));

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

    // Check that all parts of the heading are present
    expect(heading.textContent).toContain('Simplify Your Weekly Meals');
    expect(heading.textContent).toContain('—');
    expect(heading.textContent).toContain('Without Breaking the Bank');
  });

  it('includes a mobile-only line break for better typography', () => {
    const { container } = render(<Hero />);

    const heading = container.querySelector('h1');
    const mobileBreak = heading?.querySelector('br.sm\\:hidden');

    expect(mobileBreak).toBeInTheDocument();
    expect(mobileBreak).toHaveAttribute('aria-hidden', 'true');
  });

  it('wraps "Without Breaking the Bank" to prevent orphaning', () => {
    const { container } = render(<Hero />);

    const heading = container.querySelector('h1');
    const inlineBlock = heading?.querySelector('span.inline-block');

    expect(inlineBlock).toBeInTheDocument();
    expect(inlineBlock?.textContent).toBe('Without Breaking the Bank');
  });

  it('renders call-to-action buttons', () => {
    render(<Hero />);

    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    const signInButton = screen.getByRole('link', { name: /sign in/i });

    expect(getStartedButton).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
    expect(getStartedButton).toHaveAttribute('href', '/auth/signup');
    expect(signInButton).toHaveAttribute('href', '/auth/signin');
  });

  it('renders the subtext', () => {
    render(<Hero />);

    const subtext = screen.getByText(/plan, prep, and shop smarter/i);
    expect(subtext).toBeInTheDocument();
  });

  it('includes background image with proper alt text', () => {
    render(<Hero />);

    const image = screen.getByAltText(/fresh ingredients for home cooking/i);
    expect(image).toBeInTheDocument();
  });
});
