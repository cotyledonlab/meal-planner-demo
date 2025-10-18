// Final call-to-action and footer section
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="bg-white">
      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Try It Free Today
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Join hundreds of Irish families who are already planning smarter and saving more.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-block rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Join Now
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-600">Built for families in Ireland 🇮🇪</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-emerald-600">
              About
            </a>
            <a href="#" className="hover:text-emerald-600">
              Contact
            </a>
            <a href="#" className="hover:text-emerald-600">
              Privacy
            </a>
          </nav>
          <p className="mt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Meal Planner Demo. Prototype for demonstration purposes.
          </p>
        </div>
      </footer>
    </section>
  );
}
