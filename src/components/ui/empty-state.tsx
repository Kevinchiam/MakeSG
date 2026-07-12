import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="border border-dashed border-[#cfc6b7] bg-white p-8 text-center">
      <SearchX className="mx-auto mb-4 h-8 w-8 text-[#9c4f35]" aria-hidden />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6d675d]">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-5">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null}
    </section>
  );
}
