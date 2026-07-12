import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { EnquiryForm } from "@/components/business/enquiry-form";
import { MaterialTag } from "@/components/business/material-tag";
import { SaveBusinessButton } from "@/components/business/save-business-button";
import { VerificationBadge } from "@/components/business/verification-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businesses, services } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = businesses.find((item) => item.slug === slug);
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
  const business = businesses.find((item) => item.slug === slug);
  if (!business) notFound();
  const serviceLabels = business.services.map((slug) => services.find((service) => service.slug === slug)?.name ?? slug);

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
          <Image src={business.heroImage} alt="" width={1400} height={820} className="aspect-[16/8] w-full border border-[#ded8cc] object-cover" priority />
          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">{business.demoNotice}</p>
              <h1 className="mt-2 font-serif text-5xl font-semibold">{business.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <VerificationBadge status={business.verificationStatus} />
                <Badge>{business.businessType}</Badge>
                <Badge>{business.claimed ? "Claimed profile" : "Claim this profile"}</Badge>
              </div>
            </div>
            <SaveBusinessButton businessId={business.id} />
          </div>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-[#4f493f]">{business.shortDescription}</p>
          <div className="mt-8 grid gap-8 border-y border-[#ded8cc] py-8 md:grid-cols-2">
            <Info title="Services" items={serviceLabels} />
            <Info title="Processes" items={business.processes} />
            <Info title="Project scales" items={business.projectTypes} />
            <Info title="Materials" items={business.materials} material />
          </div>
          <article className="mt-8 prose prose-neutral max-w-none">
            <h2 className="font-serif text-3xl font-semibold">About</h2>
            <p className="leading-8 text-[#4f493f]">{business.description}</p>
          </article>
          <section className="mt-10">
            <h2 className="font-serif text-3xl font-semibold">Portfolio</h2>
            {business.portfolio.length ? (
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {business.portfolio.map((item) => (
                  <article key={item.id} className="border border-[#ded8cc] bg-white">
                    <Image src={item.imageUrl} alt="" width={700} height={460} className="aspect-[4/3] object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#6d675d]">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 border border-dashed border-[#ded8cc] bg-white p-5 text-sm text-[#6d675d]">Portfolio items have not been added yet.</p>
            )}
          </section>
        </div>
        <aside className="h-fit border border-[#ded8cc] bg-white p-5 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl font-semibold">Contact options</h2>
          <div className="mt-4 grid gap-3 text-sm text-[#4f493f]">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {business.showFullAddress ? business.address : business.location}</p>
            <p>Minimum project value: {formatCurrency(business.minimumBudget)}</p>
            <p>Typical lead time: {business.typicalLeadTime} days</p>
            <Button asChild variant="secondary">
              <Link href={business.websiteUrl} target="_blank" rel="noreferrer">Website <ExternalLink className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-6 border-t border-[#ded8cc] pt-6">
            <EnquiryForm businessId={business.id} />
          </div>
          {!business.claimed ? <Link className="mt-4 block text-sm underline" href="/sign-up">Claim this profile</Link> : null}
        </aside>
      </div>
    </section>
  );
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
