// User testimonials section
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';

export default function Testimonials() {
  const testimonials = [
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
      color: 'emerald',
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
      color: 'blue',
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
      color: 'purple',
    },
  ];

  const avatarColors = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  };

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
            <figure
              key={testimonial.author}
              className="relative overflow-hidden rounded-2xl bg-white/90 p-6 shadow-lg ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              aria-label={`Testimonial from ${testimonial.author} in ${testimonial.location}`}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30"
              />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <blockquote>
                <p className="text-base leading-relaxed text-gray-700">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="relative mt-6 flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-base font-bold text-white shadow-md ring-2 ring-white ${avatarColors[testimonial.color as keyof typeof avatarColors]}`}
                >
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
                    <div className="text-sm font-semibold text-gray-900">{testimonial.author}</div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      Verified household
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">{testimonial.role}</div>
                  <div className="text-xs font-semibold text-gray-600">{testimonial.location}</div>
                  <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    <p className="font-semibold text-emerald-800">{testimonial.timeframe}</p>
                    <p className="mt-1 text-gray-600">{testimonial.proof}</p>
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
