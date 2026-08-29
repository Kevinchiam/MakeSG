"use client";

import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { useRef, useState } from "react";
import { updateCreativeJobFromForm } from "@/components/admin/actions";
import { ModerationSummary } from "@/components/admin/moderation-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { services } from "@/lib/data";
import type { PublicCreativeJob } from "@/lib/creative-jobs";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

export function AdminCreativeJobEditForm({ job }: { job: PublicCreativeJob }) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  useFeedbackFocus(messageRef, message);

  async function saveJob(formData: FormData) {
    setIsSaving(true);
    setMessage(null);

    const result = await updateCreativeJobFromForm(job.id, formData);
    setIsSaving(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.message ?? "Could not save this creative job." });
      return;
    }

    setMessage({ tone: "success", text: "Creative job updated." });
  }

  return (
    <form action={saveJob} className="grid gap-5 border border-[#ded8cc] bg-white p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Admin edit</p>
        <h2 className="mt-1 font-serif text-3xl font-semibold">Listing details</h2>
        <p className="mt-2 text-sm leading-6 text-[#6d675d]">Update the public job post, contact details, review status, and services from one place.</p>
      </div>
      {message ? (
        <p
          ref={messageRef}
          tabIndex={-1}
          className={`border p-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}
      <ModerationSummary decision={job.moderationDecision} risk={job.moderationRisk} reason={job.moderationReason} signals={job.moderationSignals} />
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
            <option value="pending_review">Pending review</option>
            <option value="open">Open</option>
            <option value="in_discussion">In discussion</option>
            <option value="taken">Taken</option>
            <option value="archived">Move to trash</option>
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
      <Button type="submit" disabled={isSaving}>
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save creative job"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}
