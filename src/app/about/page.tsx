import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="container-shell max-w-3xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">About</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">A practical map of Singapore making capability</h1>
      <div className="mt-6 grid gap-5 text-lg leading-8 text-[#4f493f]">
        <p>MakeSG is a production-ready MVP scaffold for a directory connecting creatives with fabricators, craftspeople, studios and specialist services.</p>
        <p>This local build uses fictional demo data and generated placeholders. Supabase migrations, RLS, storage buckets and repository boundaries are included so real data can replace the demo layer.</p>
      </div>
    </section>
  );
}
