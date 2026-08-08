"use client";

import { PencilLine, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { requestBusinessChange } from "@/components/business/change-request-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FieldErrors = Record<string, string>;

export function RequestBusinessChangePanel({ businessId, businessName }: { businessId: string; businessName: string }) {
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [requesterEmail, setRequesterEmail] = useState("");
  const [reason, setReason] = useState("");

  async function submit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);
    setFieldErrors({});
    formData.set("businessId", businessId);
    formData.set("requesterEmail", requesterEmail);
    formData.set("reason", reason);

    const result = await requestBusinessChange(formData);
    setIsSubmitting(false);
    window.setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setMessage({ tone: "error", text: result.message });
      return;
    }

    setMessage({ tone: "success", text: result.message });
    setRequesterEmail("");
    setReason("");
  }

  return (
    <div className="grid gap-3">
      <Button type="button" variant="ghost" className="justify-start px-0 text-[#4f493f] underline hover:bg-transparent" onClick={() => setOpen(true)}>
        <PencilLine className="h-4 w-4" aria-hidden /> Request a change
      </Button>
      {open ? (
        <form action={submit} className="grid gap-3 border border-[#ded8cc] bg-[#fbfaf7] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">Request a listing change</h3>
              <p className="mt-1 text-xs leading-5 text-[#6d675d]">Tell admin what should be updated for {businessName}. It will appear in the admin dashboard for review.</p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[#ded8cc] bg-white hover:bg-[#f3eee5] focus-visible:outline focus-visible:outline-2"
              aria-label="Close change request panel"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {message ? (
            <p
              ref={feedbackRef}
              className={`border p-3 text-sm leading-6 ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`}
              role={message.tone === "error" ? "alert" : "status"}
            >
              {message.text}
            </p>
          ) : null}
          <label className="grid gap-1.5 text-sm font-medium">
            Your email
            <Input
              type="email"
              value={requesterEmail}
              onChange={(event) => {
                setFieldErrors((current) => ({ ...current, requesterEmail: "" }));
                setRequesterEmail(event.target.value);
              }}
            />
            {fieldErrors.requesterEmail ? <span className="text-[#9c4f35]">{fieldErrors.requesterEmail}</span> : null}
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Reason for change
            <Textarea
              value={reason}
              onChange={(event) => {
                setFieldErrors((current) => ({ ...current, reason: "" }));
                setReason(event.target.value);
              }}
              placeholder="What is inaccurate or missing? Include the suggested correction if you know it."
            />
            {fieldErrors.reason ? <span className="text-[#9c4f35]">{fieldErrors.reason}</span> : null}
          </label>
          <Button type="submit" disabled={isSubmitting}>
            <Send className="h-4 w-4" aria-hidden /> {isSubmitting ? "Saving..." : "Submit request"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
