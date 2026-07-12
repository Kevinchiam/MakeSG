"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SaveBusinessButton({ businessId }: { businessId: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <Button
      type="button"
      variant={saved ? "primary" : "secondary"}
      onClick={() => setSaved((value) => !value)}
      aria-pressed={saved}
      data-business-id={businessId}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
