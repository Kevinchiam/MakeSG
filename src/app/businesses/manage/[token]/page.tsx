import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ManageBusinessDetails } from "@/features/businesses/manage-business-details";
import { ManageBusinessMedia } from "@/features/businesses/manage-business-media";
import { getBusinessByManageToken } from "@/lib/business-submissions";

export const metadata: Metadata = { title: "Manage business listing" };
export const dynamic = "force-dynamic";

export default async function ManageBusinessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const business = await getBusinessByManageToken(token);
  if (!business) notFound();

  return (
    <section className="container-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Private business link</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Manage your business listing</h1>
          <p className="mt-5 text-lg leading-8 text-[#6d675d]">
            This private link controls only this business listing. Use it to update details and portfolio media whenever something changes.
          </p>
          <div className="mt-8 border border-[#ded8cc] bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#7a7063]">Business</p>
            <h2 className="mt-2 text-2xl font-semibold">{business.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#6d675d]">{business.shortDescription}</p>
            <p className="mt-4 text-sm"><span className="font-semibold">Current status:</span> {business.pendingRevision ? "pending edits" : business.publicationStatus}</p>
          </div>
          <ManageBusinessDetails token={token} business={business} />
          <ManageBusinessMedia token={token} portfolio={business.portfolio} />
        </div>
        <aside className="grid self-start border border-[#ded8cc] bg-white p-5 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-auto">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Review status</p>
            <p className="mt-1 text-2xl font-semibold capitalize">{business.pendingRevision ? "Pending edits" : business.publicationStatus}</p>
          </div>
          <p className="mt-4 border border-[#ded8cc] bg-[#f8f5ee] p-3 text-sm leading-6 text-[#5f594f]">
            {business.publicationStatus === "published"
              ? "After you save changes, your current public listing stays live while the edits wait for review."
              : "After you save changes, this listing returns to review. It will appear publicly after approval."}
          </p>
          <Link href="/businesses" className="mt-5 inline-flex min-h-11 items-center justify-center border border-[#ded8cc] px-4 text-sm font-semibold">
            View businesses
          </Link>
        </aside>
      </div>
    </section>
  );
}
