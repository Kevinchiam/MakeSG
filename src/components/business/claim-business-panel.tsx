"use client";

import { Send, ShieldCheck, X } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { requestBusinessClaim } from "@/components/business/claim-business-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

type FieldErrors = Record<string, string>;

export function ClaimBusinessPanel({
  businessId,
  businessName,
  claimed,
}: {
  businessId: string;
  businessName: string;
  claimed: boolean;
}) {
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [requesterName, setRequesterName] = useState("");
  const [requesterRole, setRequesterRole] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [claimMessage, setClaimMessage] = useState("");
  useFeedbackFocus(feedbackRef, message);

  async function submit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);
    setFieldErrors({});
    formData.set("businessId", businessId);
    formData.set("requesterName", requesterName);
    formData.set("requesterRole", requesterRole);
    formData.set("requesterEmail", requesterEmail);
    formData.set("requesterPhone", requesterPhone);
    formData.set("proofUrl", proofUrl);
    formData.set("message", claimMessage);

    const result = await requestBusinessClaim(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setMessage({ tone: "error", text: result.message });
      return;
    }

    setMessage({ tone: "success", text: result.message });
    setRequesterName("");
    setRequesterRole("");
    setRequesterEmail("");
    setRequesterPhone("");
    setProofUrl("");
    setClaimMessage("");
  }

  if (claimed) {
    return (
      <div className="border border-[#b9c6ae] bg-[#eef2e8] p-4 text-sm leading-6 text-[#39462d]">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Owner claimed
        </div>
        <p className="mt-2">This listing has been claimed by the business owner or an authorised representative.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <Button type="button" variant="ghost" className="justify-start px-0 text-[#4f493f] underline hover:bg-transparent" onClick={() => setOpen(true)}>
        <ShieldCheck className="h-4 w-4" aria-hidden /> Own this business? Claim this listing
      </Button>
      {open ? (
        <form action={submit} className="grid gap-3 border border-[#ded8cc] bg-[#fbfaf7] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">Claim this listing</h3>
              <p className="mt-1 text-xs leading-5 text-[#6d675d]">
                If you are authorised to represent {businessName}, send a claim request. MakeSG may ask for proof before sharing editing access.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[#ded8cc] bg-white hover:bg-[#f3eee5] focus-visible:outline focus-visible:outline-2"
              aria-label="Close claim request panel"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {message ? (
            <p
              ref={feedbackRef}
              tabIndex={-1}
              className={`border p-3 text-sm leading-6 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`}
              role={message.tone === "error" ? "alert" : "status"}
            >
              {message.text}
            </p>
          ) : null}
          <ClaimField label="Your name" error={fieldErrors.requesterName}>
            <Input value={requesterName} onChange={(event) => setRequesterName(event.target.value)} />
          </ClaimField>
          <ClaimField label="Your role or connection (optional)" error={fieldErrors.requesterRole}>
            <Input value={requesterRole} onChange={(event) => setRequesterRole(event.target.value)} placeholder="Owner, founder, studio manager..." />
          </ClaimField>
          <ClaimField label="Private email" error={fieldErrors.requesterEmail}>
            <Input type="email" value={requesterEmail} onChange={(event) => setRequesterEmail(event.target.value)} />
          </ClaimField>
          <ClaimField label="Phone number (optional)" error={fieldErrors.requesterPhone}>
            <Input value={requesterPhone} onChange={(event) => setRequesterPhone(event.target.value)} />
          </ClaimField>
          <ClaimField label="Proof link (optional)" error={fieldErrors.proofUrl}>
            <Input value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="Business website, portfolio, LinkedIn or Instagram" />
          </ClaimField>
          <ClaimField label="How are you connected to this business?" error={fieldErrors.message}>
            <Textarea
              value={claimMessage}
              onChange={(event) => setClaimMessage(event.target.value)}
              placeholder="Tell us why you should manage this listing."
            />
          </ClaimField>
          <Button type="submit" disabled={isSubmitting}>
            <Send className="h-4 w-4" aria-hidden /> {isSubmitting ? "Sending..." : "Submit claim request"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function ClaimField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-[#9c4f35]">{error}</span> : null}
    </label>
  );
}
