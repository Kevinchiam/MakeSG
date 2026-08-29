import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModerationSummary } from "@/components/admin/moderation-summary";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { creativeJobStatusLabel, getAdminCreativeJobs } from "@/lib/creative-jobs";

export const dynamic = "force-dynamic";

export default async function AdminCreativeJobsPage() {
  const jobs = await getAdminCreativeJobs();
  const sortedJobs = [...jobs].sort((a, b) => reviewPriority(b) - reviewPriority(a));
  const openCount = jobs.filter((job) => job.status === "open").length;
  const pendingCount = jobs.filter((job) => job.status === "pending_review").length;
  const highRiskCount = jobs.filter((job) => job.moderationRisk === "high").length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        eyebrow="Review queue"
        title="Creative jobs"
        description="Review jobs posted by creatives, edit details when needed, and keep live job statuses accurate."
      />
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
        <Badge className={pendingCount ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{pendingCount} pending</Badge>
        <Badge>{openCount} open</Badge>
        <Badge className={highRiskCount ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{highRiskCount} high-risk</Badge>
      </div>
      <div className="mt-8 grid gap-3">
        {sortedJobs.length ? (
          sortedJobs.map((job) => (
            <Link key={job.id} href={`/admin/creative-jobs/${job.id}`} className={`group grid gap-3 border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[1fr_auto] ${job.status === "pending_review" ? "border-[#9c4f35]" : "border-[#ded8cc]"}`}>
              <span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{job.title}</span>
                  <Badge className={job.moderationRisk === "high" ? "border-[#9c4f35] bg-[#fffaf5] text-[#9c4f35]" : undefined}>{creativeJobStatusLabel(job.status)}</Badge>
                </span>
                <span className="mt-1 block text-sm text-[#6d675d]">{job.contactName} · {job.contactEmail}</span>
                <span className="mt-2 block text-xs uppercase tracking-wide text-[#8a8277]">{job.projectType === "both" ? "Physical & Digital" : job.projectType} · Posted {formatDate(job.createdAt)}</span>
              </span>
              <span className="flex items-start gap-2 text-sm font-semibold text-[#211f1b]">
                Review job <ArrowRight className="mt-0.5 h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
              <span className="md:col-span-2">
                <ModerationSummary compact decision={job.moderationDecision} risk={job.moderationRisk} reason={job.moderationReason} signals={job.moderationSignals} />
              </span>
            </Link>
          ))
        ) : (
          <EmptyState title="No creative jobs yet" description="Creative job posts will appear here when people submit them." />
        )}
      </div>
    </section>
  );
}

type AdminCreativeJobListItem = Awaited<ReturnType<typeof getAdminCreativeJobs>>[number];

function reviewPriority(job: AdminCreativeJobListItem) {
  return (job.moderationRisk === "high" ? 10 : 0)
    + (job.status === "pending_review" ? 8 : 0)
    + (job.status === "open" ? 2 : 0)
    + (job.status === "in_discussion" ? 1 : 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
