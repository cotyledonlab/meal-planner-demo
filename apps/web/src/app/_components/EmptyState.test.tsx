import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import EmptyState from '~/components/shared/EmptyState';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('EmptyState', () => {
  // Icon component for testing
  const TestIcon = () => <svg data-testid="test-icon" />;

  describe('basic rendering', () => {
    it('renders icon, title, and description', () => {
      render(
        <EmptyState
          icon={<TestIcon />}
          title="No Items Found"
          description="Add some items to get started."
        />
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'No Items Found' })).toBeInTheDocument();
      expect(screen.getByText('Add some items to get started.')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <EmptyState
          icon={<TestIcon />}
          title="Test Title"
          description="Test description"
          className="my-custom-class"
        />
      );

      const emptyState = container.firstChild;
      expect(emptyState).toHaveClass('my-custom-class');
    });
  });

  describe('icon colors', () => {
    it('applies default emerald color', () => {
      const { container } = render(
        <EmptyState icon={<TestIcon />} title="Test" description="Test" />
      );

      const iconContainer = container.querySelector('.from-emerald-500');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('to-emerald-600');
    });

    it('applies blue color when specified', () => {
      const { container } = render(
        <EmptyState icon={<TestIcon />} title="Test" description="Test" iconColor="blue" />
      );

      const iconContainer = container.querySelector('.from-blue-500');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('to-blue-600');
    });

    it('applies purple color when specified', () => {
      const { container } = render(
        <EmptyState icon={<TestIcon />} title="Test" description="Test" iconColor="purple" />
      );

      const iconContainer = container.querySelector('.from-purple-500');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('to-purple-600');
    });

    it('applies amber color when specified', () => {
      const { container } = render(
        <EmptyState icon={<TestIcon />} title="Test" description="Test" iconColor="amber" />
      );

      const iconContainer = container.querySelector('.from-amber-500');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('to-amber-600');
    });

    it('applies gray color when specified', () => {
      const { container } = render(
        <EmptyState icon={<TestIcon />} title="Test" description="Test" iconColor="gray" />
      );

      const iconContainer = container.querySelector('.from-gray-400');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('to-gray-500');
    });
  });

  describe('primary action with href (link)', () => {
    it('renders link action button when actionHref is provided', () => {
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Create New"
          actionHref="/create"
        />
      );

      const link = screen.getByRole('link', { name: 'Create New' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/create');
    });
  });

  describe('primary action with onClick (button)', () => {
    it('renders button when actionOnClick is provided without actionHref', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Click Me"
          actionOnClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
    });

    it('calls onClick handler when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Click Me"
          actionOnClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prefers actionHref over actionOnClick when both are provided', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Action"
          actionHref="/action"
          actionOnClick={handleClick}
        />
      );

      // Should render as link, not button
      expect(screen.getByRole('link', { name: 'Action' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Action' })).not.toBeInTheDocument();
    });
  });

  describe('secondary action with href (link)', () => {
    it('renders secondary link when secondaryAction.href is provided', () => {
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          secondaryAction={{ label: 'Learn More', href: '/learn' }}
        />
      );

      const link = screen.getByRole('link', { name: 'Learn More' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/learn');
    });
  });

  describe('secondary action with onClick (button)', () => {
    it('renders secondary button when secondaryAction.onClick is provided', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          secondaryAction={{ label: 'Secondary', onClick: handleClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toBeInTheDocument();
    });

    it('calls secondary onClick handler when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          secondaryAction={{ label: 'Secondary', onClick: handleClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Secondary' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prefers secondaryAction.href over onClick when both are provided', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          secondaryAction={{ label: 'Secondary', href: '/secondary', onClick: handleClick }}
        />
      );

      // Should render as link, not button
      expect(screen.getByRole('link', { name: 'Secondary' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Secondary' })).not.toBeInTheDocument();
    });
  });

  describe('both primary and secondary actions', () => {
    it('renders both primary and secondary actions together', () => {
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Primary"
          actionHref="/primary"
          secondaryAction={{ label: 'Secondary', href: '/secondary' }}
        />
      );

      expect(screen.getByRole('link', { name: 'Primary' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Secondary' })).toBeInTheDocument();
    });
  });

  describe('preview content', () => {
    it('renders preview content when provided', () => {
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          preview={<div data-testid="preview-content">Preview Area</div>}
        />
      );

      expect(screen.getByTestId('preview-content')).toBeInTheDocument();
      expect(screen.getByText('Preview Area')).toBeInTheDocument();
    });

    it('does not render preview section when not provided', () => {
      const { container } = render(
        <EmptyState icon={<TestIcon />} title="Test" description="Test" />
      );

      // The preview section should not exist (no mt-8 wrapper for preview)
      const previewWrapper = container.querySelector('.mt-8.w-full');
      expect(previewWrapper).not.toBeInTheDocument();
    });
  });

  describe('no actions', () => {
    it('does not render actions container when no actions are provided', () => {
      const { container } = render(
        <EmptyState icon={<TestIcon />} title="Test" description="Test" />
      );

      // No buttons or links should exist
      expect(screen.queryAllByRole('button')).toHaveLength(0);
      expect(screen.queryAllByRole('link')).toHaveLength(0);

      // Actions container should not be present
      const actionsContainer = container.querySelector('.flex.flex-col.gap-3');
      expect(actionsContainer).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('renders title as h3 heading', () => {
      render(<EmptyState icon={<TestIcon />} title="Accessible Title" description="Test" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Accessible Title');
    });

    it('action button has focus-visible ring', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Focusable Button"
          actionOnClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: 'Focusable Button' });
      // shadcn/ui Button uses ring styles for focus
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('secondary action button has focus-visible ring', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          secondaryAction={{ label: 'Secondary Focus', onClick: handleClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Secondary Focus' });
      // shadcn/ui Button uses ring styles for focus
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('action link renders with accessible href', () => {
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Focusable Link"
          actionHref="/focus"
        />
      );

      const link = screen.getByRole('link', { name: 'Focusable Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/focus');
    });

    it('buttons have minimum height for touch targets', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          icon={<TestIcon />}
          title="Test"
          description="Test"
          actionLabel="Primary"
          actionOnClick={handleClick}
          secondaryAction={{ label: 'Secondary', onClick: handleClick }}
        />
      );

      const primaryButton = screen.getByRole('button', { name: 'Primary' });
      const secondaryButton = screen.getByRole('button', { name: 'Secondary' });

      // Check min-h-[48px] class for 48px touch target
      expect(primaryButton).toHaveClass('min-h-[48px]');
      expect(secondaryButton).toHaveClass('min-h-[48px]');
    });
  });
});
