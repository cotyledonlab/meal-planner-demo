// User testimonials section
export default function Testimonials() {
  const testimonials = [
    {
      quote:
        'Since using this app, my Sunday meal prep takes half the time — and we&apos;re saving €20 a week!',
      author: 'Aoife',
      location: 'Cork',
      initials: 'A',
    },
    {
      quote: 'Finally a meal planner that actually works with Irish stores. Love it.',
      author: 'Conor',
      location: 'Dublin',
      initials: 'C',
    },
    {
      quote:
        'The free version already made our dinners so much easier. Just upgraded to Premium!',
      author: 'Niamh',
      location: 'Galway',
      initials: 'N',
    },
  ];

  return (
    <section className="bg-emerald-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Loved by families across Ireland
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            See what people are saying about their meal planning experience.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              aria-label={`Testimonial from ${testimonial.author} in ${testimonial.location}`}
            >
              <blockquote>
                <p className="text-base text-gray-700">&ldquo;{testimonial.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
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
