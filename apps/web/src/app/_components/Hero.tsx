// Hero section with headline, subtext, CTAs, and background image
// Image source: Unsplash – "home cooking": https://unsplash.com/photos/QJ6x9wy_Ol4
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white">
      {/* Background image with overlay so text stays readable */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-kitchen.jpg"
          alt="Fresh ingredients for home cooking in an Irish kitchen"
          fill
          sizes="100vw"
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-emerald-950/60" aria-hidden="true" />
        {/* Unsplash attribution */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/30 px-2 py-1 text-xs text-white backdrop-blur-sm">
          <Image
            src="/images/logos/unsplash-logo-white.svg"
            alt="Unsplash"
            width={16}
            height={16}
            className="opacity-80"
          />
          <a
            href="https://unsplash.com/photos/QJ6x9wy_Ol4"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100"
          >
            Photo on Unsplash
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
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
