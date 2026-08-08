import Link from "next/link";
import { BusinessChangeRequestControls } from "@/components/admin/business-change-request-controls";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminBusinessChangeRequests } from "@/lib/business-change-requests";

export const dynamic = "force-dynamic";

export default async function AdminChangeRequestsPage() {
  const requests = await getAdminBusinessChangeRequests();
  const openCount = requests.filter((request) => request.status === "open").length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        title="Business change requests"
        description="Review suggested corrections from the public directory. If the request is valid, open the business record and make the change manually."
      />
      <p className="mt-4 text-sm font-semibold text-[#536343]">{openCount} open request{openCount === 1 ? "" : "s"}</p>
      <div className="mt-8 grid gap-4">
        {requests.length ? (
          requests.map((request) => (
            <article key={request.id} className="grid gap-5 border border-[#ded8cc] bg-white p-5 lg:grid-cols-[1fr_360px]">
              <div className="grid gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9c4f35]">{request.status}</p>
                    <h2 className="mt-1 text-2xl font-semibold">{request.businessName}</h2>
                  </div>
                  <span className="text-sm text-[#6d675d]">{formatDate(request.createdAt)}</span>
                </div>
                <dl className="grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-[#211f1b]">Requester email</dt>
                    <dd className="mt-1 break-all text-[#5f594f]">{request.requesterEmail}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#211f1b]">Business</dt>
                    <dd className="mt-1 flex flex-wrap gap-3 text-[#5f594f]">
                      <Link href={`/admin/businesses/${request.businessId}`} className="underline">Admin record</Link>
                      {request.businessSlug ? <Link href={`/businesses/${request.businessSlug}`} className="underline">Public listing</Link> : null}
                      {request.businessManageToken ? <Link href={`/businesses/manage/${request.businessManageToken}`} className="underline">Edit listing</Link> : null}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="font-semibold text-[#211f1b]">Requested change</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-[#5f594f]">{request.reason}</dd>
                  </div>
                  {request.adminNotes ? (
                    <div className="md:col-span-2">
                      <dt className="font-semibold text-[#211f1b]">Admin notes</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-[#5f594f]">{request.adminNotes}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <BusinessChangeRequestControls requestId={request.id} initialStatus={request.status} initialNotes={request.adminNotes} />
            </article>
          ))
        ) : (
          <EmptyState title="No change requests" description="Public requests to correct business listings will appear here." />
        )}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
