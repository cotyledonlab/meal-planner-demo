// Landing page for meal planning app
// Static prototype - no backend integration
import Hero from '~/app/_components/Hero';
import FeatureCards from '~/app/_components/FeatureCards';
import Pricing from '~/app/_components/Pricing';
import Testimonials from '~/app/_components/Testimonials';
import CTA from '~/app/_components/CTA';

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
