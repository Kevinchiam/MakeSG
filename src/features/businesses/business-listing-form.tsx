"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { endorseBusiness, submitBusinessForApproval } from "@/features/businesses/actions";
import { services } from "@/lib/data";
import { businessSchema } from "@/lib/validation";
import type { ExistingBusinessSuggestion } from "@/lib/business-submissions";

type BusinessInput = z.input<typeof businessSchema>;
type BusinessOutput = z.output<typeof businessSchema>;

export function BusinessListingForm({ existingBusinesses = [] }: { existingBusinesses?: ExistingBusinessSuggestion[] }) {
  const successRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otherError, setOtherError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const [endorsedBusinessId, setEndorsedBusinessId] = useState<string | null>(null);
  const [endorseError, setEndorseError] = useState<string | null>(null);
  const [isEndorsing, setIsEndorsing] = useState(false);
  const form = useForm<BusinessInput, unknown, BusinessOutput>({
    resolver: zodResolver(businessSchema),
    defaultValues: { services: [], businessType: "studio", otherService: "" },
  });
  const watched = useWatch({ control: form.control }) as BusinessInput;
  const selectedServices = watched.services ?? [];
  const normalizedName = normalizeBusinessName(watched.name ?? "");
  const duplicateSuggestion = normalizedName.length >= 3
    ? existingBusinesses.find((business) => normalizeBusinessName(business.name) === normalizedName)
    : undefined;
  const validationMessages = Object.values(form.formState.errors)
    .flatMap((error) => error?.message ? [String(error.message)] : [])
    .filter((message, index, all) => all.indexOf(message) === index);

  useEffect(() => {
    if (submitted) {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [submitted]);

  if (submitted) {
    return (
      <div ref={successRef} className="border border-[#536343] bg-[#eef2e8] p-6" tabIndex={-1}>
        <h2 className="text-xl font-semibold">Listing submitted for approval</h2>
        <p className="mt-2 text-sm leading-6 text-[#39462d]">Thanks. Your listing is pending admin review.</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 border border-[#ded8cc] bg-white p-6"
      onSubmit={form.handleSubmit(
        async (data) => {
          if (duplicateSuggestion) {
            setSubmitError("This business already exists. Endorse the existing listing instead of creating a duplicate.");
            return;
          }

          if (otherChecked && !data.otherService?.trim()) {
            setOtherError("Describe the other service, or uncheck Other.");
            return;
          }

          setIsSubmitting(true);
          setSubmitError(null);
          setOtherError(null);
          try {
            const formData = new FormData();
            formData.set("name", data.name);
            formData.set("shortDescription", data.shortDescription);
            formData.set("description", data.description);
            formData.set("websiteUrl", data.websiteUrl);
            formData.set("publicEmail", data.publicEmail);
            formData.set("location", data.location);
            formData.set("minimumBudget", String(data.minimumBudget));
            formData.set("typicalLeadTime", String(data.typicalLeadTime));
            formData.set("businessType", data.businessType);
            selectedServices.forEach((service) => formData.append("services", service));
            if (otherChecked && data.otherService) formData.set("otherService", data.otherService);
            portfolioFiles.forEach((file) => formData.append("portfolioFiles", file));

            window.localStorage.setItem("makesg-last-business-listing", JSON.stringify({ ...data, publicationStatus: "pending" }));
            const result = await submitBusinessForApproval(formData);

            if (!result.ok) {
              setSubmitError(result.message);
              return;
            }

            setSubmitted(true);
          } catch {
            setSubmitError("The submission did not complete. If you uploaded large photos or videos, remove one file or use smaller files, then try again.");
          } finally {
            setIsSubmitting(false);
          }
        },
        () => {
          setSubmitAttempted(true);
          setSubmitError(null);
        },
      )}
    >
      <h2 className="font-serif text-3xl font-semibold">Business listing</h2>
      {submitError ? (
        <p className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm leading-6 text-[#8a3c24]" role="alert">
          {submitError}
        </p>
      ) : null}
      {submitAttempted && validationMessages.length ? (
        <div className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm leading-6 text-[#8a3c24]" role="alert">
          <p className="font-semibold">Please fix these fields:</p>
          <ul className="mt-2 list-disc pl-5">
            {validationMessages.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </div>
      ) : null}
      {isSubmitting ? (
        <p className="border border-[#ded8cc] bg-[#f8f5ee] p-3 text-sm leading-6 text-[#5f594f]" role="status">
          Uploading portfolio files and saving the listing. This can take a little longer for large photos or videos.
        </p>
      ) : null}
      <Field label="Business name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
      {duplicateSuggestion ? (
        <div className="grid gap-3 border border-[#b9d3bf] bg-[#f1f8f2] p-4 text-sm text-[#39462d]" role="status">
          <div>
            <p className="font-semibold">Do you mean {duplicateSuggestion.name}?</p>
            <p className="mt-1 leading-6">
              This looks like an existing listing. To avoid duplicates, endorse the business instead.
            </p>
            <p className="mt-1 text-xs">
              {duplicateSuggestion.endorsementCount} endorsement{duplicateSuggestion.endorsementCount === 1 ? "" : "s"} so far.
            </p>
          </div>
          {endorsedBusinessId === duplicateSuggestion.id ? (
            <p className="font-semibold">Thanks. Your endorsement has been recorded.</p>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled={isEndorsing || duplicateSuggestion.source !== "supabase"}
              onClick={async () => {
                setIsEndorsing(true);
                setEndorseError(null);
                const result = await endorseBusiness(duplicateSuggestion.id);
                setIsEndorsing(false);

                if (!result.ok) {
                  setEndorseError(result.message);
                  return;
                }

                setEndorsedBusinessId(duplicateSuggestion.id);
              }}
            >
              {isEndorsing ? "Endorsing..." : "Endorse this business"}
            </Button>
          )}
          {duplicateSuggestion.source !== "supabase" ? <p className="text-xs">Demo businesses cannot receive live endorsements.</p> : null}
          {endorseError ? <p className="text-[#9c4f35]">{endorseError}</p> : null}
        </div>
      ) : null}
      <Field label="Short summary" error={form.formState.errors.shortDescription?.message}><Input {...form.register("shortDescription")} /></Field>
      <Field label="Full description" error={form.formState.errors.description?.message}><Textarea {...form.register("description")} /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Website" error={form.formState.errors.websiteUrl?.message}><Input {...form.register("websiteUrl")} placeholder="https://example.com" /></Field>
        <Field label="Public email" error={form.formState.errors.publicEmail?.message}><Input {...form.register("publicEmail")} /></Field>
        <Field label="Location" error={form.formState.errors.location?.message}><Input {...form.register("location")} placeholder="Ubi" /></Field>
        <Field label="Business type"><select {...form.register("businessType")} className="min-h-11 border border-[#ded8cc] bg-white px-3"><option value="independent">Independent</option><option value="studio">Studio</option><option value="workshop">Workshop</option><option value="consultancy">Consultancy</option><option value="manufacturer">Manufacturer</option><option value="supplier">Supplier</option></select></Field>
        <Field
          label="Minimum budget (SGD)"
          hint="Enter the smallest project budget you usually accept, in Singapore dollars."
          error={form.formState.errors.minimumBudget?.message}
        >
          <Input {...form.register("minimumBudget")} inputMode="numeric" placeholder="e.g. 1200" />
        </Field>
        <Field
          label="Typical lead time (days)"
          hint="Enter the usual number of calendar days needed before delivery."
          error={form.formState.errors.typicalLeadTime?.message}
        >
          <Input {...form.register("typicalLeadTime")} inputMode="numeric" placeholder="e.g. 14" />
        </Field>
      </div>
      <Checklist
        label="Services"
        error={form.formState.errors.services?.message}
        items={services.map((s) => s.slug)}
        labels={Object.fromEntries(services.map((s) => [s.slug, s.name]))}
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
      <FileUploader
        accept="media"
        maxTotalSizeMb={10}
        value={portfolioFiles}
        onFilesChange={setPortfolioFiles}
        label="Upload portfolio photos or videos"
        description="Photos and videos are stored in Supabase and shown after admin approval. Uploads must be 10MB total or smaller."
      />
      <Button type="submit" disabled={isSubmitting || Boolean(duplicateSuggestion)}><Send className="h-4 w-4" /> {isSubmitting ? "Submitting..." : "Submit for approval"}</Button>
    </form>
  );
}

function normalizeBusinessName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}{hint ? <span className="text-xs font-normal leading-5 text-[#6d675d]">{hint}</span> : null}{error ? <span className="text-[#9c4f35]">{error}</span> : null}</label>;
}

function Checklist({ label, error, items, labels = {}, selected, onChange }: { label: string; error?: string; items: string[]; labels?: Record<string, string>; selected: string[]; onChange: (next: string[]) => void }) {
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
