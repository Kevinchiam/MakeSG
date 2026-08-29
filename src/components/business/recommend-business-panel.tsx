"use client";

import { Heart, Send, Star, X } from "lucide-react";
import { useRef, useState } from "react";
import { submitBusinessRecommendation } from "@/components/business/recommendation-actions";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

type FieldErrors = Record<string, string>;
type FormValues = {
  review: string;
  recommenderName: string;
  recommenderEmail: string;
  permissionToPublishName: boolean;
};

const minimumReviewCharacters = 20;

const ratingFields = [
  {
    name: "qualityRating",
    label: "Quality",
    description: "Standard of the work delivered",
  },
  {
    name: "reliabilityRating",
    label: "Reliability",
    description: "Timelines, commitments and consistency",
  },
  {
    name: "collaborationRating",
    label: "Collaboration",
    description: "Communication and problem-solving",
  },
] as const;

export function RecommendBusinessPanel({ businessId, businessName }: { businessId: string; businessName: string }) {
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [ratings, setRatings] = useState({ qualityRating: 0, reliabilityRating: 0, collaborationRating: 0 });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaCaptions, setMediaCaptions] = useState<Record<string, string>>({});
  const [links, setLinks] = useState(["", "", ""]);
  const [formValues, setFormValues] = useState<FormValues>({
    review: "",
    recommenderName: "",
    recommenderEmail: "",
    permissionToPublishName: false,
  });
  const reviewLength = formValues.review.trim().length;
  const reviewCharactersRemaining = Math.max(0, minimumReviewCharacters - reviewLength);
  useFeedbackFocus(feedbackRef, success || submitError);

  async function submit(formData: FormData) {
    setIsSubmitting(true);
    setSuccess(false);
    setSubmitError(null);
    setFieldErrors({});

    formData.set("businessId", businessId);
    formData.set("review", formValues.review);
    formData.set("recommenderName", formValues.recommenderName);
    formData.set("recommenderEmail", formValues.recommenderEmail);
    if (formValues.permissionToPublishName) formData.set("permissionToPublishName", "on");
    Object.entries(ratings).forEach(([name, value]) => formData.set(name, String(value)));
    links.map((link) => link.trim()).filter(Boolean).forEach((link) => formData.append("supportingLinks", link));
    mediaFiles.forEach((file) => {
      formData.append("recommendationMedia", file);
      formData.append("recommendationMediaCaptions", mediaCaptions[fileKey(file)] ?? "");
    });

    const result = await submitBusinessRecommendation(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setSubmitError(result.message);
      return;
    }

    setSuccess(true);
    setRatings({ qualityRating: 0, reliabilityRating: 0, collaborationRating: 0 });
    setFormValues({ review: "", recommenderName: "", recommenderEmail: "", permissionToPublishName: false });
    setMediaFiles([]);
    setMediaCaptions({});
    setLinks(["", "", ""]);
  }

  return (
    <div className="grid gap-4">
      <Button type="button" variant="secondary" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <Heart className="h-4 w-4" aria-hidden /> Recommend
      </Button>

      {open ? (
        <form action={submit} className="grid gap-5 border border-[#ded8cc] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Recommend {businessName}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d675d]">
                Share a first-hand review. Admin checks recommendations before they appear publicly.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#ded8cc] bg-white text-[#211f1b] hover:bg-[#fbfaf7] focus-visible:outline focus-visible:outline-2"
              aria-label="Close recommendation panel"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {success ? (
            <p ref={feedbackRef} tabIndex={-1} className="border border-[#b9c6ae] bg-[#eef2e8] p-3 text-sm leading-6 text-[#39462d] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b]" role="status">
              Thanks, your recommendation has been sent for review.
            </p>
          ) : null}
          {submitError ? (
            <p ref={feedbackRef} tabIndex={-1} className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm leading-6 text-[#8a3c24] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b]" role="alert">
              {submitError}
            </p>
          ) : null}

          <fieldset className="grid gap-4">
            <legend className="text-sm font-semibold">Rate the business</legend>
            {ratingFields.map((field) => (
              <RatingControl
                key={field.name}
                label={field.label}
                description={field.description}
                value={ratings[field.name]}
                error={fieldErrors[field.name]}
                onChange={(value) => {
                  setFieldErrors((current) => ({ ...current, [field.name]: "" }));
                  setRatings((current) => ({ ...current, [field.name]: value }));
                }}
              />
            ))}
          </fieldset>

          <Field
            label="Short review"
            hint={reviewCharactersRemaining > 0
              ? `${reviewCharactersRemaining} more character${reviewCharactersRemaining === 1 ? "" : "s"} needed.`
              : `${reviewLength} characters. Good to submit.`}
            error={fieldErrors.review}
          >
            <Textarea
              name="review"
              value={formValues.review}
              onChange={(event) => {
                setFieldErrors((current) => ({ ...current, review: "" }));
                setFormValues((current) => ({ ...current, review: event.target.value }));
              }}
              placeholder="What made the experience good? Keep it specific and useful for future creatives."
            />
          </Field>

          <FileUploader
            accept="media"
            maxTotalSizeMb={10}
            error={fieldErrors.media}
            value={mediaFiles}
            onFilesChange={(files) => {
              setFieldErrors((current) => ({ ...current, media: "" }));
              setMediaCaptions((current) => {
                const next: Record<string, string> = {};
                files.forEach((file) => {
                  const key = fileKey(file);
                  next[key] = current[key] ?? "";
                });
                return next;
              });
              setMediaFiles(files);
            }}
            label="Add photos or videos"
            description="Optional. Uploads must be 10MB total or smaller. Leave captions blank and MakeSG will add a simple one."
          />
          {mediaFiles.length ? (
            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium">Captions</legend>
              <p className="text-xs leading-5 text-[#6d675d]">Add a caption if it helps. If you leave it blank, MakeSG will add a simple caption after upload.</p>
              {mediaFiles.map((file, index) => {
                const key = fileKey(file);
                return (
                  <Field key={key} label={`Caption for upload ${index + 1}`}>
                    <Input
                      value={mediaCaptions[key] ?? ""}
                      onChange={(event) => setMediaCaptions((current) => ({ ...current, [key]: event.target.value }))}
                      placeholder="e.g. Finished installation, prototype detail, process photo"
                    />
                  </Field>
                );
              })}
            </fieldset>
          ) : null}

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">Supporting links</legend>
            <p className="text-xs leading-5 text-[#6d675d]">Optional. Add up to three links, such as a project page, portfolio post or public reference.</p>
            {links.map((link, index) => (
              <Field key={index} label={`Link ${index + 1}`} error={index === 0 ? fieldErrors.supportingLinks : undefined}>
                <Input
                  type="url"
                  value={link}
                  onChange={(event) => setLinks((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                  placeholder="https://example.com/project"
                />
              </Field>
            ))}
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Your name" error={fieldErrors.recommenderName}>
              <Input
                name="recommenderName"
                value={formValues.recommenderName}
                onChange={(event) => {
                  setFieldErrors((current) => ({ ...current, recommenderName: "" }));
                  setFormValues((current) => ({ ...current, recommenderName: event.target.value }));
                }}
              />
            </Field>
            <Field label="Private email for review" error={fieldErrors.recommenderEmail}>
              <Input
                name="recommenderEmail"
                type="email"
                value={formValues.recommenderEmail}
                onChange={(event) => {
                  setFieldErrors((current) => ({ ...current, recommenderEmail: "" }));
                  setFormValues((current) => ({ ...current, recommenderEmail: event.target.value }));
                }}
              />
            </Field>
          </div>

          <label className="flex gap-2 text-sm leading-6 text-[#4f493f]">
            <input
              name="permissionToPublishName"
              type="checkbox"
              checked={formValues.permissionToPublishName}
              onChange={(event) => setFormValues((current) => ({ ...current, permissionToPublishName: event.target.checked }))}
            />
            My name may be displayed if this recommendation is approved.
          </label>

          <Button type="submit" disabled={isSubmitting}>
            <Send className="h-4 w-4" aria-hidden /> {isSubmitting ? "Sending..." : "Send for review"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function RatingControl({
  label,
  description,
  value,
  error,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-2 border border-[#ded8cc] bg-[#fbfaf7] p-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs leading-5 text-[#6d675d]">{description}</p>
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label={`${label} rating`}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center border border-[#ded8cc] bg-white text-[#9c4f35] focus-visible:outline focus-visible:outline-2"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
            onClick={() => onChange(rating)}
          >
            <Star className={value >= rating ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden />
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-[#9c4f35]">{error}</p> : null}
    </div>
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

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
