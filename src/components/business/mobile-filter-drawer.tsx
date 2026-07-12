"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "@/components/business/filter-panel";

export function MobileFilterDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" /> Filters
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-[#211f1b]/40 p-4" role="dialog" aria-modal="true">
          <div className="ml-auto h-full max-w-md overflow-y-auto bg-[#fbfaf7] p-4">
            <div className="mb-4 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FilterPanel />
          </div>
        </div>
      ) : null}
    </div>
  );
}
