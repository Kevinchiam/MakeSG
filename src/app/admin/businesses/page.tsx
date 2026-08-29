import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModerationSummary } from "@/components/admin/moderation-summary";
import { getAdminBusinesses } from "@/lib/business-submissions";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const businesses = await getAdminBusinesses();
  const pendingCount = businesses.filter((business) => business.publicationStatus === "pending" || business.pendingRevision).length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader title="Moderate businesses" />
      <p className="mt-4 text-sm font-semibold text-[#536343]">{pendingCount} pending listing{pendingCount === 1 ? "" : "s"}</p>
      <div className="mt-8 grid gap-3">
        {businesses.map((business) => (
          <Link key={business.id} href={`/admin/businesses/${business.id}`} className="grid gap-3 border border-[#ded8cc] bg-white p-4 md:grid-cols-[1fr_auto]">
            <span>
              <span className="font-semibold">{business.name}</span>
              <span className="mt-1 block text-sm text-[#6d675d]">{business.shortDescription}</span>
            </span>
            <span className="text-sm text-[#6d675d]">{business.pendingRevision ? "pending edits" : business.publicationStatus} · {business.verificationStatus}</span>
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
        ))}
      </div>
    </section>
  );
}
