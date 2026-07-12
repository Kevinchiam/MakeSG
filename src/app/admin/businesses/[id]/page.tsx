import { notFound } from "next/navigation";
import { AdminStatusControls } from "@/components/admin/admin-status-controls";
import { businesses } from "@/lib/data";

export default async function AdminBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = businesses.find((item) => item.id === id);
  if (!business) notFound();
  return (
    <section className="container-shell max-w-3xl py-12">
      <h1 className="font-serif text-5xl font-semibold">{business.name}</h1>
      <p className="mt-4 text-[#6d675d]">{business.shortDescription}</p>
      <div className="mt-8"><AdminStatusControls initialStatus={business.publicationStatus} /></div>
    </section>
  );
}
