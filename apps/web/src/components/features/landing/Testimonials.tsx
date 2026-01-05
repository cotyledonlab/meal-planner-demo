import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card } from '~/components/ui/card';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  role: string;
  timeframe: string;
  avatar: string;
  proof: string;
  rating: number;
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
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80',
      proof: 'Reduced weekly shop by €20 and cooks 2 extra home meals/week',
      rating: 5,
    },
    {
      quote:
        "No more arguing about what's for dinner! The kids know what's coming and actually look forward to meals. Worth every cent.",
      author: 'Conor D.',
      location: 'Dublin',
      role: 'Operations manager • Dad of teens',
      timeframe: 'Switched from meal kits 6 months ago',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80',
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
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
      proof: 'Uses batch-cook flow to prep lunches; cut takeaway by 30%',
      rating: 5,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-emerald-50 via-emerald-50/50 to-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Real Irish families, real results
          </h2>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            {`Join hundreds of families who've reclaimed their evenings and their peace of mind.`}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              asChild
              key={testimonial.author}
              className="relative flex h-full flex-col overflow-hidden border-gray-100 bg-white/90 p-6 shadow-lg hover:-translate-y-1 hover:shadow-2xl"
            >
              <figure
                aria-label={`Testimonial from ${testimonial.author} in ${testimonial.location}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30"
                />
                <div className="relative mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="relative flex-1">
                  <p className="line-clamp-4 text-base leading-relaxed text-gray-700">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="relative mt-6 flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full shadow-md ring-2 ring-white">
                    <Image
                      src={testimonial.avatar}
                      alt={`${testimonial.author} avatar`}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {testimonial.author}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                        Verified household
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">{testimonial.role}</div>
                    <div className="text-xs font-semibold text-gray-600">
                      {testimonial.location}
                    </div>
                    <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
                      <p className="font-semibold text-emerald-800">{testimonial.timeframe}</p>
                      <p className="mt-1 text-gray-600">{testimonial.proof}</p>
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
