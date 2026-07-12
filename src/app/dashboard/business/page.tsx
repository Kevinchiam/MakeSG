import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardBusinessPage() {
  return (
    <section className="container-shell py-12">
      <h1 className="font-serif text-5xl font-semibold">Business listing</h1>
      <p className="mt-4 max-w-2xl text-[#6d675d]">Manage listing details, portfolio, publication status and moderation feedback.</p>
      <div className="mt-8 flex gap-3"><Button asChild><Link href="/dashboard/business/edit">Edit listing</Link></Button><Button asChild variant="secondary"><Link href="/dashboard/business/portfolio">Portfolio</Link></Button></div>
    </section>
  );
}
