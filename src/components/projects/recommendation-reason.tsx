import { Badge } from "@/components/ui/badge";
import { recommendationSentence, type BusinessScore } from "@/lib/recommendation";

export function RecommendationReason({ score }: { score: BusinessScore }) {
  return (
    <div className="border border-[#ded8cc] bg-[#fbfaf7] p-4">
      <p className="text-sm leading-6 text-[#4f493f]">{recommendationSentence(score)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{score.score} match points</Badge>
        {score.matchedServices.slice(0, 3).map((service) => (
          <Badge key={service}>{service.replace(/-/g, " ")}</Badge>
        ))}
      </div>
    </div>
  );
}
