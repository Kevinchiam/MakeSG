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
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Singapore creative production network</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
              Find the businesses that can help make your idea real.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f594f]">
              Search Singapore makers, studios, photographers, suppliers and workshops. Browse community recommendations, post creative jobs and keep listings accurate together.
            </p>
            <div className="mt-8 max-w-2xl">
              <SearchBar placeholder="Search by service, material, location or project need" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#5f594f]">
              <span className="border border-[#ded8cc] bg-white px-3 py-2">{businesses.length} listed businesses</span>
              <span className="border border-[#ded8cc] bg-white px-3 py-2">{recommendedBusinesses} community recommended</span>
              <span className="border border-[#ded8cc] bg-white px-3 py-2">{openCreativeJobs} open creative jobs</span>
            </div>
          </div>
          <div className="border border-[#211f1b] bg-white p-6 shadow-[12px_12px_0_#d8d0c4]">
            <h2 className="font-serif text-3xl font-semibold">How MakeSG works now</h2>
            <div className="mt-6 grid gap-5">
              {[
                ["Find", "Search published businesses by service, need, budget, lead time and location."],
                ["Verify", "Use moderated word-of-mouth recommendations and portfolio media as trust signals."],
                ["Act", "Contact a business, post a creative job, recommend one you trust or request a listing correction."],
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

      <section className="bg-[#f3eee5] py-16">
        <div className="container-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Directory highlights</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold">Recommended and recently updated businesses</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d675d]">
                This list updates from the live directory, prioritising community-recommended, featured and newly updated listings.
              </p>
            </div>
            <Button asChild variant="secondary"><Link href="/businesses">Browse directory</Link></Button>
          </div>
          <BusinessGrid businesses={featured} />
        </div>
      </section>

      <section className="container-shell py-16">
        <h2 className="font-serif text-4xl font-semibold">Three ways people use MakeSG</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Find a business", "Search for fabrication, photography, videography, production, design and specialist services."],
            ["Post a creative job", "Share what you need made so businesses can browse open work and reach out directly."],
            ["Strengthen the directory", "Recommend businesses you trust or request corrections when a listing needs updating."],
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
          <Feature icon={<SearchCheck />} title="Smart directory search" text="Search across listing words, services, descriptions and portfolios, with light typo tolerance." />
          <Feature icon={<MessageCircleHeart />} title="Moderated recommendations" text="Community reviews and media are reviewed before they become public trust signals." />
          <Feature icon={<ClipboardList />} title="Creative job board" text="Creatives can post jobs and manage status through a private link without creating an account." />
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <Callout
            icon={<Building2 />}
            title="Know a useful business?"
            text="Business owners and community members can submit listings. Approved businesses receive a private edit link, while public correction requests go to admin review."
            href="/for-businesses"
            label="Submit a business"
          />
          <Callout
            icon={<BriefcaseBusiness />}
            title="Need help making something?"
            text="Post a creative job with services needed, reference media and contact details so listed businesses can browse and respond."
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
  });
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

function Callout({ icon, title, text, href, label }: { icon: React.ReactNode; title: string; text: string; href: string; label: string }) {
  return (
    <div className="grid gap-5 border border-[#211f1b] bg-[#211f1b] p-8 text-white">
      <div className="flex h-11 w-11 items-center justify-center border border-[#d8d0c4] text-[#d8d0c4]">{icon}</div>
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
