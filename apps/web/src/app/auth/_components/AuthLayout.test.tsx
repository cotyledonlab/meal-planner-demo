import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AuthLayout from './AuthLayout';

describe('AuthLayout', () => {
  it('renders with full marketing content by default', () => {
    render(
      <AuthLayout title="Test Title" subtitle="Test subtitle">
        <div>Test content</div>
      </AuthLayout>
    );

    // Check that marketing content is visible
    expect(screen.getByText('Your AI-powered meal planning assistant')).toBeInTheDocument();
    expect(
      screen.getByText('Generate personalized 7-day meal plans in seconds')
    ).toBeInTheDocument();
    expect(screen.getByText('Automatic shopping lists with smart ingredients')).toBeInTheDocument();
    expect(screen.getByText('Tailored to your dietary needs and preferences')).toBeInTheDocument();

    // Check that title and subtitle are rendered
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('renders with minimal branding when showMarketing is false', () => {
    render(
      <AuthLayout title="Test Title" subtitle="Test subtitle" showMarketing={false}>
        <div>Test content</div>
      </AuthLayout>
    );

    // Check that minimal tagline is visible instead of marketing content
    expect(screen.getByText('Smart meal planning made simple')).toBeInTheDocument();

    // Check that marketing bullets are NOT visible
    expect(screen.queryByText('Your AI-powered meal planning assistant')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Generate personalized 7-day meal plans in seconds')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Automatic shopping lists with smart ingredients')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Tailored to your dietary needs and preferences')
    ).not.toBeInTheDocument();

    // Check that title and subtitle are still rendered
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('renders with full marketing content when showMarketing is true', () => {
    render(
      <AuthLayout title="Test Title" showMarketing={true}>
        <div>Test content</div>
      </AuthLayout>
    );

    // Check that marketing content is visible
    expect(screen.getByText('Your AI-powered meal planning assistant')).toBeInTheDocument();
    expect(
      screen.getByText('Generate personalized 7-day meal plans in seconds')
    ).toBeInTheDocument();

    // Check that minimal tagline is NOT visible
    expect(screen.queryByText('Smart meal planning made simple')).not.toBeInTheDocument();
  });

  it('always renders brand name and logo', () => {
    const { rerender, container } = render(
      <AuthLayout title="Test Title" showMarketing={false}>
        <div>Test content</div>
      </AuthLayout>
    );

    // Check that brand name appears (there are multiple instances for mobile/desktop)
    expect(screen.getAllByText('MealMind').length).toBeGreaterThanOrEqual(1);
    // Check that logo SVG is present
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);

    rerender(
      <AuthLayout title="Test Title" showMarketing={true}>
        <div>Test content</div>
      </AuthLayout>
    );

    // Brand name should still appear
    expect(screen.getAllByText('MealMind').length).toBeGreaterThanOrEqual(1);
  });

  it('renders children content', () => {
    render(
      <AuthLayout title="Test Title">
        <div data-testid="test-child">Child content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders footerSlot when provided', () => {
    render(
      <AuthLayout
        title="Test Title"
        footerSlot={<div data-testid="test-footer">Footer content</div>}
      >
        <div>Test content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('test-footer')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('does not render footerSlot when not provided', () => {
    render(
      <AuthLayout title="Test Title">
        <div>Test content</div>
      </AuthLayout>
    );

    expect(screen.queryByText('Footer content')).not.toBeInTheDocument();
  });
});
