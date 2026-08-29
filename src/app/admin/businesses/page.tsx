import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModerationSummary } from "@/components/admin/moderation-summary";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminBusinesses } from "@/lib/business-submissions";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const businesses = await getAdminBusinesses();
  const sortedBusinesses = [...businesses].sort((a, b) => reviewPriority(b) - reviewPriority(a));
  const pendingCount = businesses.filter((business) => business.publicationStatus === "pending" || business.pendingRevision).length;
  const highRiskCount = businesses.filter((business) => business.moderationRisk === "high").length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        eyebrow="Review queue"
        title="Businesses"
        description="Approve new listings, review edits, and make direct admin updates. Published listings stay live while pending edits wait here."
      />
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
        <Badge className={pendingCount ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{pendingCount} pending</Badge>
        <Badge className={highRiskCount ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{highRiskCount} high-risk</Badge>
        <Badge>{businesses.length} active records</Badge>
      </div>
      <div className="mt-8 grid gap-3">
        {sortedBusinesses.length ? (
          sortedBusinesses.map((business) => (
            <Link key={business.id} href={`/admin/businesses/${business.id}`} className={`group grid gap-3 border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[1fr_auto] ${business.pendingRevision || business.publicationStatus === "pending" ? "border-[#9c4f35]" : "border-[#ded8cc]"}`}>
              <span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{business.name}</span>
                  {business.featured ? <Badge>Featured</Badge> : null}
                  <Badge className={business.moderationRisk === "high" ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{businessLabel(business)}</Badge>
                </span>
                <span className="mt-1 block text-sm text-[#6d675d]">{business.shortDescription || "No short summary provided."}</span>
                <span className="mt-2 block text-xs uppercase tracking-wide text-[#8a8277]">Updated {formatDate(business.updatedAt || business.createdAt)}</span>
              </span>
              <span className="flex items-start gap-2 text-sm font-semibold text-[#211f1b]">
                Review listing <ArrowRight className="mt-0.5 h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
              <span className="md:col-span-2">
                <ModerationSummary
                  compact
                  decision={business.moderationDecision}
                  risk={business.moderationRisk}
                  reason={business.moderationReason}
                  signals={business.moderationSignals}
                />
              </span>
            </Link>
          ))
        ) : (
          <EmptyState title="No business records yet" description="New business submissions and listing edits will appear here for review." />
        )}
      </div>
    </section>
  );
}

type AdminBusinessListItem = Awaited<ReturnType<typeof getAdminBusinesses>>[number];

function reviewPriority(business: AdminBusinessListItem) {
  return (business.moderationRisk === "high" ? 10 : 0)
    + (business.pendingRevision ? 8 : 0)
    + (business.publicationStatus === "pending" ? 6 : 0)
    + (business.publicationStatus === "suspended" ? 1 : 0);
}

function businessLabel(business: AdminBusinessListItem) {
  if (business.pendingRevision) return "Pending edits";
  switch (business.publicationStatus) {
    case "pending":
      return "Pending review";
    case "published":
      return "Published";
    case "suspended":
      return "Unpublished";
    case "rejected":
      return "In trash";
    default:
      return business.publicationStatus;
  }
}

function formatDate(value: string) {
  if (!value) return "recently";
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
