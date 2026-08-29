"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExistingBusinessSuggestion } from "@/lib/business-submissions";

type SuggestionWithScore = ExistingBusinessSuggestion & { score: number };

export function RecommendBusinessLookup({
  businesses,
  initialQuery = "",
}: {
  businesses: ExistingBusinessSuggestion[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const matches = useMemo(() => findBusinessMatches(query, businesses), [businesses, query]);
  const hasQuery = normalizeBusinessName(query).length >= 2;

  return (
    <div className="grid gap-6 border border-[#ded8cc] bg-white p-6">
      <div>
        <h2 className="font-serif text-3xl font-semibold">Find the business first</h2>
        <p className="mt-2 text-sm leading-6 text-[#6d675d]">
          If the business already exists on MakeSG, open that listing and use the profile recommendation form. Names are matched without spaces or capital letters, and close typos are tolerated.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Business name
        <span className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d675d]" aria-hidden />
          <input
            className="min-h-12 w-full border border-[#ded8cc] bg-white pl-10 pr-3 text-base shadow-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. StudioWongs"
          />
        </span>
      </label>

      {hasQuery ? (
        <div className="grid gap-3" role="status" aria-live="polite">
          {matches.length ? (
            matches.map((business) => {
              return (
                <article key={business.id} className="grid gap-4 border border-[#ded8cc] bg-[#fbfaf7] p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9c4f35]">Business already exists</p>
                    <h3 className="mt-1 text-xl font-semibold">{business.name}</h3>
                    <p className="mt-2 text-sm text-[#6d675d]">
                      Open the profile to review details and recommend this business.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="secondary">
                      <Link href={`/businesses/${business.slug}`}>
                        View listing <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="border border-dashed border-[#c9bfb0] bg-[#fbfaf7] p-5 text-sm leading-6 text-[#6d675d]">
              <p className="font-semibold text-[#211f1b]">No existing listing matches that name.</p>
              <p className="mt-1">
                If the business is not on MakeSG yet, ask them to submit a listing for review so future recommendations attach to the right profile.
              </p>
              <Button asChild className="mt-4">
                <Link href="/for-businesses">Go to business onboarding</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="border border-dashed border-[#c9bfb0] bg-[#fbfaf7] p-4 text-sm leading-6 text-[#6d675d]">
          Start typing a business name to check whether it is already listed.
        </p>
      )}
    </div>
  );
}

function findBusinessMatches(query: string, businesses: ExistingBusinessSuggestion[]) {
  const normalizedQuery = normalizeBusinessName(query);
  const queryTokens = tokenize(query);
  if (normalizedQuery.length < 2) return [];

  return businesses
    .map((business): SuggestionWithScore => ({ ...business, score: scoreBusinessMatch(normalizedQuery, queryTokens, business.name) }))
    .filter((business) => business.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 6);
}

function scoreBusinessMatch(normalizedQuery: string, queryTokens: string[], businessName: string) {
  const normalizedName = normalizeBusinessName(businessName);
  const nameTokens = tokenize(businessName);

  if (normalizedName === normalizedQuery) return 100;
  if (normalizedName.startsWith(normalizedQuery)) return 90;
  if (normalizedName.includes(normalizedQuery)) return 82;
  if (normalizedQuery.includes(normalizedName)) return 78;

  const tokenScore = queryTokens.reduce((bestScore, queryToken) => {
    const bestTokenScore = nameTokens.reduce((best, nameToken) => {
      if (nameToken === queryToken) return Math.max(best, 72);
      if (nameToken.startsWith(queryToken) || nameToken.includes(queryToken)) return Math.max(best, 62);
      if (isCloseMatch(queryToken, nameToken)) return Math.max(best, 48);
      return best;
    }, 0);
    return Math.max(bestScore, bestTokenScore);
  }, 0);

  if (tokenScore > 0) return tokenScore;
  return isCloseMatch(normalizedQuery, normalizedName) ? 45 : 0;
}

function normalizeBusinessName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function isCloseMatch(a: string, b: string) {
  if (a.length < 4 || b.length < 4) return false;
  const distance = levenshtein(a, b);
  const limit = Math.max(1, Math.floor(Math.min(a.length, b.length) / 4));
  return distance <= limit;
}

function levenshtein(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}
