"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { materials, services } from "@/lib/data";
import { recommendServiceSlugs } from "@/lib/recommendation";
import { projectSchema } from "@/lib/validation";

type FormInput = z.input<typeof projectSchema>;
type FormOutput = z.output<typeof projectSchema>;

const steps = ["Idea", "Requirements", "Constraints", "References", "Review"];
const storageKey = "makesg-project-draft";

export function ProjectForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      intendedOutcome: "",
      projectType: "physical",
      materials: [],
      knownServices: [],
      prototypeOrProduction: "prototype",
    },
  });
  const values = useWatch({ control: form.control }) as FormInput;

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) form.reset(JSON.parse(saved));
  }, [form]);

  useEffect(() => {
    const id = window.setTimeout(() => window.localStorage.setItem(storageKey, JSON.stringify(values)), 300);
    return () => window.clearTimeout(id);
  }, [values]);

  const recommended = useMemo(() => recommendServiceSlugs({
    title: values.title ?? "",
    description: values.description ?? "",
    materials: values.materials ?? [],
    knownServices: values.knownServices ?? [],
  }), [values]);

  function submit(data: FormOutput) {
    window.localStorage.setItem(storageKey, JSON.stringify({ ...data, status: "draft" }));
    router.push("/recommendations/project_aluminium_lamp");
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid gap-8">
      <ol className="grid grid-cols-5 border border-[#ded8cc] bg-white text-xs font-semibold uppercase tracking-wide text-[#6d675d]">
        {steps.map((label, index) => (
          <li key={label} className={`border-r border-[#ded8cc] px-3 py-3 last:border-r-0 ${index === step ? "bg-[#211f1b] text-white" : ""}`}>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <Section title="Idea">
          <Field label="Project title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} placeholder="Aluminium table lamp prototype" />
          </Field>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <Textarea {...form.register("description")} placeholder="Describe the object, experience, campaign or space you want to make." />
          </Field>
          <Field label="Intended outcome" error={form.formState.errors.intendedOutcome?.message}>
            <Input {...form.register("intendedOutcome")} placeholder="Working prototype, pilot batch, installed exhibition..." />
          </Field>
          <Field label="Physical, digital or both">
            <select {...form.register("projectType")} className="min-h-11 border border-[#ded8cc] bg-white px-3">
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="both">Both</option>
            </select>
          </Field>
        </Section>
      ) : null}

      {step === 1 ? (
        <Section title="Requirements">
          <Field label="Quantity">
            <Input {...form.register("quantity")} placeholder="1 prototype, 50 samples, 300 units..." />
          </Field>
          <Field label="Dimensions">
            <Input {...form.register("dimensions")} placeholder="Approximate size or constraints" />
          </Field>
          <Checklist label="Materials" items={materials.map((material) => material.name)} selected={values.materials ?? []} onChange={(next) => form.setValue("materials", next)} />
          <Checklist label="Known services" items={services.map((service) => service.slug)} labels={Object.fromEntries(services.map((service) => [service.slug, service.name]))} selected={values.knownServices ?? []} onChange={(next) => form.setValue("knownServices", next)} />
          <Field label="Prototype or production">
            <select {...form.register("prototypeOrProduction")} className="min-h-11 border border-[#ded8cc] bg-white px-3">
              <option value="prototype">Prototype</option>
              <option value="production">Production</option>
              <option value="both">Both</option>
            </select>
          </Field>
          <Field label="Location requirements">
            <Input {...form.register("preferredLocation")} placeholder="Ubi, remote-friendly, on-site install..." />
          </Field>
        </Section>
      ) : null}

      {step === 2 ? (
        <Section title="Constraints">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minimum budget">
              <Input {...form.register("budgetMin")} inputMode="numeric" placeholder="1500" />
            </Field>
            <Field label="Maximum budget">
              <Input {...form.register("budgetMax")} inputMode="numeric" placeholder="7000" />
            </Field>
          </div>
          <Field label="Desired deadline">
            <Input {...form.register("deadline")} type="date" />
          </Field>
          <Field label="Deadline flexibility">
            <Input {...form.register("deadlineFlexibility")} placeholder="Fixed, flexible by two weeks..." />
          </Field>
        </Section>
      ) : null}

      {step === 3 ? (
        <Section title="References">
          <FileUploader />
          <Field label="External reference links">
            <Textarea {...form.register("referenceLinks")} placeholder="Paste URLs to moodboards, drawings, references or docs." />
          </Field>
        </Section>
      ) : null}

      {step === 4 ? (
        <Section title="Review">
          <div className="grid gap-4 border border-[#ded8cc] bg-white p-5 text-sm leading-6">
            <p><strong>Title:</strong> {values.title || "Untitled project"}</p>
            <p><strong>Description:</strong> {values.description || "No description yet."}</p>
            <p><strong>Budget:</strong> {String(values.budgetMin || "?")} to {String(values.budgetMax || "?")} SGD</p>
            <p><strong>Recommended service categories:</strong> {recommended.length ? recommended.join(", ") : "Add more detail to generate recommendations."}</p>
          </div>
        </Section>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3 border-t border-[#ded8cc] pt-5">
        <Button type="button" variant="secondary" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => window.localStorage.setItem(storageKey, JSON.stringify(values))}>
            <Save className="h-4 w-4" /> Save draft
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit">
              <Check className="h-4 w-4" /> Submit brief
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5">
      <h2 className="font-serif text-3xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-[#9c4f35]">{error}</span> : null}
    </label>
  );
}

function Checklist({
  label,
  items,
  labels = {},
  selected,
  onChange,
}: {
  label: string;
  items: string[];
  labels?: Record<string, string>;
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 border border-[#ded8cc] bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={(event) => onChange(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))}
            />
            {labels[item] ?? item}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
