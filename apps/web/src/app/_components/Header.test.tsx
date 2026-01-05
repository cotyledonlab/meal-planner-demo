import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSession } from 'next-auth/react';
import { Header } from '~/components/layout/Header';

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

    render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    // Click to open - Sheet renders content in a portal
    fireEvent.click(button);

    // Menu should be visible (Sheet renders Navigation menu title)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
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

  it('renders sheet overlay when menu is open', () => {
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

    // Open menu
    fireEvent.click(button);

    // Sheet dialog should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes menu when close button is clicked', () => {
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

    // Open menu
    fireEvent.click(button);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-state', 'open');

    // Click close button (Sheet provides one)
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Dialog should be closed (data-state changes to closed)
    expect(dialog).toHaveAttribute('data-state', 'closed');
  });

  it('renders navigation links when sheet is open', () => {
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

    // Open menu
    fireEvent.click(button);

    // Should show navigation links - use getAllByText since Dashboard appears in desktop nav too
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
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

    render(<Header />);
    const button = screen.getByLabelText('Toggle menu');

    fireEvent.click(button);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-state', 'open');

    fireEvent.keyDown(document, { key: 'Escape' });
    // Sheet uses data-state to track open/closed state
    expect(dialog).toHaveAttribute('data-state', 'closed');
  });
});
