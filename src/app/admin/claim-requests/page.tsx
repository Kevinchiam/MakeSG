import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BusinessClaimRequestControls } from "@/components/admin/business-claim-request-controls";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminBusinessClaimRequests } from "@/lib/business-claim-requests";

export const dynamic = "force-dynamic";

export default async function AdminBusinessClaimRequestsPage() {
  await requireAdminSession("/admin/claim-requests");

  const requests = await getAdminBusinessClaimRequests();
  const sortedRequests = [...requests].sort((a, b) => claimPriority(b) - claimPriority(a));
  const pendingCount = requests.filter((request) => request.status === "pending").length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        eyebrow="Ownership"
        title="Claim requests"
        description="Review people asking to manage an existing business listing. Approving a claim marks the profile as owner claimed."
      />
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
        <Badge className={pendingCount ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{pendingCount} pending</Badge>
        <Badge>{requests.length} total request{requests.length === 1 ? "" : "s"}</Badge>
      </div>

      <div className="mt-8 grid gap-4">
        {sortedRequests.length ? (
          sortedRequests.map((request) => (
            <article key={request.id} className={`grid gap-5 border bg-white p-5 ${request.status === "pending" ? "border-[#9c4f35]" : "border-[#ded8cc]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">Claim for {request.businessName}</h2>
                    <Badge className={request.status === "pending" ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{request.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6d675d]">Requested {formatDate(request.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm font-semibold">
                  <Link href={`/admin/businesses/${request.businessId}`} prefetch={false} className="underline">Open admin listing</Link>
                  {request.businessSlug ? <Link href={`/businesses/${request.businessSlug}`} className="underline">View public profile</Link> : null}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="border border-[#ded8cc] bg-[#fbfaf7] p-4">
                  <h3 className="font-semibold">Requester</h3>
                  <dl className="mt-3 grid gap-2 text-sm leading-6 text-[#4f493f]">
                    <Info label="Name" value={request.requesterName} />
                    <Info label="Role" value={request.requesterRole || "Not provided"} />
                    <Info label="Email" value={request.requesterEmail} />
                    <Info label="Phone" value={request.requesterPhone || "Not provided"} />
                    {request.proofUrl ? (
                      <div>
                        <dt className="font-semibold">Proof link</dt>
                        <dd>
                          <Link href={request.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all underline">
                            {request.proofUrl} <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          </Link>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
                <section className="border border-[#ded8cc] bg-[#fbfaf7] p-4">
                  <h3 className="font-semibold">Claim note</h3>
                  <p className="mt-3 text-sm leading-6 text-[#4f493f]">{request.message}</p>
                  {request.adminNotes ? (
                    <div className="mt-4 border border-[#ded8cc] bg-white p-3 text-sm leading-6 text-[#6d675d]">
                      <span className="font-semibold text-[#211f1b]">Admin notes: </span>{request.adminNotes}
                    </div>
                  ) : null}
                </section>
              </div>

              <BusinessClaimRequestControls requestId={request.id} status={request.status} />
            </article>
          ))
        ) : (
          <EmptyState title="No claim requests yet" description="Business owners can request access from their public listing page." />
        )}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function claimPriority(request: Awaited<ReturnType<typeof getAdminBusinessClaimRequests>>[number]) {
  return request.status === "pending" ? 10 : 0;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
