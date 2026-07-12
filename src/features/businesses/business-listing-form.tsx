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
import { materials, services } from "@/lib/data";
import { businessSchema } from "@/lib/validation";

type BusinessInput = z.input<typeof businessSchema>;
type BusinessOutput = z.output<typeof businessSchema>;

export function BusinessListingForm() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<BusinessInput, unknown, BusinessOutput>({
    resolver: zodResolver(businessSchema),
    defaultValues: { services: [], materials: [], businessType: "studio" },
  });
  const watched = useWatch({ control: form.control }) as BusinessInput;
  const selectedServices = watched.services ?? [];
  const selectedMaterials = watched.materials ?? [];

  if (submitted) {
    return (
      <div className="border border-[#536343] bg-[#eef2e8] p-6">
        <h2 className="text-xl font-semibold">Listing submitted for approval</h2>
        <p className="mt-2 text-sm leading-6 text-[#39462d]">The admin dashboard can approve, reject, feature or unpublish the listing.</p>
      </div>
    );
  }

  return (
    <form className="grid gap-5 border border-[#ded8cc] bg-white p-6" onSubmit={form.handleSubmit(() => setSubmitted(true))}>
      <h2 className="font-serif text-3xl font-semibold">Business listing</h2>
      <Field label="Business name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
      <Field label="Short summary" error={form.formState.errors.shortDescription?.message}><Input {...form.register("shortDescription")} /></Field>
      <Field label="Full description" error={form.formState.errors.description?.message}><Textarea {...form.register("description")} /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Website" error={form.formState.errors.websiteUrl?.message}><Input {...form.register("websiteUrl")} placeholder="https://example.com" /></Field>
        <Field label="Public email" error={form.formState.errors.publicEmail?.message}><Input {...form.register("publicEmail")} /></Field>
        <Field label="Location" error={form.formState.errors.location?.message}><Input {...form.register("location")} placeholder="Ubi" /></Field>
        <Field label="Business type"><select {...form.register("businessType")} className="min-h-11 border border-[#ded8cc] bg-white px-3"><option value="independent">Independent</option><option value="studio">Studio</option><option value="workshop">Workshop</option><option value="consultancy">Consultancy</option><option value="manufacturer">Manufacturer</option><option value="supplier">Supplier</option></select></Field>
        <Field label="Minimum budget"><Input {...form.register("minimumBudget")} inputMode="numeric" /></Field>
        <Field label="Typical lead time"><Input {...form.register("typicalLeadTime")} inputMode="numeric" /></Field>
      </div>
      <Checklist label="Services" items={services.map((s) => s.slug)} labels={Object.fromEntries(services.map((s) => [s.slug, s.name]))} selected={selectedServices} onChange={(next) => form.setValue("services", next)} />
      <Checklist label="Materials" items={materials.map((m) => m.name)} selected={selectedMaterials} onChange={(next) => form.setValue("materials", next)} />
      <FileUploader
        accept="media"
        label="Upload portfolio photos or videos"
        description="Add tangible examples of your work: prototypes, finished pieces, installations or process clips."
      />
      <Button type="submit"><Send className="h-4 w-4" /> Submit for approval</Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}{error ? <span className="text-[#9c4f35]">{error}</span> : null}</label>;
}

function Checklist({ label, items, labels = {}, selected, onChange }: { label: string; items: string[]; labels?: Record<string, string>; selected: string[]; onChange: (next: string[]) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.slice(0, 12).map((item) => (
          <label key={item} className="flex items-center gap-2 border border-[#ded8cc] px-3 py-2 text-sm">
            <input type="checkbox" checked={selected.includes(item)} onChange={(event) => onChange(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} />
            {labels[item] ?? item}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
