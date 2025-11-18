import Link from 'next/link';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - MealMind AI',
  description:
    'Privacy policy for MealMind AI. Learn how we collect, use, and protect your personal information.',
};
export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <p className="font-semibold text-amber-900">Demo Notice</p>
              <p className="mt-2 text-sm text-amber-800">
                This is a demonstration project. The privacy policy below is a template for
                illustration purposes. A production application would require a legally-reviewed
                privacy policy tailored to actual data practices.
              </p>
            </div>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Introduction</h2>
            <p>
              Meal Planner (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed
              to protecting your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our meal planning application.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Information We Collect</h2>

            <h3 className="mt-6 text-xl font-semibold text-gray-900">Personal Information</h3>
            <p>We may collect personal information that you provide to us, including:</p>
            <ul className="list-disc pl-6">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Dietary preferences and restrictions</li>
              <li>Meal planning preferences</li>
            </ul>

            <h3 className="mt-6 text-xl font-semibold text-gray-900">Usage Data</h3>
            <p>We automatically collect certain information when you use our service:</p>
            <ul className="list-disc pl-6">
              <li>Device information and IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Meal plans created and recipes viewed</li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6">
              <li>Provide and maintain our meal planning service</li>
              <li>Personalize your meal plan recommendations</li>
              <li>Send you important updates and notifications</li>
              <li>Improve our service and develop new features</li>
              <li>Respond to your requests and support needs</li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect
              your personal information. However, no method of transmission over the internet or
              electronic storage is 100% secure.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and
              store certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Third-Party Services</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our service. These
              third parties have access to your personal information only to perform tasks on our
              behalf and are obligated not to disclose or use it for any other purpose.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Your Data Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request transfer of your data to another service</li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Children&rsquo;s Privacy</h2>
            <p>
              Our service is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you become aware that a child
              has provided us with personal information, please contact us.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &ldquo;Last
              updated&rdquo; date.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-gray-900">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a
                href="mailto:privacy@mealplanner.demo"
                className="text-emerald-600 hover:text-emerald-700"
              >
                privacy@mealplanner.demo
              </a>{' '}
              or visit our{' '}
              <Link href="/contact" className="text-emerald-600 hover:text-emerald-700">
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
