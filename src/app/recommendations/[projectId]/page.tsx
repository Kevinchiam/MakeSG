import type { Metadata } from "next";
import { BusinessCard } from "@/components/business/business-card";
import { RecommendationReason } from "@/components/projects/recommendation-reason";
import { projects, services } from "@/lib/data";
import { getRecommendations, recommendServiceSlugs } from "@/lib/recommendation";

export const metadata: Metadata = { title: "Project recommendations" };

export default async function RecommendationsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const serviceSlugs = recommendServiceSlugs(project);
  const recommendations = getRecommendations(project).slice(0, 6);

  return (
    <section className="container-shell py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Rules-based recommendations</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">{project.title}</h1>
      <p className="mt-4 max-w-3xl text-[#6d675d]">Transparent matches are scored from service, material, scale, budget, location and portfolio tag compatibility.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {serviceSlugs.map((slug) => <span className="border border-[#ded8cc] bg-white px-3 py-1 text-sm" key={slug}>{services.find((s) => s.slug === slug)?.name ?? slug}</span>)}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {recommendations.map((score) => (
          <div key={score.business.id} className="grid gap-3">
            <BusinessCard business={score.business} />
            <RecommendationReason score={score} />
          </div>
        ))}
      </div>
    </section>
  );
}
