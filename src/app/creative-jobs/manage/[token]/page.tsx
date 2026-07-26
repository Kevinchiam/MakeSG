import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManageCreativeJobDetails } from "@/features/creative-jobs/manage-creative-job-details";
import { ManageCreativeJobStatus } from "@/features/creative-jobs/manage-creative-job-status";
import { creativeJobStatusLabel, getCreativeJobByManageToken } from "@/lib/creative-jobs";

export const metadata: Metadata = { title: "Manage creative job" };
export const dynamic = "force-dynamic";

export default async function ManageCreativeJobPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const job = await getCreativeJobByManageToken(token);
  if (!job) notFound();

  return (
    <section className="container-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Private job management</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Manage your creative job</h1>
          <p className="mt-5 text-lg leading-8 text-[#6d675d]">
            This private link controls only this job listing. You can update the details and status whenever the job moves forward.
          </p>
          <div className="mt-8 border border-[#ded8cc] bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#7a7063]">Job</p>
            <h2 className="mt-2 text-2xl font-semibold">{job.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#6d675d]">{job.description}</p>
            <p className="mt-4 text-sm"><span className="font-semibold">Current status:</span> {creativeJobStatusLabel(job.status)}</p>
          </div>
          <ManageCreativeJobDetails token={token} job={job} />
        </div>
        <ManageCreativeJobStatus token={token} initialStatus={job.status} />
      </div>
    </section>
  );
}
