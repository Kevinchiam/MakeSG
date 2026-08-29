import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BriefcaseBusiness, Building2, ClipboardCheck, MessageCircleHeart, ShieldAlert, Trash2, Wrench } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminBusinessChangeRequests } from "@/lib/business-change-requests";
import { getAdminBusinessRecommendations } from "@/lib/business-recommendations";
import { getAdminBusinesses } from "@/lib/business-submissions";
import { getAdminCreativeJobs } from "@/lib/creative-jobs";
import { getAdminTrashItems } from "@/lib/admin-trash";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const businesses = await getAdminBusinesses();
  const creativeJobs = await getAdminCreativeJobs();
  const recommendations = await getAdminBusinessRecommendations();
  const changeRequests = await getAdminBusinessChangeRequests();
  const trashItems = await getAdminTrashItems();
  const pending = businesses.filter((b) => b.publicationStatus === "pending" || b.pendingRevision).length;
  const openCreativeJobs = creativeJobs.filter((job) => job.status === "open").length;
  const pendingCreativeJobs = creativeJobs.filter((job) => job.status === "pending_review").length;
  const inDiscussionCreativeJobs = creativeJobs.filter((job) => job.status === "in_discussion").length;
  const pendingRecommendations = recommendations.filter((recommendation) => recommendation.status === "pending").length;
  const openChangeRequests = changeRequests.filter((request) => request.status === "open").length;
  const totalReviewItems = pending + pendingCreativeJobs + pendingRecommendations + openChangeRequests;
  const highRiskItems = [
    ...businesses,
    ...creativeJobs,
    ...recommendations,
    ...changeRequests,
  ].filter((item) => item.moderationRisk === "high").length;
  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        title="Admin"
        description="Start with items that need a decision. Everything else is here for maintenance, cleanup, or later product work."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-[#ded8cc] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Review queue</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">{totalReviewItems} item{totalReviewItems === 1 ? "" : "s"} need attention</h2>
          <p className="mt-3 text-sm leading-6 text-[#6d675d]">Review pending listings, job posts, recommendations and requested changes. High-risk items are flagged so you can handle them first.</p>
        </section>
        <section className="border border-[#ded8cc] bg-[#fbfaf7] p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 h-5 w-5 text-[#9c4f35]" aria-hidden />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Automated triage</p>
              <p className="mt-2 text-2xl font-semibold">{highRiskItems} high-risk flag{highRiskItems === 1 ? "" : "s"}</p>
              <p className="mt-2 text-sm leading-6 text-[#6d675d]">Triage helps prioritise review. You still have the final say.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <AdminLink href="/admin/businesses" icon={<Building2 />} title="Businesses" count={pending} text={`${businesses.length} active listing${businesses.length === 1 ? "" : "s"} · pending edits stay private until approved`} tone={pending ? "urgent" : "default"} />
        <AdminLink href="/admin/creative-jobs" icon={<BriefcaseBusiness />} title="Creative jobs" count={pendingCreativeJobs} text={`${openCreativeJobs} open · ${inDiscussionCreativeJobs} in discussion`} tone={pendingCreativeJobs ? "urgent" : "default"} />
        <AdminLink href="/admin/recommendations" icon={<MessageCircleHeart />} title="Recommendations" count={pendingRecommendations} text="Review first-hand experiences before they influence a listing." tone={pendingRecommendations ? "urgent" : "default"} />
        <AdminLink href="/admin/change-requests" icon={<ClipboardCheck />} title="Change requests" count={openChangeRequests} text="Review public suggestions, then edit the business record if the correction is valid." tone={openChangeRequests ? "urgent" : "default"} />
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6d675d]">Maintenance</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <AdminLink href="/admin/trash" icon={<Trash2 />} title="Trash bin" count={trashItems.length} text="Restore rejected or dismissed items before the seven-day cleanup." />
          <AdminLink href="/admin/services" icon={<Wrench />} title="Services" text="Edit service categories and descriptions." />
          <AdminLink href="/admin/reports" icon={<ShieldAlert />} title="Reports" text="Review reported content when reporting is enabled." />
        </div>
      </div>
    </section>
  );
}

function AdminLink({
  href,
  icon,
  title,
  count,
  text,
  tone = "default",
}: {
  href: string;
  icon: ReactNode;
  title: string;
  count?: number;
  text: string;
  tone?: "default" | "urgent";
}) {
  return (
    <Link href={href} className={`group grid gap-4 border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${tone === "urgent" ? "border-[#9c4f35] bg-[#fffaf5]" : "border-[#ded8cc] bg-white"}`}>
      <span className="flex items-start justify-between gap-4">
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border border-[#ded8cc] bg-[#fbfaf7] text-[#315c6b] [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
          <span>
            <span className="block text-xl font-semibold">{title}</span>
            {typeof count === "number" ? <span className={`mt-1 inline-flex text-sm font-semibold ${count ? "text-[#9c4f35]" : "text-[#536343]"}`}>{count} to review</span> : null}
          </span>
        </span>
        <ArrowRight className="mt-2 h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
      </span>
      <span className="text-sm leading-6 text-[#6d675d]">{text}</span>
    </Link>
  );
}
