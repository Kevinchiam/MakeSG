import { Button } from "@/components/ui/button";

export function Pagination({ page = 1, totalPages = 1 }: { page?: number; totalPages?: number }) {
  return (
    <nav className="mt-8 flex items-center justify-between border-t border-[#ded8cc] pt-4" aria-label="Pagination">
      <Button variant="secondary" disabled={page <= 1}>
        Previous
      </Button>
      <span className="text-sm text-[#6d675d]">
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" disabled={page >= totalPages}>
        Next
      </Button>
    </nav>
  );
}
