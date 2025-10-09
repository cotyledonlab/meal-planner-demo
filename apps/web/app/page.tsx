export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight">MealMind</h1>
        <p className="text-lg text-slate-700">
          Welcome to MealMind, the AI-assisted weekly meal planning demo. The onboarding wizard,
          plan generation, and exports will live here as the feature is implemented. For now, this
          placeholder confirms the Next.js App Router scaffold is wired correctly.
        </p>
      </section>
    </main>
  );
}
