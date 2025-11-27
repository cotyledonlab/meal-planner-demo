import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSession } from 'next-auth/react';
import { Header } from './Header';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Header - Mobile Menu', () => {
  it('renders hamburger button when user is logged in', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Header />);
    const button = screen.getByLabelText('Toggle menu');
    expect(button).toBeInTheDocument();
  });

  it('does not render hamburger button when user is not logged in', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<Header />);
    const button = screen.queryByLabelText('Toggle menu');
    expect(button).not.toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { queryByTestId } = render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    // Menu should be hidden initially
    expect(queryByTestId('mobile-menu-panel')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(button);

    // Menu should be visible
    expect(queryByTestId('mobile-menu-panel')).toBeInTheDocument();

    // Click to close
    fireEvent.click(button);

    // Menu should be hidden
    expect(queryByTestId('mobile-menu-panel')).not.toBeInTheDocument();
  });

  it('changes button styling when menu is open', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    // Button should have default styling
    expect(button).toHaveClass('text-gray-700');
    expect(button).not.toHaveClass('bg-gray-900');

    // Open menu
    fireEvent.click(button);

    // Button should have active styling
    expect(button).toHaveClass('bg-gray-900');
    expect(button).toHaveClass('text-white');
  });

  it('sets aria-expanded attribute correctly', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    // Initially closed
    expect(button).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Close menu
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders backdrop overlay when menu is open', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { getByTestId } = render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    const backdrop = getByTestId('mobile-menu-backdrop');

    // Backdrop should be hidden initially
    expect(backdrop).toHaveClass('pointer-events-none');

    // Open menu
    fireEvent.click(button);

    // Backdrop should be visible
    expect(backdrop).toHaveClass('pointer-events-auto');
    expect(backdrop).toHaveClass('bg-black/40');
    expect(getByTestId('mobile-menu-panel')).toBeInTheDocument();
  });

  it('closes menu when backdrop is clicked', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { queryByTestId, getByTestId } = render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    // Open menu
    fireEvent.click(button);
    expect(getByTestId('mobile-menu-panel')).toBeInTheDocument();

    // Click backdrop
    const backdrop = getByTestId('mobile-menu-backdrop');
    fireEvent.click(backdrop);

    // Menu should be closed
    expect(queryByTestId('mobile-menu-panel')).not.toBeInTheDocument();
  });

  it('applies correct animation classes to menu', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { getByTestId } = render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    // Open menu
    fireEvent.click(button);

    const menu = getByTestId('mobile-menu-panel');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('fixed');
    expect(menu).toHaveClass('right-0');
    expect(menu).toHaveClass('top-16');
    expect(menu).toHaveClass('animate-slide-in-right');
  });

  it('closes the menu when Escape is pressed', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { queryByTestId } = render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    fireEvent.click(button);
    expect(queryByTestId('mobile-menu-panel')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(queryByTestId('mobile-menu-panel')).not.toBeInTheDocument();
  });

  it('closes the menu on a right swipe over 60px', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { queryByTestId, getByTestId } = render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    fireEvent.click(button);
    const menu = getByTestId('mobile-menu-panel');

    fireEvent.touchStart(menu, { touches: [{ clientX: 0 }] });
    fireEvent.touchMove(menu, { touches: [{ clientX: 80 }] });

    expect(queryByTestId('mobile-menu-panel')).not.toBeInTheDocument();
  });

  it('keeps the menu open on a small swipe', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'test-id', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    const { queryByTestId, getByTestId } = render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    fireEvent.click(button);
    const menu = getByTestId('mobile-menu-panel');

    fireEvent.touchStart(menu, { touches: [{ clientX: 20 }] });
    fireEvent.touchMove(menu, { touches: [{ clientX: 60 }] });

    expect(queryByTestId('mobile-menu-panel')).toBeInTheDocument();
  });
});
