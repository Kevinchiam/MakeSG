import { notFound } from "next/navigation";
import { AdminCreativeJobDeleteButton } from "@/components/admin/admin-creative-job-delete-button";
import { AdminCreativeJobEditForm } from "@/components/admin/admin-creative-job-edit-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCreativeJob } from "@/lib/creative-jobs";

export const dynamic = "force-dynamic";

export default async function AdminCreativeJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getAdminCreativeJob(id);
  if (!job) notFound();

  return (
    <section className="container-shell py-12">
      <AdminPageHeader title={job.title} description="Review and edit this creative job listing." />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.6fr]">
        <AdminCreativeJobEditForm job={job} />

        <aside className="grid content-start gap-5">
          <div className="border border-[#ded8cc] bg-white p-5">
            <h2 className="text-xl font-semibold">Reference uploads</h2>
            {job.references.length ? (
              <div className="mt-4 grid gap-3">
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
            ) : (
              <p className="mt-3 text-sm text-[#6d675d]">No reference files uploaded.</p>
            )}
          </div>
          <AdminCreativeJobDeleteButton jobId={job.id} />
        </aside>
      </div>
    </section>
  );
}
