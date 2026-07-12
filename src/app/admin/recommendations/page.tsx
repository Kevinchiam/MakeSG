import Link from "next/link";
import Image from "next/image";
import { MessageCircleHeart } from "lucide-react";
import { AdminStatusControls } from "@/components/admin/admin-status-controls";
import { Badge } from "@/components/ui/badge";
import { businessRecommendations, businesses } from "@/lib/data";

export default function AdminRecommendationsPage() {
  const pendingCount = businessRecommendations.filter((recommendation) => recommendation.status === "pending").length;

  return (
    <section className="container-shell py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Moderation</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Business recommendations</h1>
      <p className="mt-4 max-w-2xl text-[#6d675d]">
        Review word-of-mouth submissions before they appear publicly. Recommendations are not ratings; they are moderated trust signals tied to first-hand experience.
      </p>
      <p className="mt-4 text-sm font-semibold text-[#536343]">{pendingCount} pending recommendation{pendingCount === 1 ? "" : "s"}</p>

      <div className="mt-8 grid gap-4">
        {businessRecommendations.map((recommendation) => {
          const business = businesses.find((item) => item.id === recommendation.businessId);
          return (
            <article key={recommendation.id} className="grid gap-4 border border-[#ded8cc] bg-white p-5 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <MessageCircleHeart className="h-4 w-4 text-[#536343]" aria-hidden />
                  <h2 className="text-xl font-semibold">{business?.name ?? "Unknown business"}</h2>
                  <Badge>{recommendation.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#4f493f]">“{recommendation.comment}”</p>
                {recommendation.mediaUrls?.length ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {recommendation.mediaUrls.map((mediaUrl) => (
                      <Image
                        key={mediaUrl}
                        src={mediaUrl}
                        alt=""
                        width={360}
                        height={220}
                        className="aspect-video border border-[#ded8cc] object-cover"
                      />
                    ))}
                  </div>
                ) : null}
                <dl className="mt-4 grid gap-2 text-sm text-[#6d675d] md:grid-cols-2">
                  <div><dt className="font-semibold text-[#211f1b]">Recommended by</dt><dd>{recommendation.recommenderName}</dd></div>
                  <div><dt className="font-semibold text-[#211f1b]">Project</dt><dd>{recommendation.projectContext}</dd></div>
                  <div><dt className="font-semibold text-[#211f1b]">Relationship</dt><dd>{recommendation.relationship}</dd></div>
                  <div><dt className="font-semibold text-[#211f1b]">Can verify</dt><dd>{recommendation.permissionToContact ? "Yes" : "No"}</dd></div>
                </dl>
                {business ? <Link href={`/businesses/${business.slug}`} className="mt-4 inline-block text-sm underline">View business profile</Link> : null}
              </div>
              <AdminStatusControls initialStatus={recommendation.status} approvedStatus="approved" />
            </article>
          );
        })}
      </div>
    </section>
  );
}
