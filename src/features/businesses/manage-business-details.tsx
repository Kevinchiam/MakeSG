"use client";

import { Save } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateBusinessDetailsByToken } from "@/features/businesses/actions";
import { services } from "@/lib/data";
import type { ManagedBusiness } from "@/lib/business-submissions";

export function ManageBusinessDetails({ token, business }: { token: string; business: ManagedBusiness }) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const initialSelectedServices = services.filter((service) => business.services.includes(service.name)).map((service) => service.slug);
  const initialOtherService = business.services.find((service) => !services.some((known) => known.name === service)) ?? "";
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
      window.setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setFieldErrors({});

    selectedServices.forEach((service) => formData.append("services", service));
    if (otherChecked) formData.set("otherService", otherService);

    const result = await updateBusinessDetailsByToken(token, formData);
    setIsSaving(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setMessage({ tone: "error", text: result.message });
      window.setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }

    setMessage({ tone: "success", text: "Listing details updated. Your changes are waiting for review." });
    window.setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  return (
    <form action={updateDetails} className="mt-8 grid gap-5 border border-[#ded8cc] bg-white p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Listing details</p>
        <h2 className="mt-1 text-2xl font-semibold">Edit your business listing</h2>
      </div>
      {message ? (
        <p ref={messageRef} className={`border p-3 text-sm ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`} role={message.tone === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}
      <Field label="Business name" error={fieldErrors.name}>
        <Input name="name" defaultValue={business.name} required />
      </Field>
      <Field label="Short summary" error={fieldErrors.shortDescription}>
        <Input name="shortDescription" defaultValue={business.shortDescription} required />
      </Field>
      <Field label="Full description" error={fieldErrors.description}>
        <Textarea name="description" defaultValue={business.description} required />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Website (optional)" error={fieldErrors.websiteUrl}>
          <Input name="websiteUrl" defaultValue={business.websiteUrl} />
        </Field>
        <Field label="Public email (optional)" error={fieldErrors.publicEmail}>
          <Input name="publicEmail" defaultValue={business.publicEmail} />
        </Field>
        <Field label="Phone number (optional)" error={fieldErrors.phoneNumber}>
          <Input name="phoneNumber" defaultValue={business.phoneNumber} placeholder="+65 8123 4567" />
        </Field>
        <Field label="Location (optional)" error={fieldErrors.location}>
          <Input name="location" defaultValue={business.location} />
        </Field>
        <Field label="Business type" error={fieldErrors.businessType}>
          <select name="businessType" defaultValue={business.businessType} className="min-h-11 border border-[#ded8cc] bg-white px-3">
            <option value="independent">Independent</option>
            <option value="studio">Studio</option>
            <option value="workshop">Workshop</option>
            <option value="consultancy">Consultancy</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="supplier">Supplier</option>
          </select>
        </Field>
        <Field label="Minimum budget (SGD, optional)" hint="Optional. Enter the smallest project budget usually accepted, in Singapore dollars." error={fieldErrors.minimumBudget}>
          <Input name="minimumBudget" defaultValue={business.minimumBudget > 0 ? business.minimumBudget : ""} inputMode="numeric" />
        </Field>
        <Field label="Typical lead time (days, optional)" hint="Optional. Enter the usual number of calendar days needed before delivery." error={fieldErrors.typicalLeadTime}>
          <Input name="typicalLeadTime" defaultValue={business.typicalLeadTime > 0 ? business.typicalLeadTime : ""} inputMode="numeric" />
        </Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Services</legend>
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
