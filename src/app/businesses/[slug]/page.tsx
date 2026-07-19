import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, MapPin, MessageCircleHeart, ThumbsUp } from "lucide-react";
import { MaterialTag } from "@/components/business/material-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApprovedRecommendationsForBusiness, services } from "@/lib/data";
import { getPublishedBusinessBySlug } from "@/lib/public-businesses";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await getPublishedBusinessBySlug(slug);
  if (!business) return { title: "Business not found" };
  return {
    title: business.name,
    description: business.shortDescription,
    openGraph: { title: business.name, description: business.shortDescription },
    alternates: { canonical: `/businesses/${business.slug}` },
  };
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getPublishedBusinessBySlug(slug);
  if (!business) notFound();
  const serviceLabels = business.services.map((slug) => services.find((service) => service.slug === slug)?.name ?? formatServiceSlug(slug));
  const wordOfMouth = getApprovedRecommendationsForBusiness(business.id);
  const detailSections = [
    { title: "Services", items: serviceLabels },
    { title: "Processes", items: business.processes },
    { title: "Project scales", items: business.projectTypes },
  ].filter((section) => section.items.length > 0);
  const hasWebsite = business.websiteUrl && business.websiteUrl !== "#";
  const displayAddress = business.showFullAddress ? business.address : business.location;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.shortDescription,
    url: business.websiteUrl,
    areaServed: "Singapore",
    address: business.showFullAddress ? business.address : business.location,
  };

  return (
    <section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-shell grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="overflow-hidden border border-[#ded8cc] bg-white">
            <Image src={business.heroImage} alt="" width={1400} height={820} className="aspect-[16/8] w-full object-cover" priority />
          </div>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="mt-2 max-w-4xl font-serif text-5xl font-semibold leading-tight">{business.name}</h1>
              {(business.endorsementCount || wordOfMouth.length) ? (
                <div className="mt-4 flex flex-wrap gap-2">
                {business.endorsementCount ? <Badge className="border-[#536343] bg-[#eef2e8] text-[#39462d]"><ThumbsUp className="h-3.5 w-3.5" /> {business.endorsementCount} endorsement{business.endorsementCount === 1 ? "" : "s"}</Badge> : null}
                {wordOfMouth.length ? <Badge className="border-[#536343] bg-[#eef2e8] text-[#39462d]">{wordOfMouth.length} word-of-mouth recommendation{wordOfMouth.length === 1 ? "" : "s"}</Badge> : null}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link href={`/recommend-business?business=${business.slug}`}>
                  <MessageCircleHeart className="h-4 w-4" /> Recommend
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-[#4f493f]">{business.shortDescription}</p>
          {detailSections.length || business.materials.length ? (
            <div className="mt-8 grid gap-8 border-y border-[#ded8cc] py-8 md:grid-cols-2">
              {detailSections.map((section) => <Info key={section.title} title={section.title} items={section.items} />)}
              {business.materials.length ? <Info title="Materials" items={business.materials} material /> : null}
            </div>
          ) : null}
          <article className="mt-8 prose prose-neutral max-w-none">
            <h2 className="font-serif text-3xl font-semibold">About</h2>
            <p className="leading-8 text-[#4f493f]">{business.description}</p>
          </article>
          {business.portfolio.length ? (
            <section className="mt-10">
              <h2 className="font-serif text-3xl font-semibold">Portfolio</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {business.portfolio.map((item) => (
                  <article key={item.id} className="border border-[#ded8cc] bg-white">
                    {item.tags.some((tag) => tag.startsWith("video/")) ? (
                      <video src={item.imageUrl} controls className="aspect-[4/3] w-full bg-black object-cover" />
                    ) : (
                      <Image src={item.imageUrl} alt="" width={700} height={460} className="aspect-[4/3] w-full object-cover" />
                    )}
                    {(item.title || item.description) ? (
                      <div className="p-4">
                        {item.title ? <h3 className="font-semibold">{item.title}</h3> : null}
                        {item.description ? <p className="mt-2 text-sm leading-6 text-[#6d675d]">{item.description}</p> : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          {wordOfMouth.length ? (
            <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Word of mouth</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold">Recommended by the community</h2>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/recommend-business?business=${business.slug}`}>Recommend this business</Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {wordOfMouth.map((recommendation) => (
                <article key={recommendation.id} className="border border-[#ded8cc] bg-white p-5">
                  <div className="flex items-center gap-2 text-[#536343]">
                    <MessageCircleHeart className="h-4 w-4" aria-hidden />
                    <p className="text-sm font-semibold">{recommendation.projectContext}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4f493f]">“{recommendation.comment}”</p>
                  {recommendation.mediaUrls?.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {recommendation.mediaUrls.slice(0, 2).map((mediaUrl) => (
                        <Image
                          key={mediaUrl}
                          src={mediaUrl}
                          alt=""
                          width={420}
                          height={260}
                          className="aspect-video border border-[#ded8cc] object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {recommendation.recommendedFor.slice(0, 3).map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-[#6d675d]">
                    Recommended by {recommendation.permissionToPublishName ? recommendation.recommenderName : "a verified contributor"}
                    {recommendation.recommenderRole && recommendation.permissionToPublishName ? `, ${recommendation.recommenderRole}` : ""}
                  </p>
                </article>
              ))}
            </div>
            </section>
          ) : null}
        </div>
        <aside className="h-fit border border-[#ded8cc] bg-white p-5 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl font-semibold">Contact {business.name}</h2>
          <div className="mt-4 grid gap-3 text-sm text-[#4f493f]">
            {displayAddress ? <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {displayAddress}</p> : null}
            {business.publicEmail ? (
              <p className="flex items-center gap-2 break-all">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`mailto:${business.publicEmail}`} className="underline">{business.publicEmail}</a>
              </p>
            ) : null}
            <p>Starts from {formatCurrency(business.minimumBudget)}</p>
            <p>Typical lead time: {business.typicalLeadTime} days</p>
            {hasWebsite ? (
              <Button asChild variant="secondary">
                <Link href={business.websiteUrl} target="_blank" rel="noreferrer">Website <ExternalLink className="h-4 w-4" /></Link>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

function formatServiceSlug(slug: string) {
  return slug
    .replace(/^other-/, "")
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function Info({ title, items, material }: { title: string; items: string[]; material?: boolean }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6d675d]">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => material ? <MaterialTag key={item} name={item} /> : <Badge key={item}>{item}</Badge>)}
      </div>
    </div>
  );
}
