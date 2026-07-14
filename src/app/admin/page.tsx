import Link from "next/link";
import { businessRecommendations } from "@/lib/data";
import { getAdminBusinesses } from "@/lib/business-submissions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const businesses = await getAdminBusinesses();
  const pending = businesses.filter((b) => b.publicationStatus === "pending").length;
  const pendingRecommendations = businessRecommendations.filter((recommendation) => recommendation.status === "pending").length;
  return (
    <section className="container-shell py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-5xl font-semibold">Admin</h1>
        <Link href="/admin/logout" className="text-sm underline">Log out</Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <AdminLink href="/admin/businesses" title="Businesses" text={`${pending} pending, ${businesses.length} total listings`} />
        <AdminLink href="/admin/recommendations" title="Recommendations" text={`${pendingRecommendations} pending word-of-mouth submissions`} />
        <AdminLink href="/admin/services" title="Services" text="Edit service categories and descriptions" />
        <AdminLink href="/admin/reports" title="Reports" text="Review reported content" />
      </div>
    </section>
  );
}

function AdminLink({ href, title, text }: { href: string; title: string; text: string }) {
  return <Link href={href} className="border border-[#ded8cc] bg-white p-5"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-[#6d675d]">{text}</p></Link>;
}
