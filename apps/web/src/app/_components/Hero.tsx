// Hero section with headline, subtext, CTAs, and background image
// Image source: Unsplash – "home cooking": https://unsplash.com/photos/QJ6x9wy_Ol4
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80"
          alt="Fresh ingredients for home cooking in an Irish kitchen"
          fill
          sizes="100vw"
          className="object-cover opacity-70"
          priority
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-emerald-900/60 to-emerald-800/40"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Simplify Your Weekly Meals — Without Breaking the Bank
          </h1>
          <p className="mt-6 text-base text-emerald-100 sm:text-lg">
            Plan, prep, and shop smarter with weekly recipes and cost-saving supermarket insights.
            Your meal plan, recipes, and shopping list — in minutes, not hours.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Get Started
            </Link>
            <a
              href="#pricing"
              className="rounded-full bg-white px-8 py-3 text-base font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-600 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              See Premium
            </a>
          </div>
          <p className="mt-6 text-sm text-emerald-100">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-emerald-200 transition hover:text-emerald-100"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
