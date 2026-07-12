import Link from "next/link";
import { projects } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default function DashboardProjectsPage() {
  return (
    <section className="container-shell py-12">
      <div className="flex items-end justify-between gap-4">
        <div><h1 className="font-serif text-5xl font-semibold">Projects</h1><p className="mt-3 text-[#6d675d]">Example creative projects and drafts.</p></div>
        <Button asChild><Link href="/projects/new">New project</Link></Button>
      </div>
      <div className="mt-8 grid gap-4">
        {projects.map((project) => <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="border border-[#ded8cc] bg-white p-5"><h2 className="text-xl font-semibold">{project.title}</h2><p className="mt-2 text-sm text-[#6d675d]">{project.status}</p></Link>)}
      </div>
    </section>
  );
}
