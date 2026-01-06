import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { HeroImage } from './HeroImage';
import {
  CarrotIllustration,
  TomatoIllustration,
  HerbIllustration,
  HandDrawnUnderline,
} from '~/components/ui/decorative';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white texture-grain">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <HeroImage />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-emerald-900/70 to-emerald-800/50"
        />
      </div>

      {/* Decorative floating illustrations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -left-4 top-1/4 opacity-20 animate-float-slow">
          <CarrotIllustration className="w-16 h-24 sm:w-20 sm:h-[7.5rem] rotate-[-15deg]" />
        </div>
        <div className="absolute right-8 top-16 opacity-20 animate-float hidden sm:block">
          <TomatoIllustration className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div className="absolute left-1/4 bottom-12 opacity-15 animate-float hidden lg:block">
          <HerbIllustration className="w-12 h-16 rotate-[20deg]" />
        </div>
        <div className="absolute right-1/4 bottom-20 opacity-15 animate-float-slow hidden lg:block">
          <HerbIllustration className="w-10 h-14 rotate-[-25deg]" />
        </div>
        {/* Warm gradient orb */}
        <div className="absolute -right-20 top-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 bg-gradient-to-tr from-emerald-400/15 to-teal-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tagline badge */}
          <div className="animate-reveal-up stagger-1 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-emerald-100 ring-1 ring-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
              Made for Irish families
            </span>
          </div>

          <h1 className="animate-reveal-up stagger-2 font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Your Family,{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Fed & Happy</span>
              <HandDrawnUnderline className="absolute -bottom-2 left-0 w-full text-amber-400/70" />
            </span>
          </h1>

          <p className="animate-reveal-up stagger-3 mt-8 text-lg text-emerald-100/90 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {`Stop stressing about "What's for dinner?" Spend less time planning, less money shopping, and more time with the people who matter.`}
          </p>

          <div className="animate-reveal-up stagger-4 mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="shadow-xl shadow-emerald-900/50">
              <Link href="/auth/signup">Start Planning Free</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="animate-reveal-up stagger-5 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-emerald-200/80">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 ring-2 ring-emerald-900 flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span>Join 500+ Irish families planning smarter</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
