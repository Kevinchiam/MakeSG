import { notFound } from "next/navigation";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusControls } from "@/components/admin/admin-status-controls";
import { getAdminBusiness } from "@/lib/business-submissions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getAdminBusiness(id);
  if (!business) notFound();
  return (
    <section className="container-shell max-w-4xl py-12">
      <AdminPageHeader title={business.name} description={business.shortDescription} />
      <div className="mt-8 grid gap-6">
        <details className="border border-[#ded8cc] bg-white p-5" open>
          <summary className="cursor-pointer text-lg font-semibold">Review submitted information</summary>
          <div className="mt-5 grid gap-5">
            <InfoRow label="Description" value={business.description} />
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Website" value={business.websiteUrl} />
              <InfoRow label="Public email" value={business.publicEmail} />
              <InfoRow label="Location" value={business.location} />
              <InfoRow label="Business type" value={business.businessType} />
              <InfoRow label="Minimum budget" value={formatCurrency(business.minimumBudget)} />
              <InfoRow label="Typical lead time" value={`${business.typicalLeadTime} days`} />
              <InfoRow label="Endorsements" value={String(business.endorsementCount)} />
              <InfoRow label="Source" value={business.source} />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6d675d]">Services</h2>
              {business.services.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {business.services.map((service) => <span key={service} className="border border-[#ded8cc] px-3 py-1 text-sm">{service}</span>)}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#6d675d]">No services submitted.</p>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6d675d]">Portfolio</h2>
              {business.portfolio.length ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {business.portfolio.map((item) => (
                    <article key={item.id} className="border border-[#ded8cc] p-3">
                      {item.tags.some((tag) => tag.startsWith("video/")) ? (
                        <video src={item.imageUrl} controls className="aspect-video w-full bg-black object-cover" />
                      ) : (
                        <Image src={item.imageUrl} alt="" width={640} height={360} className="aspect-video w-full object-cover" />
                      )}
                      <p className="mt-2 text-sm font-medium">{item.title}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#6d675d]">No portfolio media submitted.</p>
              )}
            </div>
          </div>
        </details>
        <AdminStatusControls businessId={business.id} source={business.source} initialStatus={business.publicationStatus} />
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6d675d]">{label}</h2>
      <p className="mt-1 text-sm leading-6 text-[#211f1b]">{value || "Not provided"}</p>
    </div>
  );
}
