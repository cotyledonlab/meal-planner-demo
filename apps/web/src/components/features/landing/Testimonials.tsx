import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { HandDrawnUnderline } from '~/components/ui/decorative';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  role: string;
  timeframe: string;
  avatar: string;
  proof: string;
  rating: number;
  featured?: boolean;
}

export function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "My Sunday evenings used to be chaos – now they're peaceful. Meal prep takes half the time, and we're actually saving €20 a week. Game changer for our family.",
      author: 'Aoife M.',
      location: 'Cork',
      role: 'Primary school teacher • Mum of 2',
      timeframe: 'Using MealMind for 4 months',
      avatar:
        'https://hel1.your-objectstorage.com/recipe-store/professional-headshot-portrait-o-1768002148744-b35a6746-d204-4994-92a7-6c6dbbd82bd5.png',
      proof: 'Reduced weekly shop by €20 and cooks 2 extra home meals/week',
      rating: 5,
      featured: true,
    },
    {
      quote:
        "No more arguing about what's for dinner! The kids know what's coming and actually look forward to meals. Worth every cent.",
      author: 'Conor D.',
      location: 'Dublin',
      role: 'Operations manager • Dad of teens',
      timeframe: 'Switched from meal kits 6 months ago',
      avatar:
        'https://hel1.your-objectstorage.com/recipe-store/professional-headshot-portrait-o-1768002260013-36830c63-912a-43a6-996d-77c7e5aca47b.png',
      proof: 'Replaced meal kits, saving €45/month and 2 hours weekly',
      rating: 5,
    },
    {
      quote:
        'I was skeptical, but this genuinely changed how we eat. Fresh, home-cooked meals without the stress. My partner is impressed!',
      author: 'Niamh O.',
      location: 'Galway',
      role: 'Product designer • Marathon runner',
      timeframe: '3 months with Premium',
      avatar:
        'https://hel1.your-objectstorage.com/recipe-store/professional-headshot-portrait-o-1768002352879-186cec9d-4ec4-4138-81dc-05ecb010f734.png',
      proof: 'Uses batch-cook flow to prep lunches; cut takeaway by 30%',
      rating: 5,
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-emerald-50/80 via-white to-white py-20 sm:py-28 lg:py-32 overflow-hidden">
      {/* Decorative diagonal stripe */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 20px, #059669 20px, #059669 21px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Real Irish families,{' '}
            <span className="relative inline-block">
              <span className="relative z-10">real results</span>
              <HandDrawnUnderline className="absolute -bottom-1 left-0 w-full text-[color:var(--coral)]" />
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl leading-relaxed">
            {`Join hundreds of families who've reclaimed their evenings and their peace of mind.`}
          </p>
        </div>

        {/* Asymmetric masonry-style layout */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {testimonials.map((testimonial, index) => {
              // First card spans more columns and is taller
              const isFeatured = testimonial.featured;

              return (
                <Card
                  asChild
                  key={testimonial.author}
                  className={cn(
                    'group relative flex flex-col transition-all duration-300 ease-out',
                    'hover:-translate-y-2 hover:shadow-2xl',
                    'ring-1 ring-gray-100',
                    isFeatured
                      ? 'lg:col-span-7 lg:row-span-2 p-8 sm:p-10'
                      : 'lg:col-span-5 p-6 sm:p-8',
                    // Stagger animations
                    'animate-reveal-up',
                    index === 0 && 'stagger-1',
                    index === 1 && 'stagger-2',
                    index === 2 && 'stagger-3'
                  )}
                >
                  <figure
                    aria-label={`Testimonial from ${testimonial.author} in ${testimonial.location}`}
                    className="flex flex-col h-full"
                  >
                    {/* Gradient background */}
                    <div
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-0 transition-opacity duration-300',
                        isFeatured
                          ? 'bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40'
                          : 'bg-gradient-to-br from-gray-50/50 via-white to-emerald-50/30'
                      )}
                    />

                    {/* Quote icon for featured */}
                    {isFeatured && (
                      <div className="absolute -right-4 -top-4 opacity-5">
                        <Quote className="h-32 w-32 text-emerald-600" />
                      </div>
                    )}

                    {/* Stars */}
                    <div className="relative mb-4 flex gap-1">
                      <span className="sr-only">{testimonial.rating} out of 5 stars</span>
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'fill-amber-400 text-amber-400',
                            isFeatured ? 'h-6 w-6' : 'h-5 w-5'
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="relative">
                      <p
                        className={cn(
                          'leading-relaxed text-gray-700',
                          isFeatured ? 'text-xl sm:text-2xl font-medium' : 'text-base'
                        )}
                      >
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </blockquote>

                    {/* Author info */}
                    <figcaption
                      className={cn(
                        'relative flex items-start gap-4',
                        isFeatured ? 'mt-8' : 'mt-6'
                      )}
                    >
                      <div
                        className={cn(
                          'overflow-hidden rounded-full shadow-lg ring-4 ring-white',
                          isFeatured ? 'h-16 w-16' : 'h-12 w-12'
                        )}
                      >
                        <Image
                          src={testimonial.avatar}
                          alt={`${testimonial.author} avatar`}
                          width={isFeatured ? 64 : 48}
                          height={isFeatured ? 64 : 48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'font-bold text-gray-900',
                              isFeatured ? 'text-lg' : 'text-sm'
                            )}
                          >
                            {testimonial.author}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Verified
                          </span>
                        </div>
                        <div
                          className={cn('text-gray-600', isFeatured ? 'text-base mt-1' : 'text-sm')}
                        >
                          {testimonial.role}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 mt-0.5">
                          {testimonial.location}
                        </div>

                        {/* Results box */}
                        <div
                          className={cn(
                            'rounded-xl bg-emerald-50/80 px-4 py-3 text-xs border border-emerald-100',
                            isFeatured ? 'mt-4' : 'mt-3'
                          )}
                        >
                          <p className="font-bold text-emerald-800">{testimonial.timeframe}</p>
                          <p className="mt-1 text-gray-600">{testimonial.proof}</p>
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
