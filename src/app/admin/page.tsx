import Link from "next/link";
import { businesses } from "@/lib/data";

export default function AdminPage() {
  const pending = businesses.filter((b) => b.publicationStatus === "pending").length;
  return (
    <section className="container-shell py-12">
      <h1 className="font-serif text-5xl font-semibold">Admin</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminLink href="/admin/businesses" title="Businesses" text={`${pending} pending, ${businesses.length} total demo listings`} />
        <AdminLink href="/admin/services" title="Services" text="Edit service categories and descriptions" />
        <AdminLink href="/admin/reports" title="Reports" text="Review reported content" />
      </div>
    </section>
  );
}

function AdminLink({ href, title, text }: { href: string; title: string; text: string }) {
  return <Link href={href} className="border border-[#ded8cc] bg-white p-5"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-[#6d675d]">{text}</p></Link>;
}
