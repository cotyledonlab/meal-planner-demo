// User testimonials section
import { StarIcon } from '@heroicons/react/24/solid';

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        'My Sunday evenings used to be chaos – now they\'re peaceful. Meal prep takes half the time, and we\'re actually saving €20 a week. Game changer for our family.',
      author: 'Aoife M.',
      location: 'Cork',
      initials: 'A',
      rating: 5,
      color: 'emerald',
    },
    {
      quote: 'No more arguing about what\'s for dinner! The kids know what\'s coming and actually look forward to meals. Worth every cent.',
      author: 'Conor D.',
      location: 'Dublin',
      initials: 'C',
      rating: 5,
      color: 'blue',
    },
    {
      quote: 'I was skeptical, but this genuinely changed how we eat. Fresh, home-cooked meals without the stress. My partner is impressed!',
      author: 'Niamh O.',
      location: 'Galway',
      initials: 'N',
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
            Join hundreds of families who&rsquo;ve reclaimed their evenings and their peace of mind.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author}
              className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              aria-label={`Testimonial from ${testimonial.author} in ${testimonial.location}`}
            >
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
              <figcaption className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-md ${avatarColors[testimonial.color as keyof typeof avatarColors]}`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
