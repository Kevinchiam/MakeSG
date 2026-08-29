import Link from "next/link";
import Image from "next/image";
import { MessageCircleHeart, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusControls } from "@/components/admin/admin-status-controls";
import { ModerationSummary } from "@/components/admin/moderation-summary";
import { Badge } from "@/components/ui/badge";
import { getAdminBusinessRecommendations } from "@/lib/business-recommendations";

export default async function AdminRecommendationsPage() {
  const recommendations = await getAdminBusinessRecommendations();
  const pendingCount = recommendations.filter((recommendation) => recommendation.status === "pending").length;

  return (
    <section className="container-shell py-12">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Business recommendations"
        description="Review word-of-mouth submissions before they appear publicly. Recommendations are not ratings; they are moderated trust signals tied to first-hand experience."
      />
      <p className="mt-4 text-sm font-semibold text-[#536343]">{pendingCount} pending recommendation{pendingCount === 1 ? "" : "s"}</p>

      <div className="mt-8 grid gap-4">
        {recommendations.map((recommendation) => (
          <article key={recommendation.id} className="grid gap-4 border border-[#ded8cc] bg-white p-5 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <MessageCircleHeart className="h-4 w-4 text-[#536343]" aria-hidden />
                <h2 className="text-xl font-semibold">{recommendation.businessName}</h2>
                <Badge>{recommendation.status}</Badge>
              </div>
              {(recommendation.qualityRating || recommendation.reliabilityRating || recommendation.collaborationRating) ? (
                <dl className="mt-4 grid gap-2 text-sm text-[#4f493f] md:grid-cols-3">
                  <Rating label="Quality" value={recommendation.qualityRating} />
                  <Rating label="Reliability" value={recommendation.reliabilityRating} />
                  <Rating label="Collaboration" value={recommendation.collaborationRating} />
                </dl>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-[#4f493f]">“{recommendation.comment}”</p>
              <div className="mt-4">
                <ModerationSummary
                  decision={recommendation.moderationDecision}
                  risk={recommendation.moderationRisk}
                  reason={recommendation.moderationReason}
                  signals={recommendation.moderationSignals}
                />
              </div>
              {recommendation.mediaItems?.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {recommendation.mediaItems.map((media) => (
                    <figure key={media.id} className="border border-[#ded8cc] bg-[#fbfaf7]">
                      {media.mimeType.startsWith("video/") ? (
                        <video src={media.url} controls className="aspect-video w-full bg-black object-cover" />
                      ) : (
                        <Image src={media.url} alt={media.caption} width={360} height={220} className="aspect-video object-cover" />
                      )}
                      {media.caption ? <figcaption className="p-2 text-xs leading-5 text-[#6d675d]">{media.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              ) : recommendation.mediaUrls?.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {recommendation.mediaUrls.map((mediaUrl) => (
                    <Image key={mediaUrl} src={mediaUrl} alt="" width={360} height={220} className="aspect-video border border-[#ded8cc] object-cover" />
                  ))}
                </div>
              ) : null}
              <dl className="mt-4 grid gap-2 text-sm text-[#6d675d] md:grid-cols-2">
                <div><dt className="font-semibold text-[#211f1b]">Recommended by</dt><dd>{recommendation.recommenderName}</dd></div>
                <div><dt className="font-semibold text-[#211f1b]">Private email</dt><dd>{recommendation.recommenderEmail ?? "Not supplied"}</dd></div>
                <div><dt className="font-semibold text-[#211f1b]">Name display</dt><dd>{recommendation.permissionToPublishName ? "Allowed" : "Hide name"}</dd></div>
              </dl>
              {recommendation.supportingLinks?.length ? (
                <div className="mt-4 grid gap-1 text-sm">
                  <p className="font-semibold">Supporting links</p>
                  {recommendation.supportingLinks.map((url) => (
                    <Link key={url} href={url} target="_blank" rel="noreferrer" className="break-all underline">{url}</Link>
                  ))}
                </div>
              ) : null}
              {recommendation.businessSlug ? <Link href={`/businesses/${recommendation.businessSlug}`} className="mt-4 inline-block text-sm underline">View business profile</Link> : null}
            </div>
            <AdminStatusControls
              recommendationId={recommendation.id}
              initialStatus={recommendation.status}
              approvedStatus="published"
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function Rating({ label, value }: { label: string; value?: number }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-semibold text-[#211f1b]">{label}</dt>
      <dd className="mt-1 flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-current text-[#9c4f35]" aria-hidden />
        {value}/5
      </dd>
    </div>
  );
}
