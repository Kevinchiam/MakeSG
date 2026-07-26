import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { creativeJobStatusLabel, getPublicCreativeJobs } from "@/lib/creative-jobs";

export const metadata: Metadata = { title: "Creative jobs" };
export const dynamic = "force-dynamic";

export default async function CreativeJobsPage() {
  const jobs = await getPublicCreativeJobs();

  return (
    <section className="container-shell py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Business opportunities</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Creative jobs</h1>
          <p className="mt-4 max-w-2xl text-[#6d675d]">Open project listings from creatives looking for fabrication, production, photography, design and specialist businesses.</p>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9c4f35]">{job.projectType === "both" ? "Physical & Digital" : job.projectType}</p>
                    <span className={`border px-2 py-1 text-xs font-semibold ${job.status === "in_discussion" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#ded8cc] bg-[#fbfaf7] text-[#4f493f]"}`}>
                      {creativeJobStatusLabel(job.status)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">{job.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6d675d]">{job.description}</p>
                  {job.status === "in_discussion" ? (
                    <p className="mt-2 text-sm font-medium text-[#536343]">This job is already in conversation with businesses, but the creative is still accepting useful leads.</p>
                  ) : null}
                </div>
                <Button asChild variant="secondary">
                  <a href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`MakeSG enquiry: ${job.title}`)}`}>Contact creative</a>
                </Button>
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Budget" value={formatBudget(job.budgetMin, job.budgetMax)} />
                <Detail label="Deadline" value={job.deadline ? new Date(job.deadline).toLocaleDateString("en-SG", { dateStyle: "medium" }) : "Flexible"} />
                <Detail label="Contact" value={job.contactName} />
              </dl>
              {job.services.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.services.map((service) => (
                    <span key={service} className="border border-[#ded8cc] px-3 py-1 text-xs font-medium text-[#4f493f]">{service}</span>
                  ))}
                </div>
              ) : null}
              {job.references.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {job.references.map((reference) => (
                    <a key={reference.id} href={reference.fileUrl} target="_blank" rel="noreferrer" className="block border border-[#ded8cc] bg-[#fbfaf7]">
                      {reference.mimeType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={reference.fileUrl} alt="" className="aspect-video w-full object-cover" />
                      ) : (
                        <video src={reference.fileUrl} className="aspect-video w-full bg-black object-cover" muted />
                      )}
                      <span className="block truncate px-3 py-2 text-xs font-medium">{reference.caption || reference.fileName}</span>
                    </a>
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
            description="Once creatives post jobs, businesses will be able to browse them here and reach out directly."
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
