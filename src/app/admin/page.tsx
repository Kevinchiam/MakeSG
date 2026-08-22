import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminBusinessChangeRequests } from "@/lib/business-change-requests";
import { getAdminBusinessRecommendations } from "@/lib/business-recommendations";
import { getAdminBusinesses } from "@/lib/business-submissions";
import { getAdminCreativeJobs } from "@/lib/creative-jobs";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const businesses = await getAdminBusinesses();
  const creativeJobs = await getAdminCreativeJobs();
  const recommendations = await getAdminBusinessRecommendations();
  const changeRequests = await getAdminBusinessChangeRequests();
  const pending = businesses.filter((b) => b.publicationStatus === "pending" || b.pendingRevision).length;
  const openCreativeJobs = creativeJobs.filter((job) => job.status === "open").length;
  const pendingCreativeJobs = creativeJobs.filter((job) => job.status === "pending_review").length;
  const inDiscussionCreativeJobs = creativeJobs.filter((job) => job.status === "in_discussion").length;
  const pendingRecommendations = recommendations.filter((recommendation) => recommendation.status === "pending").length;
  const openChangeRequests = changeRequests.filter((request) => request.status === "open").length;
  const highRiskItems = [
    ...businesses,
    ...creativeJobs,
    ...recommendations,
    ...changeRequests,
  ].filter((item) => item.moderationRisk === "high").length;
  return (
    <section className="container-shell py-12">
      <AdminPageHeader title="Admin" />
      {highRiskItems ? <p className="mt-4 text-sm font-semibold text-[#9c4f35]">{highRiskItems} high-risk item{highRiskItems === 1 ? "" : "s"} flagged by automated triage</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminLink href="/admin/businesses" title="Businesses" text={`${pending} pending, ${businesses.length} total listings`} />
        <AdminLink href="/admin/creative-jobs" title="Creative jobs" text={`${pendingCreativeJobs} pending review, ${openCreativeJobs} open, ${inDiscussionCreativeJobs} in discussion`} />
        <AdminLink href="/admin/recommendations" title="Recommendations" text={`${pendingRecommendations} pending word-of-mouth submissions`} />
        <AdminLink href="/admin/change-requests" title="Change requests" text={`${openChangeRequests} open listing correction request${openChangeRequests === 1 ? "" : "s"}`} />
        <AdminLink href="/admin/services" title="Services" text="Edit service categories and descriptions" />
        <AdminLink href="/admin/reports" title="Reports" text="Review reported content" />
      </div>
    </section>
  );
}

function AdminLink({ href, title, text }: { href: string; title: string; text: string }) {
  return <Link href={href} className="border border-[#ded8cc] bg-white p-5"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-[#6d675d]">{text}</p></Link>;
}
