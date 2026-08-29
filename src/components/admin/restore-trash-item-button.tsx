"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { restoreTrashItem } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import type { AdminTrashKind } from "@/lib/admin-trash";

export function RestoreTrashItemButton({ id, kind }: { id: string; kind: AdminTrashKind }) {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function restore() {
    setMessage(null);
    setIsRestoring(true);
    const result = await restoreTrashItem(kind, id);
    setIsRestoring(false);

    if (!result.ok) {
      setMessage(result.message ?? "Could not restore this item.");
      return;
    }

    setMessage("Restored to the review queue.");
    router.refresh();
  }

  return (
    <div className="grid justify-items-start gap-2 md:justify-items-end">
      <Button type="button" variant="secondary" disabled={isRestoring} onClick={restore}>
        <RotateCcw className="h-4 w-4" aria-hidden />
        {isRestoring ? "Restoring..." : "Restore"}
      </Button>
      {message ? <p className="max-w-48 text-sm text-[#536343] md:text-right" role="status">{message}</p> : null}
    </div>
  );
}
