import Link from 'next/link';
import { Button } from '~/components/ui/button';

export function CTA() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 px-8 py-16 shadow-2xl sm:px-16">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready for Happier Mealtimes?
            </h2>
            <p className="mt-4 text-lg text-emerald-100 sm:text-xl">
              Join hundreds of Irish families saving time, money, and sanity. Start free today – no
              credit card needed.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="bg-white text-emerald-700 shadow-lg hover:bg-emerald-50 hover:shadow-xl"
              >
                <Link href="/auth/signup">Start Planning Free</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-emerald-100">Made with love for Irish families</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <nav className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <Link
              href="/about"
              className="inline-flex min-h-[44px] items-center px-3 py-2 transition-colors duration-150 hover:text-emerald-600"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center px-3 py-2 transition-colors duration-150 hover:text-emerald-600"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="inline-flex min-h-[44px] items-center px-3 py-2 transition-colors duration-150 hover:text-emerald-600"
            >
              Privacy
            </Link>
          </nav>
          <p className="mt-6 text-center text-sm text-gray-700">
            © {new Date().getFullYear()} Meal Planner Demo. Prototype for demonstration purposes.
          </p>
        </div>
      </footer>
    </section>
  );
}

export default CTA;
