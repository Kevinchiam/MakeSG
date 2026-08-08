import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminBusinessRecommendations } from "@/lib/business-recommendations";
import { getAdminBusinesses } from "@/lib/business-submissions";
import { getAdminCreativeJobs } from "@/lib/creative-jobs";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const businesses = await getAdminBusinesses();
  const creativeJobs = await getAdminCreativeJobs();
  const recommendations = await getAdminBusinessRecommendations();
  const pending = businesses.filter((b) => b.publicationStatus === "pending" || b.pendingRevision).length;
  const openCreativeJobs = creativeJobs.filter((job) => job.status === "open").length;
  const inDiscussionCreativeJobs = creativeJobs.filter((job) => job.status === "in_discussion").length;
  const pendingRecommendations = recommendations.filter((recommendation) => recommendation.status === "pending").length;
  return (
    <section className="container-shell py-12">
      <AdminPageHeader title="Admin" />
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <AdminLink href="/admin/businesses" title="Businesses" text={`${pending} pending, ${businesses.length} total listings`} />
        <AdminLink href="/admin/creative-jobs" title="Creative jobs" text={`${openCreativeJobs} open, ${inDiscussionCreativeJobs} in discussion, ${creativeJobs.length} total listings`} />
        <AdminLink href="/admin/recommendations" title="Recommendations" text={`${pendingRecommendations} pending word-of-mouth submissions`} />
        <AdminLink href="/admin/services" title="Services" text="Edit service categories and descriptions" />
        <AdminLink href="/admin/reports" title="Reports" text="Review reported content" />
      </div>
    </section>
  );
}

function AdminLink({ href, title, text }: { href: string; title: string; text: string }) {
  return <Link href={href} className="border border-[#ded8cc] bg-white p-5"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-[#6d675d]">{text}</p></Link>;
}
