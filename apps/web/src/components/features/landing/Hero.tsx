import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { HeroImage } from './HeroImage';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <HeroImage />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-emerald-900/60 to-emerald-800/40"
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
            <Button asChild>
              <Link href="/auth/signup">Start Planning Free</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 hover:text-white"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
