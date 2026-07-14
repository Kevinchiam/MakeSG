import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, MessageCircleHeart, ThumbsUp } from "lucide-react";
import { MaterialTag } from "@/components/business/material-tag";
import { SaveBusinessButton } from "@/components/business/save-business-button";
import { VerificationBadge } from "@/components/business/verification-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApprovedRecommendationsForBusiness, services } from "@/lib/data";
import type { Business } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function BusinessCard({ business }: { business: Business }) {
  const topServices = business.services.slice(0, 3).map((slug) => services.find((service) => service.slug === slug)?.name ?? formatServiceSlug(slug));
  const recommendationCount = getApprovedRecommendationsForBusiness(business.id).length;

  return (
    <article className="group flex h-full flex-col border border-[#ded8cc] bg-white">
      <Link href={`/businesses/${business.slug}`} className="block overflow-hidden" aria-label={`Open ${business.name} profile`}>
        <Image
          src={business.heroImage}
          alt=""
          width={900}
          height={560}
          className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#9c4f35]">{business.demoNotice}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal">
              <Link href={`/businesses/${business.slug}`} className="hover:underline">
                {business.name}
              </Link>
            </h2>
          </div>
          <VerificationBadge status={business.verificationStatus} />
        </div>
        <p className="text-sm leading-6 text-[#5f594f]">{business.shortDescription}</p>
        <div className="flex flex-wrap gap-2">
          {topServices.map((service) => (
            <Badge key={service}>{service}</Badge>
          ))}
        </div>
        <div className="mt-auto grid gap-2 text-sm text-[#5f594f]">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden /> {business.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden /> From {formatCurrency(business.minimumBudget)} · {business.typicalLeadTime} days
          </span>
          {recommendationCount ? (
            <span className="inline-flex items-center gap-2 text-[#536343]">
              <MessageCircleHeart className="h-4 w-4" aria-hidden /> Recommended by {recommendationCount} maker{recommendationCount === 1 ? "" : "s"}
            </span>
          ) : null}
          {business.endorsementCount ? (
            <span className="inline-flex items-center gap-2 text-[#536343]">
              <ThumbsUp className="h-4 w-4" aria-hidden /> Endorsed by {business.endorsementCount} person{business.endorsementCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {business.materials.slice(0, 3).map((material) => (
            <MaterialTag key={material} name={material} />
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button asChild variant="secondary" className="flex-1">
            <Link href={`/businesses/${business.slug}`}>
              Open profile <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <SaveBusinessButton businessId={business.id} />
        </div>
      </div>
    </article>
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
