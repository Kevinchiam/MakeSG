"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Send } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitCreativeJobListing } from "@/features/creative-jobs/actions";
import { services } from "@/lib/data";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";
import { creativeJobSchema } from "@/lib/validation";

type CreativeJobInput = z.input<typeof creativeJobSchema>;
type CreativeJobOutput = z.output<typeof creativeJobSchema>;

export function CreativeJobListingForm() {
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [publishedImmediately, setPublishedImmediately] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherError, setOtherError] = useState<string | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referenceCaptions, setReferenceCaptions] = useState<Record<string, string>>({});
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
  useFeedbackFocus(successRef, submittedSlug);
  useFeedbackFocus(errorRef, submitError);

  if (submittedSlug && manageUrl) {
    return (
      <div ref={successRef} className="border border-[#536343] bg-[#eef2e8] p-6 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b]" role="status" tabIndex={-1}>
        <CheckCircle2 className="h-7 w-7 text-[#536343]" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">{publishedImmediately ? "Job listing published" : "Job listing sent for review"}</h2>
        <p className="mt-2 text-sm leading-6 text-[#39462d]">
          {publishedImmediately
            ? "Businesses can now read the listing and reach out using the contact email you provided."
            : "This listing is waiting for admin review because something needs a quick check first."}
        </p>
        <div className="mt-5 border border-[#b9c6ae] bg-white p-4">
          <h3 className="font-semibold">Save your private manage link</h3>
          <p className="mt-2 text-sm leading-6 text-[#39462d]">
            Use this link later to edit the listing or mark the job as open, in discussion or taken. Anyone with this link can manage this job.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Input readOnly value={manageUrl} className="min-w-0 flex-1" />
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(manageUrl);
                setCopyMessage("Manage link copied.");
              }}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
          {copyMessage ? <p className="mt-2 text-sm font-semibold text-[#536343]" role="status">{copyMessage}</p> : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/creative-jobs">View creative jobs</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={manageUrl}>Manage this job</Link>
          </Button>
          <Button type="button" variant="secondary" onClick={() => {
            form.reset();
            setSubmittedSlug(null);
            setManageUrl(null);
            setPublishedImmediately(true);
            setCopyMessage(null);
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
            formData.set("notes", data.notes ?? "");
            referenceFiles.forEach((file) => {
              formData.append("referenceFiles", file);
              formData.append("referenceCaptions", referenceCaptions[fileKey(file)] ?? "");
            });

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
            setManageUrl(`${window.location.origin}/creative-jobs/manage/${result.manageToken}`);
            setPublishedImmediately(result.status === "open");
          } catch {
            setSubmitError("The job listing could not be published right now. Your draft has been saved in this browser.");
          } finally {
            setIsSubmitting(false);
          }
        },
        () => setSubmitError("Check the highlighted fields and try again."),
      )}
    >
      <h2 className="font-serif text-3xl font-semibold">Post a creative job</h2>
      {submitError ? (
        <p ref={errorRef} tabIndex={-1} className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm leading-6 text-[#8a3c24] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b]" role="alert">
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
        <Field label="Minimum budget (SGD)" hint="Optional. This helps businesses understand the scale." error={form.formState.errors.budgetMin?.message}>
          <Input {...form.register("budgetMin")} inputMode="numeric" placeholder="e.g. 800" />
        </Field>
        <Field label="Maximum budget (SGD)" hint="Optional. Use a realistic upper range if you have one." error={form.formState.errors.budgetMax?.message}>
          <Input {...form.register("budgetMax")} inputMode="numeric" placeholder="e.g. 2500" />
        </Field>
        <Field label="Preferred deadline" error={form.formState.errors.deadline?.message}>
          <Input {...form.register("deadline")} type="date" />
        </Field>
      </div>
      <FileUploader
        accept="media"
        maxTotalSizeMb={10}
        error={referenceError}
        value={referenceFiles}
        onFilesChange={(files) => {
          setReferenceError(null);
          setReferenceCaptions((current) => {
            const next: Record<string, string> = {};
            files.forEach((file) => {
              const key = fileKey(file);
              next[key] = current[key] ?? "";
            });
            return next;
          });
          setReferenceFiles(files);
        }}
        label="Upload reference photos or videos"
        description="Upload photos or videos that help businesses understand the job. Uploads must be 10MB total or smaller. Leave captions blank and MakeSG will add a simple one."
      />
      {referenceFiles.length ? (
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">Reference captions</legend>
          <p className="text-xs leading-5 text-[#6d675d]">Add a caption if it helps. If you leave it blank, MakeSG will add a simple caption after upload.</p>
          {referenceFiles.map((file, index) => {
            const key = fileKey(file);
            return (
              <Field key={key} label={`Caption for upload ${index + 1}`}>
                <Input
                  value={referenceCaptions[key] ?? ""}
                  onChange={(event) => setReferenceCaptions((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder="e.g. Preferred mood, finish, reference angle or material detail"
                />
              </Field>
            );
          })}
        </fieldset>
      ) : null}
      <Field label="Anything businesses should know?" error={form.formState.errors.notes?.message}>
        <Textarea {...form.register("notes")} placeholder="Access constraints, materials already purchased, files available, preferred working style..." />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        <Send className="h-4 w-4" />
        {isSubmitting ? "Posting..." : "Post job listing"}
      </Button>
    </form>
  );
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
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
