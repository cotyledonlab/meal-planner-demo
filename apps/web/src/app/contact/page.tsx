import Link from 'next/link';
import { ContactForm } from './ContactForm';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - MealMind AI',
  description:
    "Get in touch with MealMind AI. Have questions or feedback? We'd love to hear from you.",
};
export default function ContactPage() {
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
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Have questions or feedback? We&rsquo;d love to hear from you.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <ContactForm />

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Email</h2>
                <p className="mt-2 text-gray-600">
                  <a
                    href="mailto:hello@mealplanner.demo"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    hello@mealplanner.demo
                  </a>
                </p>
                <p className="mt-1 text-sm text-gray-500">We typically respond within 24 hours</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">Support</h2>
                <p className="mt-2 text-gray-600">
                  For technical support or account issues, please email:
                </p>
                <p className="mt-2">
                  <a
                    href="mailto:support@mealplanner.demo"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    support@mealplanner.demo
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">FAQ</h2>
                <p className="mt-2 text-gray-600">
                  Common questions about meal planning, recipes, and using the platform.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Check our{' '}
                  <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700">
                    dashboard
                  </Link>{' '}
                  for helpful tips and guides.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-emerald-50 p-6">
                <h3 className="font-semibold text-emerald-900">Demo Notice</h3>
                <p className="mt-2 text-sm text-emerald-800">
                  This is a demonstration project. The contact form and email addresses shown are
                  for prototype purposes only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
