"use client";

import { Check, EyeOff, Star, X } from "lucide-react";
import { useState } from "react";
import { updateBusinessPublicationStatus } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import type { PublicationStatus } from "@/lib/types";

export function AdminStatusControls({
  businessId,
  source = "demo",
  initialStatus = "pending",
  approvedStatus = "published",
}: {
  businessId?: string;
  source?: "demo" | "supabase";
  initialStatus?: string;
  approvedStatus?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function setPublicationStatus(nextStatus: PublicationStatus) {
    setStatus(nextStatus);
    setMessage(null);

    if (source !== "supabase" || !businessId) {
      setMessage("Demo listings only change on this screen.");
      return;
    }

    setIsSaving(true);
    const result = await updateBusinessPublicationStatus(businessId, nextStatus);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.message ?? "Could not update this listing.");
      return;
    }

    setMessage(nextStatus === "published" ? "Published. This provider can now appear in the public directory." : "Status updated.");
  }

  return (
    <div className="grid gap-3 border border-[#ded8cc] bg-white p-4">
      <p className="text-sm font-semibold">Current status: {status}</p>
      {message ? <p className="text-sm text-[#536343]" role="status">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={isSaving} onClick={() => setPublicationStatus(approvedStatus as PublicationStatus)}>
          <Check className="h-4 w-4" /> {isSaving ? "Saving..." : "Approve"}
        </Button>
        <Button type="button" variant="danger" disabled={isSaving} onClick={() => setPublicationStatus("rejected")}>
          <X className="h-4 w-4" /> Reject
        </Button>
        <Button type="button" variant="secondary" onClick={() => setStatus("featured")}>
          <Star className="h-4 w-4" /> Feature
        </Button>
        <Button type="button" variant="secondary" disabled={isSaving} onClick={() => setPublicationStatus("suspended")}>
          <EyeOff className="h-4 w-4" /> Unpublish
        </Button>
      </div>
    </div>
  );
}
