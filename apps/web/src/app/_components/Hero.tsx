// Hero section with headline, subtext, CTAs, and background image
// Image source: Unsplash – "home cooking": https://unsplash.com/photos/QJ6x9wy_Ol4
import Image from 'next/image';
import Link from 'next/link';

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGO49+7Jt/+f61tL8ivSGeQ0NCLTkgsq82cuns7AzcygryeVVhiXnh4OAHsJD/ki5q1xAAAAAElFTkSuQmCC';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-cooking.jpg"
          alt="Fresh ingredients for home cooking in an Irish kitchen"
          fill
          sizes="100vw"
          className="object-cover opacity-70"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-emerald-900/60 to-emerald-800/40"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Simplify Your Weekly Meals
            <br className="sm:hidden" aria-hidden="true" /> —{' '}
            <span className="inline-block">Without Breaking the Bank</span>
          </h1>
          <p className="mt-6 text-base text-emerald-100 sm:text-lg">
            Plan, prep, and shop smarter with weekly recipes and cost-saving supermarket insights.
            Your meal plan, recipes, and shopping list — in minutes, not hours.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:scale-[1.02] hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Get Started
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-full bg-white/10 px-8 py-3 text-base font-semibold text-white shadow-sm ring-1 ring-white/20 transition-all duration-150 ease-in-out hover:scale-[1.02] hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
