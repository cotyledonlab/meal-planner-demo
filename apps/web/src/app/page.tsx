// Landing page for meal planning app
// Static prototype - no backend integration
import { Hero, FeatureCards, Pricing, Testimonials, CTA } from '~/components/features/landing';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <FeatureCards />
      <Pricing />
      <Testimonials />
      <CTA />
    </main>
  );
}
