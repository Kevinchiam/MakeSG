import Link from "next/link";
import { businesses } from "@/lib/data";

export default function AdminBusinessesPage() {
  return (
    <section className="container-shell py-12">
      <h1 className="font-serif text-5xl font-semibold">Moderate businesses</h1>
      <div className="mt-8 grid gap-3">
        {businesses.map((business) => <Link key={business.id} href={`/admin/businesses/${business.id}`} className="grid gap-1 border border-[#ded8cc] bg-white p-4 md:grid-cols-[1fr_auto]"><span className="font-semibold">{business.name}</span><span className="text-sm text-[#6d675d]">{business.publicationStatus} · {business.verificationStatus}</span></Link>)}
      </div>
    </section>
  );
}
