import { BusinessCard } from "@/components/business/business-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Business } from "@/lib/types";

export function BusinessGrid({ businesses }: { businesses: Business[] }) {
  if (!businesses.length) {
    return (
      <EmptyState
        title="No providers match those filters"
        description="Try broadening the service, material, location or budget filters. The URL will keep any filters you do want to share."
        actionHref="/businesses"
        actionLabel="Clear filters"
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}
