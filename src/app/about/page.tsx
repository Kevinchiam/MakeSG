import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="container-shell max-w-3xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">About</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">A friendlier way to find people who can make things</h1>
      <div className="mt-6 grid gap-5 text-lg leading-8 text-[#4f493f]">
        <p>
          MakeSG helps people in Singapore find businesses that can turn ideas into objects, visuals, spaces, prototypes, campaign assets and small production runs.
        </p>
        <p>
          Instead of digging through old chats, social posts and half-remembered recommendations, you can browse workshops, studios, suppliers, photographers, videographers and specialist services in one place.
        </p>
        <p>
          The directory grows through community submissions, admin review, portfolio media and creative jobs. The aim is simple: help good work find good people faster.
        </p>
      </div>
    </section>
  );
}
