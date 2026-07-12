"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { materials, services } from "@/lib/data";

const locations = ["Ubi", "Kaki Bukit", "Tai Seng", "Geylang", "Woodlands", "Yishun", "Jurong", "Bukit Merah", "Kampong Glam", "Queenstown"];

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (String(value)) params.set(key, String(value));
    }
    router.push(`/businesses?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="border border-[#ded8cc] bg-white p-4" aria-label="Provider filters">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        <h2 className="font-semibold">Filters</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Field label="Search">
          <Input name="q" defaultValue={searchParams.get("q") ?? ""} placeholder="CNC, exhibition, fabric..." />
        </Field>
        <Field label="Service">
          <select name="service" defaultValue={searchParams.get("service") ?? ""} className="min-h-11 w-full border border-[#ded8cc] bg-white px-3 text-sm">
            <option value="">Any service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Material">
          <select name="material" defaultValue={searchParams.get("material") ?? ""} className="min-h-11 w-full border border-[#ded8cc] bg-white px-3 text-sm">
            <option value="">Any material</option>
            {materials.map((material) => (
              <option key={material.slug} value={material.name}>
                {material.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Location">
          <select name="location" defaultValue={searchParams.get("location") ?? ""} className="min-h-11 w-full border border-[#ded8cc] bg-white px-3 text-sm">
            <option value="">Any location</option>
            {locations.map((location) => (
              <option key={location}>{location}</option>
            ))}
          </select>
        </Field>
        <Field label="Prototype or production">
          <select name="mode" defaultValue={searchParams.get("mode") ?? ""} className="min-h-11 w-full border border-[#ded8cc] bg-white px-3 text-sm">
            <option value="">Either</option>
            <option value="prototype">Prototype</option>
            <option value="production">Production</option>
          </select>
        </Field>
        <Field label="Maximum starting budget">
          <Input name="minBudget" inputMode="numeric" defaultValue={searchParams.get("minBudget") ?? ""} placeholder="5000" />
        </Field>
        <Field label="Maximum lead time in days">
          <Input name="leadTime" inputMode="numeric" defaultValue={searchParams.get("leadTime") ?? ""} placeholder="30" />
        </Field>
        <Field label="Business type">
          <select name="businessType" defaultValue={searchParams.get("businessType") ?? ""} className="min-h-11 w-full border border-[#ded8cc] bg-white px-3 text-sm">
            <option value="">Any type</option>
            <option value="independent">Independent specialist</option>
            <option value="studio">Studio</option>
            <option value="workshop">Workshop</option>
            <option value="consultancy">Consultancy</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="supplier">Supplier</option>
          </select>
        </Field>
        <Field label="On-site or remote">
          <select name="delivery" defaultValue={searchParams.get("delivery") ?? ""} className="min-h-11 w-full border border-[#ded8cc] bg-white px-3 text-sm">
            <option value="">Either</option>
            <option value="onsite">On-site</option>
            <option value="remote">Remote</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="verified" value="true" defaultChecked={searchParams.get("verified") === "true"} />
          Verified only
        </label>
      </div>
      <div className="mt-5 flex gap-2">
        <Button type="submit" className="flex-1">Apply filters</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/businesses")}>Reset</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#4f493f]">
      {label}
      {children}
    </label>
  );
}
