import Link from "next/link";
import { FolderKanban, Heart, Mail, Store } from "lucide-react";

export default function DashboardPage() {
  return (
    <section className="container-shell py-12">
      <h1 className="font-serif text-5xl font-semibold">Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Tile href="/dashboard/projects" icon={<FolderKanban />} title="Projects" text="Drafts and submitted briefs" />
        <Tile href="/dashboard/saved" icon={<Heart />} title="Saved" text="Shortlisted providers" />
        <Tile href="/dashboard/enquiries" icon={<Mail />} title="Enquiries" text="Sent and received messages" />
        <Tile href="/dashboard/business" icon={<Store />} title="Business" text="Provider listing workspace" />
      </div>
    </section>
  );
}

function Tile({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return <Link href={href} className="border border-[#ded8cc] bg-white p-5 hover:border-[#315c6b]">{icon}<h2 className="mt-4 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-[#6d675d]">{text}</p></Link>;
}
