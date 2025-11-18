import Link from 'next/link';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - MealMind AI',
  description:
    'Learn about MealMind AI and our mission to simplify meal planning for families in Ireland.',
};
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            About Meal Planner
          </h1>

          <div className="prose prose-lg max-w-none text-gray-600">
            <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
            <p>
              We&rsquo;re building meal planning tools designed specifically for families in
              Ireland. Our goal is to make weekly meal planning effortless, reduce food waste, and
              help families save time and money.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Why Meal Planner?</h2>
            <p>
              Planning meals shouldn&rsquo;t be stressful. We created Meal Planner to solve the
              everyday challenge of answering &ldquo;What&rsquo;s for dinner?&rdquo; With smart
              planning tools, recipe suggestions, and automated shopping lists, we help you take
              control of your weekly meals.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Built for Ireland</h2>
            <p>
              Our meal plans are tailored for Irish families, featuring local ingredients, popular
              recipes, and considerations for Irish shopping habits. We understand the unique needs
              of meal planning in Ireland.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Demo Project</h2>
            <p>
              This is currently a demonstration project showcasing modern web development practices
              and user experience design. We&rsquo;re continuously improving the platform based on
              user feedback and testing.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gray-50 px-8 py-10">
            <h3 className="text-xl font-semibold text-gray-900">Ready to get started?</h3>
            <p className="mt-2 text-gray-600">
              Join families already planning smarter meals and saving time.
            </p>
            <Link
              href="/auth/signup"
              className="mt-6 inline-block rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
