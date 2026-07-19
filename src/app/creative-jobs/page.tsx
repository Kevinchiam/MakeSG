import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicCreativeJobs } from "@/lib/creative-jobs";

export const metadata: Metadata = { title: "Creative jobs" };
export const dynamic = "force-dynamic";

export default async function CreativeJobsPage() {
  const jobs = await getPublicCreativeJobs();

  return (
    <section className="container-shell py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Provider opportunities</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Creative jobs</h1>
          <p className="mt-4 max-w-2xl text-[#6d675d]">Open project listings from creatives looking for fabrication, production, photography, design and specialist services.</p>
        </div>
        <Button asChild>
          <Link href="/for-creatives">Post a job</Link>
        </Button>
      </div>

      {jobs.length ? (
        <div className="mt-10 grid gap-5">
          {jobs.map((job) => (
            <article key={job.id} className="border border-[#ded8cc] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9c4f35]">{job.projectType}</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">{job.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6d675d]">{job.description}</p>
                </div>
                <Button asChild variant="secondary">
                  <a href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`MakeSG enquiry: ${job.title}`)}`}>Contact creative</a>
                </Button>
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Budget" value={formatBudget(job.budgetMin, job.budgetMax)} />
                <Detail label="Deadline" value={job.deadline ? new Date(job.deadline).toLocaleDateString("en-SG", { dateStyle: "medium" }) : "Flexible"} />
                <Detail label="Location" value={job.preferredLocation || "Flexible"} />
                <Detail label="Contact" value={job.contactName} />
              </dl>
              {job.services.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.services.map((service) => (
                    <span key={service} className="border border-[#ded8cc] px-3 py-1 text-xs font-medium text-[#4f493f]">{service}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="No creative jobs yet"
            description="Once creatives post jobs, providers will be able to browse them here and reach out directly."
            actionHref="/for-creatives"
            actionLabel="Post the first job"
          />
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wide text-[#7a7063]">{label}</dt>
      <dd className="mt-1 text-[#211f1b]">{value}</dd>
    </div>
  );
}

function formatBudget(min: number | null, max: number | null) {
  if (min !== null && max !== null) return `SGD ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min !== null) return `From SGD ${min.toLocaleString()}`;
  if (max !== null) return `Up to SGD ${max.toLocaleString()}`;
  return "Open";
}
