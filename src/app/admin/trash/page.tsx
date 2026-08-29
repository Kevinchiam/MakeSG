import Link from "next/link";
import { ArchiveX } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminTrashItems, type AdminTrashItem } from "@/lib/admin-trash";

export const dynamic = "force-dynamic";

export default async function AdminTrashPage() {
  const items = await getAdminTrashItems();

  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        eyebrow="Admin"
        title="Trash bin"
        description="Rejected and dismissed items stay here for seven days. After that, MakeSG clears them out to keep storage tidy."
      />

      <div className="mt-8">
        {items.length ? (
          <div className="grid gap-3">
            {items.map((item) => (
              <TrashCard key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="Trash is empty" description="Rejected listings, dismissed change requests and archived jobs will appear here before the seven-day cleanup." />
        )}
      </div>
    </section>
  );
}

function TrashCard({ item }: { item: AdminTrashItem }) {
  const content = (
    <article className="grid gap-3 border border-[#ded8cc] bg-white p-5 transition hover:border-[#9c4f35] md:grid-cols-[1fr_auto]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <ArchiveX className="h-4 w-4 text-[#9c4f35]" aria-hidden />
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <Badge>{item.status}</Badge>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6d675d]">{item.description}</p>
      </div>
      <dl className="grid gap-1 text-sm text-[#6d675d] md:text-right">
        <div>
          <dt className="font-semibold text-[#211f1b]">Moved to trash</dt>
          <dd>{formatDate(item.trashedAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#211f1b]">Deleted after</dt>
          <dd>{formatDate(item.deleteAfter)}</dd>
        </div>
      </dl>
    </article>
  );

  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
