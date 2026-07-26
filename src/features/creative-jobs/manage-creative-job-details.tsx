"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateCreativeJobDetailsByToken } from "@/features/creative-jobs/actions";
import { services } from "@/lib/data";
import type { PublicCreativeJob } from "@/lib/creative-jobs";

export function ManageCreativeJobDetails({ token, job }: { token: string; job: PublicCreativeJob }) {
  const initialSelectedServices = services.filter((service) => job.services.includes(service.name)).map((service) => service.slug);
  const initialOtherService = job.services.find((service) => !services.some((known) => known.name === service)) ?? "";
  const [selectedServices, setSelectedServices] = useState(initialSelectedServices);
  const [otherChecked, setOtherChecked] = useState(Boolean(initialOtherService));
  const [otherService, setOtherService] = useState(initialOtherService);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function updateDetails(formData: FormData) {
    if (otherChecked && !otherService.trim()) {
      setFieldErrors({ otherService: "Describe the other service, or uncheck Other." });
      setMessage({ tone: "error", text: "Check the highlighted fields and try again." });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setFieldErrors({});

    selectedServices.forEach((service) => formData.append("services", service));
    if (otherChecked) formData.set("otherService", otherService);

    const result = await updateCreativeJobDetailsByToken(token, formData);
    setIsSaving(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setMessage({ tone: "error", text: result.message });
      return;
    }

    setMessage({ tone: "success", text: "Listing details updated." });
  }

  return (
    <form action={updateDetails} className="mt-8 grid gap-5 border border-[#ded8cc] bg-white p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Listing details</p>
        <h2 className="mt-1 text-2xl font-semibold">Edit your job</h2>
      </div>
      {message ? (
        <p className={`border p-3 text-sm ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`} role={message.tone === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}
      <Field label="Job title" error={fieldErrors.title}>
        <Input name="title" defaultValue={job.title} required />
      </Field>
      <Field label="What do you need made?" hint="Minimum 50 characters. Include what you need, quantity or size if known, and any important constraints." error={fieldErrors.description}>
        <Textarea name="description" defaultValue={job.description} required />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Your name" error={fieldErrors.contactName}>
          <Input name="contactName" defaultValue={job.contactName} required />
        </Field>
        <Field label="Contact email" error={fieldErrors.contactEmail}>
          <Input name="contactEmail" defaultValue={job.contactEmail} required />
        </Field>
        <Field label="Company or studio">
          <Input name="companyName" defaultValue={job.companyName ?? ""} />
        </Field>
        <Field label="Project type">
          <select name="projectType" defaultValue={job.projectType} className="min-h-11 border border-[#ded8cc] bg-white px-3">
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="both">Physical & Digital</option>
          </select>
        </Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Services needed</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label key={service.slug} className="flex items-center gap-2 border border-[#ded8cc] px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.slug)}
                onChange={(event) => {
                  setSelectedServices((current) => event.target.checked ? [...current, service.slug] : current.filter((value) => value !== service.slug));
                }}
              />
              {service.name}
            </label>
          ))}
        </div>
        {fieldErrors.services ? <span className="text-sm text-[#9c4f35]">{fieldErrors.services}</span> : null}
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="sr-only">Other service</legend>
        <label className="flex items-center gap-2 border border-[#ded8cc] px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={otherChecked}
            onChange={(event) => {
              setOtherChecked(event.target.checked);
              if (!event.target.checked) setOtherService("");
            }}
          />
          Other
        </label>
        {otherChecked ? (
          <Field label="Describe other service" error={fieldErrors.otherService}>
            <Input value={otherService} onChange={(event) => setOtherService(event.target.value)} placeholder="e.g. prop styling, glass blowing, mural painting" />
          </Field>
        ) : null}
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Minimum budget (SGD)" error={fieldErrors.budgetMin}>
          <Input name="budgetMin" defaultValue={job.budgetMin ?? ""} inputMode="numeric" />
        </Field>
        <Field label="Maximum budget (SGD)" error={fieldErrors.budgetMax}>
          <Input name="budgetMax" defaultValue={job.budgetMax ?? ""} inputMode="numeric" />
        </Field>
        <Field label="Preferred deadline" error={fieldErrors.deadline}>
          <Input name="deadline" type="date" defaultValue={job.deadline ?? ""} />
        </Field>
      </div>
      <Field label="Anything businesses should know?" error={fieldErrors.notes}>
        <Textarea name="notes" defaultValue={job.notes ?? ""} />
      </Field>
      <Button type="submit" disabled={isSaving}>
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save listing details"}
      </Button>
    </form>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint ? <span className="text-xs font-normal leading-5 text-[#6d675d]">{hint}</span> : null}
      {error ? <span className="text-[#9c4f35]">{error}</span> : null}
    </label>
  );
}
