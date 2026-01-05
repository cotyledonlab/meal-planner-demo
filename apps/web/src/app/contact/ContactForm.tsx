'use client';

import { toast } from 'sonner';

export function ContactForm() {
  return (
    <div className="rounded-2xl bg-gray-50 p-8">
      <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
      <p className="mt-2 text-sm text-gray-600">
        We&apos;d love to hear from you. Fill out the form below and we&apos;ll get back to you
        within 24 hours.
      </p>
      <form className="mt-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/50 focus:shadow-md"
            placeholder="Sarah O'Brien"
          />
          <p className="mt-1 text-xs text-gray-500">So we know who we&apos;re talking to</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/50 focus:shadow-md"
            placeholder="sarah@example.ie"
          />
          <p className="mt-1 text-xs text-gray-500">We&apos;ll reply here — no spam, promise</p>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            What&apos;s this about?
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/50 focus:shadow-md"
            placeholder="e.g., Feature request, Bug report, Partnership inquiry"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Your message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all duration-150 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/50 focus:shadow-md"
            placeholder="Tell us what's on your mind. The more details, the better we can help!"
          />
        </div>

        <button
          type="submit"
          className="w-full min-h-[48px] rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 ease-out hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] active:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          onClick={(e) => {
            e.preventDefault();
            toast.success('This is a demo form. In production, this would send your message.');
          }}
        >
          Send Message →
        </button>

        <p className="text-center text-xs text-gray-500">
          We typically respond within 1 business day
        </p>
      </form>
    </div>
  );
}
