import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/data";
import { getRecommendations } from "@/lib/recommendation";
import { Button } from "@/components/ui/button";

export default async function DashboardProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();
  const recommendations = getRecommendations(project).slice(0, 3);
  return (
    <section className="container-shell py-12">
      <h1 className="font-serif text-5xl font-semibold">{project.title}</h1>
      <p className="mt-4 max-w-3xl text-[#6d675d]">{project.description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{recommendations.map(({ business, score }) => <Link key={business.id} href={`/businesses/${business.slug}`} className="border border-[#ded8cc] bg-white p-5"><h2 className="font-semibold">{business.name}</h2><p className="mt-2 text-sm text-[#6d675d]">{score} match points</p></Link>)}</div>
      <Button asChild className="mt-8"><Link href={`/recommendations/${project.id}`}>View all recommendations</Link></Button>
    </section>
  );
}
