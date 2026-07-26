"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitCreativeJobListing } from "@/features/creative-jobs/actions";
import { services } from "@/lib/data";
import { creativeJobSchema } from "@/lib/validation";

type CreativeJobInput = z.input<typeof creativeJobSchema>;
type CreativeJobOutput = z.output<typeof creativeJobSchema>;

export function CreativeJobListingForm() {
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherError, setOtherError] = useState<string | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CreativeJobInput, unknown, CreativeJobOutput>({
    resolver: zodResolver(creativeJobSchema),
    defaultValues: {
      title: "",
      description: "",
      contactName: "",
      contactEmail: "",
      companyName: "",
      projectType: "physical",
      services: [],
      otherService: "",
      notes: "",
    },
  });
  const watched = useWatch({ control: form.control }) as CreativeJobInput;
  const selectedServices = watched.services ?? [];

  useEffect(() => {
    if (submittedSlug) {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [submittedSlug]);

  useEffect(() => {
    if (submitError) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [submitError]);

  if (submittedSlug) {
    return (
      <div ref={successRef} className="border border-[#536343] bg-[#eef2e8] p-6" tabIndex={-1}>
        <CheckCircle2 className="h-7 w-7 text-[#536343]" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Job listing published</h2>
        <p className="mt-2 text-sm leading-6 text-[#39462d]">
          Providers can now review the listing and reach out using the contact email you provided.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/creative-jobs">View creative jobs</Link>
          </Button>
          <Button type="button" variant="secondary" onClick={() => {
            form.reset();
            setSubmittedSlug(null);
          }}>
            Create another listing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 border border-[#ded8cc] bg-white p-6"
      onSubmit={form.handleSubmit(
        async (data) => {
          if (otherChecked && !data.otherService?.trim()) {
            setOtherError("Describe the other service, or uncheck Other.");
            return;
          }

          setIsSubmitting(true);
          setSubmitError(null);
          setOtherError(null);
          setReferenceError(null);
          form.clearErrors();

          try {
            const formData = new FormData();
            formData.set("title", data.title);
            formData.set("description", data.description);
            formData.set("contactName", data.contactName);
            formData.set("contactEmail", data.contactEmail);
            formData.set("companyName", data.companyName ?? "");
            formData.set("projectType", data.projectType);
            selectedServices.forEach((service) => formData.append("services", service));
            if (otherChecked && data.otherService) formData.set("otherService", data.otherService);
            formData.set("budgetMin", data.budgetMin === undefined ? "" : String(data.budgetMin));
            formData.set("budgetMax", data.budgetMax === undefined ? "" : String(data.budgetMax));
            formData.set("deadline", data.deadline ?? "");
            formData.set("preferredLocation", data.preferredLocation ?? "");
            formData.set("notes", data.notes ?? "");
            referenceFiles.forEach((file) => formData.append("referenceFiles", file));

            window.localStorage.setItem("makesg-last-creative-job", JSON.stringify({ ...data, status: "open" }));
            const result = await submitCreativeJobListing(formData);

            if (!result.ok) {
              if (applyServerFieldErrors(result.fieldErrors, form.setError)) {
                return;
              }

              if (result.message.toLowerCase().includes("upload") || result.message.toLowerCase().includes("reference")) {
                setReferenceError(result.message);
                return;
              }

              setSubmitError(result.message);
              return;
            }

            setSubmittedSlug(result.slug);
          } catch {
            setSubmitError("The job listing could not be published right now. Your draft has been saved in this browser.");
          } finally {
            setIsSubmitting(false);
          }
        },
        () => setSubmitError("Check the highlighted fields and try again."),
      )}
    >
      <h2 className="font-serif text-3xl font-semibold">Creative job listing</h2>
      {submitError ? (
        <p ref={errorRef} className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm leading-6 text-[#8a3c24]" role="alert">
          {submitError}
        </p>
      ) : null}
      <Field label="Job title" error={form.formState.errors.title?.message}>
        <Input {...form.register("title")} placeholder="Product photography for new ceramic collection" />
      </Field>
      <Field label="What do you need made?" hint="Minimum 50 characters. Include what you need, quantity or size if known, and any important constraints." error={form.formState.errors.description?.message}>
        <Textarea {...form.register("description")} placeholder="Describe the object, shoot, installation, prototype, batch or production support you need." />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Your name" error={form.formState.errors.contactName?.message}>
          <Input {...form.register("contactName")} />
        </Field>
        <Field label="Contact email" error={form.formState.errors.contactEmail?.message}>
          <Input {...form.register("contactEmail")} />
        </Field>
        <Field label="Company or studio">
          <Input {...form.register("companyName")} placeholder="Optional" />
        </Field>
        <Field label="Project type">
          <select {...form.register("projectType")} className="min-h-11 border border-[#ded8cc] bg-white px-3">
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="both">Physical & Digital</option>
          </select>
        </Field>
      </div>
      <Checklist
        label="Services needed"
        error={form.formState.errors.services?.message}
        items={services.map((service) => service.slug)}
        labels={Object.fromEntries(services.map((service) => [service.slug, service.name]))}
        selected={selectedServices}
        onChange={(next) => form.setValue("services", next, { shouldValidate: true })}
      />
      <fieldset className="grid gap-2">
        <legend className="sr-only">Other service</legend>
        <label className="flex items-center gap-2 border border-[#ded8cc] px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={otherChecked}
            onChange={(event) => {
              setOtherChecked(event.target.checked);
              setOtherError(null);
              if (!event.target.checked) form.setValue("otherService", "", { shouldValidate: true });
            }}
          />
          Other
        </label>
        {otherChecked ? (
          <Field label="Describe other service" error={form.formState.errors.otherService?.message ?? otherError ?? undefined}>
            <Input {...form.register("otherService")} placeholder="e.g. prop styling, glass blowing, mural painting" />
          </Field>
        ) : null}
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Minimum budget (SGD)" hint="Optional. This helps providers understand the scale." error={form.formState.errors.budgetMin?.message}>
          <Input {...form.register("budgetMin")} inputMode="numeric" placeholder="e.g. 800" />
        </Field>
        <Field label="Maximum budget (SGD)" hint="Optional. Use a realistic upper range if you have one." error={form.formState.errors.budgetMax?.message}>
          <Input {...form.register("budgetMax")} inputMode="numeric" placeholder="e.g. 2500" />
        </Field>
        <Field label="Preferred deadline" error={form.formState.errors.deadline?.message}>
          <Input {...form.register("deadline")} type="date" />
        </Field>
        <Field label="Preferred location" hint="Optional. Add a Singapore area if location matters." error={form.formState.errors.preferredLocation?.message}>
          <Input {...form.register("preferredLocation")} placeholder="e.g. Hougang, Ubi, remote-friendly" />
        </Field>
      </div>
      <FileUploader
        accept="media"
        maxTotalSizeMb={10}
        error={referenceError}
        value={referenceFiles}
        onFilesChange={(files) => {
          setReferenceError(null);
          setReferenceFiles(files);
        }}
        label="Upload reference photos or videos"
        description="Upload photos or videos that help providers understand the job. Uploads must be 10MB total or smaller."
      />
      <Field label="Anything providers should know?" error={form.formState.errors.notes?.message}>
        <Textarea {...form.register("notes")} placeholder="Access constraints, materials already purchased, files available, preferred working style..." />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <Send className="h-4 w-4" />
        {isSubmitting ? "Publishing..." : "Publish job listing"}
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

function Checklist({
  label,
  error,
  items,
  labels = {},
  selected,
  onChange,
}: {
  label: string;
  error?: string;
  items: string[];
  labels?: Record<string, string>;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 border border-[#ded8cc] px-3 py-2 text-sm">
            <input type="checkbox" checked={selected.includes(item)} onChange={(event) => onChange(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} />
            {labels[item] ?? item}
          </label>
        ))}
      </div>
      {error ? <span className="text-sm text-[#9c4f35]">{error}</span> : null}
    </fieldset>
  );
}

function applyServerFieldErrors(
  fieldErrors: Record<string, string> | undefined,
  setError: ReturnType<typeof useForm<CreativeJobInput, unknown, CreativeJobOutput>>["setError"],
) {
  if (!fieldErrors || Object.keys(fieldErrors).length === 0) return false;

  for (const [field, message] of Object.entries(fieldErrors)) {
    setError(field as FieldPath<CreativeJobInput>, { type: "server", message });
  }

  return true;
}
