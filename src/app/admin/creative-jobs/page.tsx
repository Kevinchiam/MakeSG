import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCreativeJobs } from "@/lib/creative-jobs";

export const dynamic = "force-dynamic";

export default async function AdminCreativeJobsPage() {
  const jobs = await getAdminCreativeJobs();
  const openCount = jobs.filter((job) => job.status === "open").length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader title="Manage creative jobs" description="Edit, close or remove creative job listings posted by clients." />
      <p className="mt-4 text-sm font-semibold text-[#536343]">{openCount} open job{openCount === 1 ? "" : "s"}</p>
      <div className="mt-8 grid gap-3">
        {jobs.map((job) => (
          <Link key={job.id} href={`/admin/creative-jobs/${job.id}`} className="grid gap-2 border border-[#ded8cc] bg-white p-4 md:grid-cols-[1fr_auto]">
            <span>
              <span className="block font-semibold">{job.title}</span>
              <span className="mt-1 block text-sm text-[#6d675d]">{job.contactName} · {job.contactEmail}</span>
            </span>
            <span className="text-sm text-[#6d675d]">{job.status} · {job.projectType === "both" ? "Physical & Digital" : job.projectType}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
