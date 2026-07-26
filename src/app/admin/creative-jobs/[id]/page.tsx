import { notFound } from "next/navigation";
import { updateCreativeJobFromForm } from "@/components/admin/actions";
import { AdminCreativeJobDeleteButton } from "@/components/admin/admin-creative-job-delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { services } from "@/lib/data";
import { getAdminCreativeJob } from "@/lib/creative-jobs";

export const dynamic = "force-dynamic";

export default async function AdminCreativeJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getAdminCreativeJob(id);
  if (!job) notFound();
  const updateJob = async (formData: FormData) => {
    "use server";
    await updateCreativeJobFromForm(job.id, formData);
  };

  return (
    <section className="container-shell py-12">
      <AdminPageHeader title={job.title} description="Review and edit this creative job listing." />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.6fr]">
        <form action={updateJob} className="grid gap-5 border border-[#ded8cc] bg-white p-6">
          <h2 className="font-serif text-3xl font-semibold">Listing details</h2>
          <Field label="Job title"><Input name="title" defaultValue={job.title} required /></Field>
          <Field label="Description"><Textarea name="description" defaultValue={job.description} required /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Contact name"><Input name="contactName" defaultValue={job.contactName} required /></Field>
            <Field label="Contact email"><Input name="contactEmail" defaultValue={job.contactEmail} required /></Field>
            <Field label="Company or studio"><Input name="companyName" defaultValue={job.companyName ?? ""} /></Field>
            <Field label="Project type">
              <select name="projectType" defaultValue={job.projectType} className="min-h-11 border border-[#ded8cc] bg-white px-3">
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
                <option value="both">Physical & Digital</option>
              </select>
            </Field>
            <Field label="Minimum budget (SGD)"><Input name="budgetMin" defaultValue={job.budgetMin ?? ""} inputMode="numeric" /></Field>
            <Field label="Maximum budget (SGD)"><Input name="budgetMax" defaultValue={job.budgetMax ?? ""} inputMode="numeric" /></Field>
            <Field label="Preferred deadline"><Input name="deadline" type="date" defaultValue={job.deadline ?? ""} /></Field>
            <Field label="Status">
              <select name="status" defaultValue={job.status} className="min-h-11 border border-[#ded8cc] bg-white px-3">
                <option value="open">Open</option>
                <option value="in_discussion">In discussion</option>
                <option value="taken">Taken</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Services</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((service) => (
                <label key={service.slug} className="flex items-center gap-2 border border-[#ded8cc] px-3 py-2 text-sm">
                  <input type="checkbox" name="services" value={service.name} defaultChecked={job.services.includes(service.name)} />
                  {service.name}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Notes"><Textarea name="notes" defaultValue={job.notes ?? ""} /></Field>
          <Button type="submit">Save changes</Button>
        </form>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}
