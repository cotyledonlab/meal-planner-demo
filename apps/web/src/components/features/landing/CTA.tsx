import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  CarrotIllustration,
  TomatoIllustration,
  HerbIllustration,
  WaveDivider,
} from '~/components/ui/decorative';

export function CTA() {
  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Wave divider at top */}
      <div className="absolute top-0 left-0 right-0 text-emerald-600/5">
        <WaveDivider flip />
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 px-8 py-16 sm:px-16 sm:py-20 shadow-2xl texture-grain">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Gradient orbs */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br from-amber-400/30 to-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-gradient-to-tr from-teal-400/25 to-emerald-300/15 rounded-full blur-3xl" />

            {/* Floating illustrations */}
            <div className="absolute left-8 top-8 opacity-15 animate-float-slow hidden lg:block">
              <CarrotIllustration className="w-12 h-18 rotate-[-20deg]" />
            </div>
            <div className="absolute right-12 bottom-12 opacity-15 animate-float hidden lg:block">
              <TomatoIllustration className="w-14 h-14" />
            </div>
            <div className="absolute left-1/4 bottom-8 opacity-10 animate-float-slow hidden lg:block">
              <HerbIllustration className="w-10 h-14 rotate-[15deg]" />
            </div>

            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready for Happier Mealtimes?
            </h2>
            <p className="mt-6 text-lg text-emerald-100/90 sm:text-xl leading-relaxed">
              Join hundreds of Irish families saving time, money, and sanity. Start free today – no
              credit card needed.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 shadow-xl hover:bg-emerald-50 hover:shadow-2xl group"
              >
                <Link href="/auth/signup">
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <p className="mt-8 flex items-center justify-center gap-2 text-sm text-emerald-200/80">
              <Heart className="h-4 w-4 fill-current" />
              Made with love for Irish families
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center gap-6">
            {/* Logo/Brand */}
            <div className="font-display text-xl font-bold text-gray-900">MealMind</div>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-1 text-sm">
              <Link
                href="/about"
                className="inline-flex min-h-[44px] items-center px-4 py-2 rounded-full transition-colors duration-200 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center px-4 py-2 rounded-full transition-colors duration-200 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="inline-flex min-h-[44px] items-center px-4 py-2 rounded-full transition-colors duration-200 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                Privacy
              </Link>
            </nav>

            {/* Copyright */}
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Meal Planner Demo. Prototype for demonstration purposes.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}

export default CTA;
