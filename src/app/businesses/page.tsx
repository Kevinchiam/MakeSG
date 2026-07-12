import type { Metadata } from "next";
import { FilterPanel } from "@/components/business/filter-panel";
import { BusinessGrid } from "@/components/business/business-grid";
import { MobileFilterDrawer } from "@/components/business/mobile-filter-drawer";
import { Pagination } from "@/components/ui/pagination";
import { businesses } from "@/lib/data";
import { filterBusinesses, parseFilters } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Browse providers",
  description: "Search and filter fictional Singapore creative-services and fabrication providers.",
};

export default async function BusinessesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const results = filterBusinesses(businesses, filters);

  return (
    <section className="container-shell py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Directory</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Browse providers</h1>
          <p className="mt-3 text-[#6d675d]">{results.length} published fictional demo providers found.</p>
        </div>
        <MobileFilterDrawer />
      </div>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel />
        </aside>
        <div>
          <BusinessGrid businesses={results} />
          <Pagination page={1} totalPages={1} />
        </div>
      </div>
    </section>
  );
}
