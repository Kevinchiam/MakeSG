"use client";

import { Save } from "lucide-react";
import { useRef, useState } from "react";
import { updateBusinessListingSourceStatus } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import { businessSourceStatus, type BusinessSourceStatus } from "@/lib/business-source";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";
import type { BusinessSubmissionSource } from "@/lib/types";

export function AdminBusinessSourceForm({
  businessId,
  submissionSource,
  claimed,
}: {
  businessId: string;
  submissionSource: BusinessSubmissionSource;
  claimed: boolean;
}) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const initialStatus = businessSourceStatus({ submissionSource, claimed });
  const [sourceStatus, setSourceStatus] = useState<BusinessSourceStatus>(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  useFeedbackFocus(messageRef, message);

  async function saveSourceStatus() {
    setIsSaving(true);
    setMessage(null);
    const result = await updateBusinessListingSourceStatus(businessId, sourceStatus);
    setIsSaving(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.message });
      return;
    }

    setMessage({ tone: "success", text: `Listing status updated to ${result.label}.` });
  }

  return (
    <section className="grid gap-4 border border-[#ded8cc] bg-white p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Listing source</p>
        <h2 className="mt-1 text-2xl font-semibold">Edit listing status</h2>
        <p className="mt-2 text-sm leading-6 text-[#6d675d]">
          Use this to explain how the listing is represented publicly. This is separate from whether the listing is published or waiting for review.
        </p>
      </div>
      {message ? (
        <p
          ref={messageRef}
          tabIndex={-1}
          className={`border p-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}
      <label className="grid gap-1.5 text-sm font-medium">
        Public listing status
        <select
          value={sourceStatus}
          onChange={(event) => setSourceStatus(event.target.value as BusinessSourceStatus)}
          className="min-h-11 border border-[#ded8cc] bg-white px-3"
        >
          <option value="community_added">Community added</option>
          <option value="owner_added">Owner added</option>
          <option value="owner_claimed">Owner claimed</option>
          <option value="admin_maintained">Admin maintained</option>
        </select>
      </label>
      <Button type="button" onClick={saveSourceStatus} disabled={isSaving}>
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save listing status"}
      </Button>
    </section>
  );
}
