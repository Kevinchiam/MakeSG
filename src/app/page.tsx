import Link from "next/link";
import { BriefcaseBusiness, Building2, ClipboardList, MessageCircleHeart, SearchCheck, ShieldCheck } from "lucide-react";
import { BusinessGrid } from "@/components/business/business-grid";
import { SearchBar } from "@/components/site/search-bar";
import { Button } from "@/components/ui/button";
import { getPublicCreativeJobs } from "@/lib/creative-jobs";
import { getPublishedBusinesses } from "@/lib/public-businesses";
import type { Business } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [businesses, creativeJobs] = await Promise.all([getPublishedBusinesses(), getPublicCreativeJobs()]);
  const featured = getHomepageBusinesses(businesses);
  const openCreativeJobs = creativeJobs.filter((job) => job.status === "open").length;
  const recommendedBusinesses = businesses.filter((business) => (business.recommendationCount ?? 0) > 0).length;

  return (
    <>
      <section className="editorial-grid border-b border-[#ded8cc]">
        <div className="container-shell grid gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div className="home-reveal">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Singapore creative production network</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
              Find the businesses that can help make your idea real.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f594f]">
              Search makers, studios, photographers, suppliers and workshops in Singapore. See what the community recommends, post creative jobs, and help keep listings useful for the next person.
            </p>
            <div className="mt-8 max-w-2xl">
              <SearchBar placeholder="Search by service, material, location or project need" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#5f594f]">
              <span className="home-stat-pill border border-[#ded8cc] bg-white px-3 py-2">{businesses.length} listed businesses</span>
              <span className="home-stat-pill border border-[#ded8cc] bg-white px-3 py-2">{recommendedBusinesses} community recommended</span>
              <span className="home-stat-pill border border-[#ded8cc] bg-white px-3 py-2">{openCreativeJobs} open creative jobs</span>
            </div>
          </div>
          <div className="home-reveal home-reveal-delay-2 home-hero-card border border-[#211f1b] bg-white p-6 shadow-[12px_12px_0_#d8d0c4]">
            <h2 className="font-serif text-3xl font-semibold">How MakeSG helps</h2>
            <div className="mt-6 grid gap-5">
              {[
                ["Find", "Search by the service, location, budget or kind of help you need."],
                ["Feel it out", "Look at portfolio media and community recommendations before reaching out."],
                ["Take action", "Contact a business, post a job, recommend someone good, or suggest a correction."],
              ].map(([title, text], index) => (
                <div key={title} className="home-flow-step border-l-2 border-[#315c6b] pl-4" style={{ "--step-index": index } as React.CSSProperties}>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6d675d]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eee5] py-16">
        <div className="container-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="home-reveal text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Directory highlights</p>
              <h2 className="home-reveal home-reveal-delay-1 mt-2 font-serif text-4xl font-semibold">Useful businesses to start with</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d675d]">
                These highlights refresh from the live directory, favouring businesses that are recommended, featured or recently updated.
              </p>
            </div>
            <Button asChild variant="secondary"><Link href="/businesses">Browse directory</Link></Button>
          </div>
          <div className="home-featured-grid">
            <BusinessGrid businesses={featured} />
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <h2 className="home-reveal font-serif text-4xl font-semibold">Three ways people use MakeSG</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Find a business", "Search for fabrication, photography, videography, production, design and specialist services."],
            ["Post a creative job", "Share what you need made so businesses can browse open work and reach out directly."],
            ["Strengthen the directory", "Recommend businesses you trust or request corrections when a listing needs updating."],
          ].map(([title, text], index) => (
            <article key={title} className="home-reveal home-journey-card border border-[#ded8cc] bg-white p-6" style={{ "--step-index": index } as React.CSSProperties}>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6d675d]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#ded8cc] bg-white">
        <div className="container-shell grid gap-8 py-14 md:grid-cols-3">
          <Feature icon={<SearchCheck />} title="Smarter search" text="Search across names, services, descriptions and portfolio text, even when your wording is not exact." index={0} />
          <Feature icon={<MessageCircleHeart />} title="Community recommendations" text="People can share first-hand experiences, with admin review before anything goes public." index={1} />
          <Feature icon={<ClipboardList />} title="Creative jobs" text="Post a job and manage its status through a private link, no account needed." index={2} />
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <Callout
            icon={<Building2 />}
            title="Know a useful business?"
            text="Submit a business you run, work with or want others to discover. Approved listings get a private edit link, and correction requests go to admin review."
            href="/for-businesses"
            label="Submit a business"
          />
          <Callout
            icon={<BriefcaseBusiness />}
            title="Need help making something?"
            text="Post the job, add helpful references, and let suitable businesses reach out directly."
            href="/for-creatives"
            label="Post a creative job"
          />
        </div>
      </section>
    </>
  );
}

function getHomepageBusinesses(businesses: Business[]) {
  return [...businesses].sort((a, b) => {
    const recommendationDifference = (b.recommendationCount ?? 0) - (a.recommendationCount ?? 0);
    if (recommendationDifference) return recommendationDifference;

    if (a.featured !== b.featured) return a.featured ? -1 : 1;

    const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    if (aUpdated !== bUpdated) return bUpdated - aUpdated;

    return a.name.localeCompare(b.name);
  }).slice(0, 6);
}

function Feature({ icon, title, text, index }: { icon: React.ReactNode; title: string; text: string; index: number }) {
  return (
    <div className="home-reveal home-feature-tile" style={{ "--step-index": index } as React.CSSProperties}>
      <div className="home-icon-frame mb-4 flex h-10 w-10 items-center justify-center border border-[#315c6b] text-[#315c6b]">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#6d675d]">{text}</p>
    </div>
  );
}

function Callout({ icon, title, text, href, label }: { icon: React.ReactNode; title: string; text: string; href: string; label: string }) {
  return (
    <div className="home-callout grid gap-5 border border-[#211f1b] bg-[#211f1b] p-8 text-white">
      <div className="home-icon-frame flex h-11 w-11 items-center justify-center border border-[#d8d0c4] text-[#d8d0c4]">{icon}</div>
      <div>
        <h2 className="font-serif text-3xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#d8d0c4]">{text}</p>
      </div>
      <Button asChild variant="secondary" className="w-fit">
        <Link href={href}>
          {label} <ShieldCheck className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
