import type { Metadata } from "next";
import { RecommendBusinessForm } from "@/components/business/recommend-business-form";
import { businesses } from "@/lib/data";

export const metadata: Metadata = {
  title: "Recommend a business",
  description: "Share a trusted Singapore creative-services or fabrication provider you have worked with.",
};

export default async function RecommendBusinessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = Array.isArray(params.business) ? params.business[0] : params.business;
  const business = businesses.find((item) => item.slug === slug);

  return (
    <section className="container-shell max-w-4xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Word of mouth</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Recommend a business you trust</h1>
      <p className="mt-4 max-w-2xl text-[#6d675d]">
        Help future makers find reliable sources through moderated recommendations from people with first-hand experience. Photos or short videos make the recommendation more tangible.
      </p>
      <div className="mt-10">
        <RecommendBusinessForm initialBusinessId={business?.id} />
      </div>
    </section>
  );
}
