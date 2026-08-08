import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="container-shell max-w-3xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">About</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">A practical map of Singapore making capability</h1>
      <div className="mt-6 grid gap-5 text-lg leading-8 text-[#4f493f]">
        <p>
          MakeSG helps creatives in Singapore find businesses that can turn ideas into physical objects, digital outputs, campaign assets, spaces, prototypes and small production runs.
        </p>
        <p>
          The platform brings together workshops, studios, suppliers, photographers, videographers and specialist services, then adds recommendations, portfolio work and creative job listings so decisions feel less dependent on scattered word of mouth.
        </p>
        <p>
          Businesses can list their services for review, keep their details current through private edit links, and discover creative jobs from people who are ready to make something.
        </p>
      </div>
    </section>
  );
}
