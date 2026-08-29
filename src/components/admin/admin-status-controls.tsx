"use client";

import { Check, EyeOff, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { approvePendingBusinessRevision, deleteBusinessEntry, rejectPendingBusinessRevision, updateBusinessPublicationStatus, updateBusinessRecommendationStatus } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import type { PublicationStatus } from "@/lib/types";

export function AdminStatusControls({
  businessId,
  source = "demo",
  initialStatus = "pending",
  approvedStatus = "published",
  hasPendingRevision = false,
  recommendationId,
}: {
  businessId?: string;
  source?: "demo" | "supabase";
  initialStatus?: string;
  approvedStatus?: string;
  hasPendingRevision?: boolean;
  recommendationId?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function setPublicationStatus(nextStatus: PublicationStatus) {
    setMessage(null);

    if (recommendationId) {
      if (source !== "supabase") {
        setMessage("Demo recommendations only change on this screen.");
        return;
      }

      if (nextStatus !== "published" && nextStatus !== "rejected") {
        setMessage("Recommendations can be approved or rejected.");
        return;
      }

      setIsSaving(true);
      const result = await updateBusinessRecommendationStatus(recommendationId, nextStatus === "published" ? "approved" : "rejected");
      setIsSaving(false);

      if (!result.ok) {
        setMessage(result.message ?? "Could not update this recommendation.");
        return;
      }

      const nextRecommendationStatus = nextStatus === "published" ? "approved" : "rejected";
      setStatus(nextRecommendationStatus);
      setMessage(nextRecommendationStatus === "approved" ? "Approved. This recommendation can now appear publicly." : "Rejected. It has been moved to the trash bin for seven days.");
      return;
    }

    if (source !== "supabase" || !businessId) {
      setMessage("Demo listings only change on this screen.");
      return;
    }

    setIsSaving(true);
    const result = hasPendingRevision && nextStatus === "published"
      ? await approvePendingBusinessRevision(businessId)
      : hasPendingRevision && nextStatus === "rejected"
        ? await rejectPendingBusinessRevision(businessId)
        : await updateBusinessPublicationStatus(businessId, nextStatus);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.message ?? "Could not update this listing.");
      return;
    }

    setStatus(hasPendingRevision ? initialStatus : nextStatus);
    setMessage(hasPendingRevision && nextStatus === "published"
      ? "Approved. The pending edits are now live."
      : hasPendingRevision && nextStatus === "rejected"
        ? "Rejected. The live listing was not changed, and the rejected edit is in the trash bin for seven days."
        : nextStatus === "published"
          ? "Published. This business can now appear in the public directory."
          : nextStatus === "rejected"
            ? "Rejected. This listing has been moved to the trash bin for seven days."
          : "Status updated.");
  }

  async function deleteEntry() {
    setMessage(null);

    if (source !== "supabase" || !businessId) {
      setMessage("Demo listings cannot be deleted.");
      return;
    }

    const confirmed = window.confirm("Delete this business listing? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteBusinessEntry(businessId);
    setIsDeleting(false);

    if (!result.ok) {
      setMessage(result.message ?? "Could not delete this listing.");
      return;
    }

    window.location.href = "/admin/businesses";
  }

  return (
    <div className="grid gap-3 border border-[#ded8cc] bg-white p-4">
      <p className="text-sm font-semibold">Current status: {status}</p>
      {hasPendingRevision ? <p className="text-sm text-[#9c4f35]">There are pending edits waiting for review. The public listing remains unchanged until approval.</p> : null}
      {message ? <p className="text-sm text-[#536343]" role="status">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={isSaving} onClick={() => setPublicationStatus(approvedStatus as PublicationStatus)}>
          <Check className="h-4 w-4" /> {isSaving ? "Saving..." : "Approve"}
        </Button>
        <Button type="button" variant="danger" disabled={isSaving} onClick={() => setPublicationStatus("rejected")}>
          <X className="h-4 w-4" /> Reject
        </Button>
        {!recommendationId ? (
          <>
            <Button type="button" variant="secondary" onClick={() => setStatus("featured")}>
              <Star className="h-4 w-4" /> Feature
            </Button>
            <Button type="button" variant="secondary" disabled={isSaving} onClick={() => setPublicationStatus("suspended")}>
              <EyeOff className="h-4 w-4" /> Unpublish
            </Button>
            <Button type="button" variant="danger" disabled={isDeleting} onClick={deleteEntry}>
              <Trash2 className="h-4 w-4" /> {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
