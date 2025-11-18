'use client';

export function ContactForm() {
  return (
    <div className="rounded-2xl bg-gray-50 p-8">
      <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
      <form className="mt-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md"
            placeholder="How can we help?"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md"
            placeholder="Tell us more..."
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 ease-out hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] active:shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            alert('This is a demo form. In production, this would send your message.');
          }}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
