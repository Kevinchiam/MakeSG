import Link from "next/link";
import { ArrowRight, Building2, Compass, Send } from "lucide-react";
import { BusinessGrid } from "@/components/business/business-grid";
import { ServiceCard } from "@/components/business/service-card";
import { SearchBar } from "@/components/site/search-bar";
import { Button } from "@/components/ui/button";
import { businesses, services } from "@/lib/data";

export default function Home() {
  const featured = businesses.filter((business) => business.featured);
  const popular = services.slice(0, 8);

  return (
    <>
      <section className="editorial-grid border-b border-[#ded8cc]">
        <div className="container-shell grid gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Singapore creative production directory</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
              Find the right people to help make your idea real.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f594f]">
              Discover fabricators, craftspeople, creative studios and specialist services across Singapore.
            </p>
            <div className="mt-8 max-w-2xl">
              <SearchBar placeholder="What are you trying to make?" />
            </div>
          </div>
          <div className="border border-[#211f1b] bg-white p-6 shadow-[12px_12px_0_#d8d0c4]">
            <h2 className="font-serif text-3xl font-semibold">From idea to made object</h2>
            <div className="mt-6 grid gap-5">
              {[
                ["Describe", "Turn a loose idea into a clear project brief."],
                ["Map services", "See the making disciplines likely needed."],
                ["Contact", "Shortlist Singapore providers and send a focused enquiry."],
              ].map(([title, text]) => (
                <div key={title} className="border-l-2 border-[#315c6b] pl-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6d675d]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Popular categories</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold">Start with the service you need</h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/services">All services <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((service) => <ServiceCard key={service.slug} service={service} />)}
        </div>
      </section>

      <section className="bg-[#f3eee5] py-16">
        <div className="container-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Featured providers</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold">Fictional Singapore demo listings</h2>
            </div>
            <Button asChild variant="secondary"><Link href="/businesses">Browse directory</Link></Button>
          </div>
          <BusinessGrid businesses={featured} />
        </div>
      </section>

      <section className="container-shell py-16">
        <h2 className="font-serif text-4xl font-semibold">Three project journeys</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Prototype a product", "Match aluminium, electronics and model-making needs before spending on tooling."],
            ["Build an installation", "Find fabricators, signage makers and creative technologists for a launch or exhibition."],
            ["Prepare a small batch", "Combine packaging, printing and production partners for a pilot run."],
          ].map(([title, text]) => (
            <article key={title} className="border border-[#ded8cc] bg-white p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6d675d]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#ded8cc] bg-white">
        <div className="container-shell grid gap-8 py-14 md:grid-cols-3">
          <Feature icon={<Compass />} title="Describe your project" text="Use the brief builder to capture outcomes, constraints, materials and references." />
          <Feature icon={<Building2 />} title="Discover relevant providers" text="Browse by service, material, location, budget, lead time and production fit." />
          <Feature icon={<Send />} title="Send focused enquiries" text="Contact businesses with the context they need to respond usefully." />
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="grid gap-6 border border-[#211f1b] bg-[#211f1b] p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-serif text-4xl font-semibold">Offer a creative service in Singapore?</h2>
            <p className="mt-3 max-w-2xl text-[#d8d0c4]">Create a listing for review and help designers, studios and organisations understand what you can make.</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/for-businesses">Create a listing</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#315c6b] text-[#315c6b]">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#6d675d]">{text}</p>
    </div>
  );
}
