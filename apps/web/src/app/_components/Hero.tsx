// Hero section with headline, subtext, CTAs, and background illustration
// Custom SVG illustration showing a family enjoying a home-cooked meal together
// Designed to convey warmth, human connection, and the joy of shared meals
import Link from 'next/link';

// Get basePath for static assets
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/demos/meal-planner';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
      {/* Background illustration - family enjoying meal together */}
      <div className="absolute inset-0 -z-10">
        {/* SVG illustration as CSS background for proper basePath handling */}
        <div
          className="h-full w-full bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${BASE_PATH}/images/hero-family-meal.svg)` }}
          role="img"
          aria-label="Heartwarming illustration of a diverse family sharing a home-cooked meal together around the dinner table, with subtle meal planning artifacts visible"
        />
        {/* Emerald overlay to maintain brand colors while preserving warm illustration tones */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-emerald-900/50 to-emerald-800/30"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Your Family, Fed and Happy
          </h1>
          <p className="mt-6 text-base text-emerald-100 sm:text-lg">
            {`Stop stressing about "What's for dinner?" Spend less time planning, less money shopping, 
            and more time with the people who matter. Fresh, home-cooked meals made simple.`}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 ease-out hover:scale-[1.02] hover:bg-emerald-500 hover:shadow-md active:scale-[0.98] active:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Start Planning Free
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white/10 px-8 py-3 text-base font-semibold text-white shadow-sm ring-1 ring-white/20 transition-all duration-150 ease-out hover:scale-[1.02] hover:bg-white/20 hover:ring-white/30 active:scale-[0.98] active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
