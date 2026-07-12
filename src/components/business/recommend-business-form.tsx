"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { businesses } from "@/lib/data";
import { businessRecommendationSchema } from "@/lib/validation";

type RecommendationInput = z.input<typeof businessRecommendationSchema>;
type RecommendationOutput = z.output<typeof businessRecommendationSchema>;

const strengths = [
  "Clear communication",
  "Practical advice",
  "Reliable timelines",
  "Careful craft",
  "Strong prototyping",
  "Good installation support",
  "Responsive quoting",
  "Collaborative problem-solving",
];

export function RecommendBusinessForm({ initialBusinessId }: { initialBusinessId?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<RecommendationInput, unknown, RecommendationOutput>({
    resolver: zodResolver(businessRecommendationSchema),
    defaultValues: {
      businessId: initialBusinessId ?? "",
      relationship: "client",
      recommendedFor: [],
      permissionToContact: true,
      permissionToPublishName: false,
    },
  });
  const watched = useWatch({ control: form.control }) as RecommendationInput;
  const selectedStrengths = watched.recommendedFor ?? [];

  function submit(data: RecommendationOutput) {
    window.localStorage.setItem("makesg-last-business-recommendation", JSON.stringify({ ...data, status: "pending" }));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-[#536343] bg-[#eef2e8] p-6" role="status">
        <Sparkles className="mb-3 h-7 w-7 text-[#536343]" aria-hidden />
        <h2 className="text-xl font-semibold">Recommendation received</h2>
        <p className="mt-2 text-sm leading-6 text-[#39462d]">
          Thanks for sharing a trusted source. It is saved locally in this MVP and would go to admin moderation before appearing publicly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid gap-5 border border-[#ded8cc] bg-white p-6">
      <h2 className="font-serif text-3xl font-semibold">Recommend a business</h2>
      <p className="text-sm leading-6 text-[#6d675d]">
        Share a provider you have worked with and would trust again. This is moderated and focused on word-of-mouth reliability, not public ratings.
      </p>

      <Field label="Business">
        <select {...form.register("businessId")} className="min-h-11 border border-[#ded8cc] bg-white px-3">
          <option value="">Choose a business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </Field>
      {form.formState.errors.businessId ? <p className="text-sm text-[#9c4f35]">{form.formState.errors.businessId.message}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Your name">
          <Input {...form.register("recommenderName")} />
        </Field>
        <Field label="Role or context">
          <Input {...form.register("recommenderRole")} placeholder="Designer, founder, producer..." />
        </Field>
        <Field label="Email for admin verification">
          <Input {...form.register("recommenderEmail")} type="email" placeholder="you@example.com" />
        </Field>
        <Field label="Relationship">
          <select {...form.register("relationship")} className="min-h-11 border border-[#ded8cc] bg-white px-3">
            <option value="client">Client</option>
            <option value="collaborator">Collaborator</option>
            <option value="supplier">Supplier</option>
            <option value="peer">Peer</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Project context">
        <Input {...form.register("projectContext")} placeholder="Short-run packaging, exhibition build, product prototype..." />
      </Field>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">What would you recommend them for?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {strengths.map((strength) => (
            <label key={strength} className="flex items-center gap-2 border border-[#ded8cc] px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={selectedStrengths.includes(strength)}
                onChange={(event) =>
                  form.setValue(
                    "recommendedFor",
                    event.target.checked
                      ? [...selectedStrengths, strength]
                      : selectedStrengths.filter((item) => item !== strength),
                    { shouldValidate: true },
                  )
                }
              />
              {strength}
            </label>
          ))}
        </div>
        {form.formState.errors.recommendedFor ? <p className="text-sm text-[#9c4f35]">{form.formState.errors.recommendedFor.message}</p> : null}
      </fieldset>

      <Field label="What made the experience good?">
        <Textarea {...form.register("comment")} placeholder="Keep it specific: what they helped with, how they communicated, and why you would trust them again." />
      </Field>
      {form.formState.errors.comment ? <p className="text-sm text-[#9c4f35]">{form.formState.errors.comment.message}</p> : null}

      <FileUploader
        accept="media"
        label="Add photos or a short video"
        description="Show the finished piece, prototype, installation or process. JPG, PNG, WebP, MP4, MOV or WebM up to 40MB each."
      />

      <div className="grid gap-2 text-sm">
        <label className="flex gap-2">
          <input type="checkbox" {...form.register("permissionToContact")} />
          Admins may contact me to verify this recommendation.
        </label>
        <label className="flex gap-2">
          <input type="checkbox" {...form.register("permissionToPublishName")} />
          I am comfortable showing my name if this recommendation is approved.
        </label>
      </div>

      <Button type="submit">
        <Send className="h-4 w-4" /> Submit recommendation
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
