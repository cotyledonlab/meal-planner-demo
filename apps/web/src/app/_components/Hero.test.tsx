import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ImageProps } from 'next/image';
import Hero from './Hero';

const resolveMockSrc = (source: ImageProps['src']) => {
  if (typeof source === 'string') return source;

  if (
    typeof source === 'object' &&
    source !== null &&
    'src' in source &&
    typeof source.src === 'string'
  ) {
    return source.src;
  }

  if (
    typeof source === 'object' &&
    source !== null &&
    'default' in source &&
    source.default &&
    typeof source.default === 'object' &&
    'src' in source.default &&
    typeof source.default.src === 'string'
  ) {
    return source.default.src;
  }

  return '';
};

// Mock next/image while stripping non-standard DOM props
vi.mock('next/image', () => ({
  default: ({ alt, src, className, ...imageProps }: ImageProps) => {
    const { fill, priority, placeholder, blurDataURL, ...imgProps } = imageProps;

    // Explicitly acknowledge ignored Next.js-only props to satisfy ESLint
    void fill;
    void priority;
    void placeholder;
    void blurDataURL;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={resolveMockSrc(src)} className={className} {...imgProps} />
    );
  },
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

  it('includes background image with proper alt text', () => {
    render(<Hero />);

    const image = screen.getByAltText(/fresh ingredients for home cooking/i);
    expect(image).toBeInTheDocument();
  });
});
