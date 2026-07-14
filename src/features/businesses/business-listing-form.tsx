"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitBusinessForApproval } from "@/features/businesses/actions";
import { services } from "@/lib/data";
import { businessSchema } from "@/lib/validation";

type BusinessInput = z.input<typeof businessSchema>;
type BusinessOutput = z.output<typeof businessSchema>;

export function BusinessListingForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const form = useForm<BusinessInput, unknown, BusinessOutput>({
    resolver: zodResolver(businessSchema),
    defaultValues: { services: [], businessType: "studio", otherService: "" },
  });
  const watched = useWatch({ control: form.control }) as BusinessInput;
  const selectedServices = watched.services ?? [];

  if (submitted) {
    return (
      <div className="border border-[#536343] bg-[#eef2e8] p-6">
        <h2 className="text-xl font-semibold">Listing submitted for approval</h2>
        <p className="mt-2 text-sm leading-6 text-[#39462d]">The admin dashboard can approve, reject, feature or unpublish the listing.</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 border border-[#ded8cc] bg-white p-6"
      onSubmit={form.handleSubmit(
        async (data) => {
          setIsSubmitting(true);
          setSubmitError(null);
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
          setIsSubmitting(false);

          if (!result.ok) {
            setSubmitError(result.message);
            return;
          }

          setSubmitted(true);
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
      {submitAttempted ? (
        <p className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm leading-6 text-[#8a3c24]" role="alert">
          Check the highlighted fields below. The full description needs more detail, the website must include https://, and at least one service is required.
        </p>
      ) : null}
      <Field label="Business name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
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
              if (!event.target.checked) form.setValue("otherService", "", { shouldValidate: true });
            }}
          />
          Other
        </label>
        {otherChecked ? (
          <Field label="Describe other service" error={form.formState.errors.otherService?.message}>
            <Input {...form.register("otherService")} placeholder="e.g. prop styling, glass blowing, mural painting" />
          </Field>
        ) : null}
      </fieldset>
      <FileUploader
        accept="media"
        value={portfolioFiles}
        onFilesChange={setPortfolioFiles}
        label="Upload portfolio photos or videos"
        description="Photos and videos are stored in Supabase and shown on your listing after admin approval."
      />
      <Button type="submit" disabled={isSubmitting}><Send className="h-4 w-4" /> {isSubmitting ? "Submitting..." : "Submit for approval"}</Button>
    </form>
  );
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
