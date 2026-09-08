import Link from "next/link";
import Image from "next/image";
import { BusinessChangeRequestControls } from "@/components/admin/business-change-request-controls";
import { AdminBusinessEditForm } from "@/components/admin/admin-business-edit-form";
import { AdminBusinessMediaForm } from "@/components/admin/admin-business-media-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModerationSummary } from "@/components/admin/moderation-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminBusiness } from "@/lib/business-submissions";
import { getAdminBusinessChangeRequests, type BusinessChangeRequestMedia } from "@/lib/business-change-requests";

export const dynamic = "force-dynamic";

export default async function AdminChangeRequestsPage() {
  await requireAdminSession("/admin/change-requests");

  const requests = await getAdminBusinessChangeRequests();
  const businessesById = new Map(
    await Promise.all(
      [...new Set(requests.map((request) => request.businessId))].map(async (businessId) => {
        return [businessId, await getAdminBusiness(businessId)] as const;
      }),
    ),
  );
  const openCount = requests.filter((request) => request.status === "open").length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        title="Business change requests"
        description="Review suggested corrections from the public directory. Compare each request with the live listing, make any useful edits, then mark the request reviewed."
      />
      <p className="mt-4 text-sm font-semibold text-[#536343]">{openCount} open request{openCount === 1 ? "" : "s"}</p>
      <div className="mt-8 grid gap-4">
        {requests.length ? (
          requests.map((request) => {
            const business = businessesById.get(request.businessId);
            return (
              <article key={request.id} className="grid gap-6 border border-[#ded8cc] bg-[#fbfaf7] p-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
              <div className="grid content-start gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9c4f35]">{request.status}</p>
                    <h2 className="mt-1 text-2xl font-semibold">{request.businessName}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#6d675d]">Review what the requester noticed, then update the live listing if the correction is useful.</p>
                  </div>
                  <span className="text-sm text-[#6d675d]">{formatDate(request.createdAt)}</span>
                </div>
                <dl className="grid gap-4 border border-[#ded8cc] bg-white p-4 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-[#211f1b]">Requester email</dt>
                    <dd className="mt-1 break-all text-[#5f594f]">{request.requesterEmail}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#211f1b]">Business</dt>
                    <dd className="mt-1 flex flex-wrap gap-3 text-[#5f594f]">
                      <Link href={`/admin/businesses/${request.businessId}`} prefetch={false} className="underline">Admin record</Link>
                      {request.businessSlug ? <Link href={`/businesses/${request.businessSlug}`} className="underline">Public listing</Link> : null}
                      {request.businessManageToken ? <Link href={`/businesses/manage/${request.businessManageToken}`} className="underline">Edit listing</Link> : null}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="font-semibold text-[#211f1b]">Requested change</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-[#5f594f]">{request.reason}</dd>
                  </div>
                  {request.mediaItems.length ? (
                    <div className="md:col-span-2">
                      <dt className="font-semibold text-[#211f1b]">Supporting media</dt>
                      <dd className="mt-3 grid gap-3 sm:grid-cols-2">
                        {request.mediaItems.map((media) => (
                          <ChangeRequestMediaPreview key={media.id} media={media} />
                        ))}
                      </dd>
                    </div>
                  ) : null}
                  <div className="md:col-span-2">
                    <ModerationSummary
                      decision={request.moderationDecision}
                      risk={request.moderationRisk}
                      reason={request.moderationReason}
                      signals={request.moderationSignals}
                    />
                  </div>
                  {request.adminNotes ? (
                    <div className="md:col-span-2">
                      <dt className="font-semibold text-[#211f1b]">Admin notes</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-[#5f594f]">{request.adminNotes}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="border border-[#ded8cc] bg-white p-4">
                  <BusinessChangeRequestControls requestId={request.id} initialStatus={request.status} initialNotes={request.adminNotes} />
                </div>
              </div>
              <div className="grid content-start gap-5">
                {business ? (
                  <>
                    <div className="border border-[#ded8cc] bg-white p-4">
                      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Live listing</p>
                      <h3 className="mt-1 text-xl font-semibold">{business.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#6d675d]">Make edits here while the request is beside you. Save only what should actually change on the public listing.</p>
                    </div>
                    <AdminBusinessEditForm business={business} />
                    <AdminBusinessMediaForm businessId={business.id} portfolio={business.portfolio} />
                  </>
                ) : (
                  <div className="border border-[#ded8cc] bg-white p-5 text-sm leading-6 text-[#6d675d]">
                    The linked business could not be found. You can still review or dismiss this request.
                  </div>
                )}
              </div>
              </article>
            );
          })
        ) : (
          <EmptyState title="No change requests" description="Public requests to correct business listings will appear here." />
        )}
      </div>
    </section>
  );
}

function ChangeRequestMediaPreview({ media }: { media: BusinessChangeRequestMedia }) {
  return (
    <figure className="border border-[#ded8cc] bg-[#fbfaf7]">
      {media.mimeType.startsWith("video/") ? (
        <video src={media.url} controls className="aspect-video w-full bg-black object-cover" />
      ) : (
        <Image src={media.url} alt={media.caption || media.fileName} width={480} height={300} className="aspect-video w-full object-cover" />
      )}
      <figcaption className="p-3 text-xs leading-5 text-[#6d675d]">
        <span className="block font-semibold text-[#211f1b]">{media.caption || "Supporting media"}</span>
        <span className="mt-1 block break-all">{media.fileName}</span>
      </figcaption>
    </figure>
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
