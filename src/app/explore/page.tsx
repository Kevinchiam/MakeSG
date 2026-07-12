import { SearchBar } from "@/components/site/search-bar";
import { businesses, services } from "@/lib/data";
import Link from "next/link";

export default function ExplorePage() {
  return (
    <section className="container-shell py-12">
      <h1 className="font-serif text-5xl font-semibold">Explore MakeSG</h1>
      <p className="mt-4 max-w-2xl text-[#6d675d]">Search services, materials and fictional Singapore providers from a single place.</p>
      <div className="mt-8 max-w-2xl"><SearchBar /></div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="border border-[#ded8cc] bg-white p-6">
          <h2 className="text-xl font-semibold">Popular services</h2>
          <div className="mt-4 flex flex-wrap gap-2">{services.slice(0, 12).map((s) => <Link className="border px-3 py-1 text-sm" href={`/services/${s.slug}`} key={s.slug}>{s.name}</Link>)}</div>
        </div>
        <div className="border border-[#ded8cc] bg-white p-6">
          <h2 className="text-xl font-semibold">Featured areas</h2>
          <p className="mt-4 text-sm leading-6 text-[#6d675d]">{[...new Set(businesses.map((b) => b.location))].join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
