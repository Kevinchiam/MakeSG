import { services } from "@/lib/data";
import type { BusinessType } from "@/lib/types";

const DEFAULT_MAGIC_FILL_MODEL = "gpt-4.1-mini";
const MAGIC_FILL_TIMEOUT_MS = 12000;
const MAGIC_IMAGE_TIMEOUT_MS = 6000;
const MAGIC_AVAILABILITY_TTL_MS = 5 * 60 * 1000;
const MAGIC_AVAILABILITY_MAX_OUTPUT_TOKENS = 16;
const MAX_MAGIC_IMAGE_BYTES = 10 * 1024 * 1024;

type MagicFillDraft = {
  businessName: string;
  shortDescription: string;
  description: string;
  websiteUrl: string;
  publicEmail: string;
  phoneNumber: string;
  location: string;
  businessType: BusinessType;
  services: string[];
  otherService: string;
  profileImageUrl: string;
  profileImageCaption: string;
  sources: string[];
  confidenceNotes: string[];
};

export type BusinessMagicFillResult =
  | { ok: true; draft: MagicFillDraft; message: string }
  | { ok: false; message: string };

type OpenAiMagicFillPayload = {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{
      text?: unknown;
    }>;
  }>;
};

type RawMagicDraft = Partial<Record<keyof MagicFillDraft, unknown>>;

type BusinessMagicFillStatus = {
  available: boolean;
  message: string;
};

let cachedAvailability: (BusinessMagicFillStatus & { checkedAt: number }) | null = null;

export async function isBusinessMagicFillAvailable() {
  const status = await getBusinessMagicFillStatus();
  return status.available;
}

export async function getBusinessMagicFillStatus(): Promise<BusinessMagicFillStatus> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      available: false,
      message: "Magic fill is paused because `OPENAI_API_KEY` is not available to this deployment.",
    };
  }

  const now = Date.now();
  if (cachedAvailability && now - cachedAvailability.checkedAt < MAGIC_AVAILABILITY_TTL_MS) {
    return {
      available: cachedAvailability.available,
      message: cachedAvailability.message,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_BUSINESS_MAGIC_FILL_MODEL ?? DEFAULT_MAGIC_FILL_MODEL,
        input: "Reply with ok.",
        max_output_tokens: MAGIC_AVAILABILITY_MAX_OUTPUT_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await readOpenAiError(response);
      const adminMessage = isQuotaError(message)
        ? "Magic fill is paused because the OpenAI account has no credits or quota available."
        : `Magic fill is paused because OpenAI returned an error: ${message}`;
      cachedAvailability = { available: false, message: adminMessage, checkedAt: now };
      return { available: false, message: adminMessage };
    }

    const status = {
      available: true,
      message: "Magic fill is available.",
      checkedAt: now,
    };
    cachedAvailability = status;
    return { available: status.available, message: status.message };
  } catch {
    const message = "Magic fill is paused because the live OpenAI availability check could not complete.";
    cachedAvailability = { available: false, message, checkedAt: now };
    return { available: false, message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function researchBusinessMagicFill(businessName: string): Promise<BusinessMagicFillResult> {
  const name = businessName.trim();
  if (name.length < 2) {
    return { ok: false, message: "Type a business name first." };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, message: "Magic fill is not connected yet. Add `OPENAI_API_KEY` in the project environment and redeploy." };
  }

  const result = await requestBusinessDraft(apiKey, name);
  if (!result.ok) return result;

  const foundProfileImageUrl = result.draft.websiteUrl ? await findBusinessProfileImage(result.draft.websiteUrl) : "";
  const profileImageUrl = foundProfileImageUrl && await fetchMagicProfileImage(foundProfileImageUrl) ? foundProfileImageUrl : "";
  return {
    ok: true,
    message: profileImageUrl
      ? "Magic fill added a draft and found a profile image from the business website. Please check everything before submitting."
      : "Magic fill added a draft. Please check everything before submitting.",
    draft: {
      ...result.draft,
      profileImageUrl,
      profileImageCaption: profileImageUrl ? `${result.draft.businessName} profile image` : "",
    },
  };
}

export async function fetchMagicProfileImage(url: string) {
  const safeUrl = safeHttpUrl(url);
  if (!safeUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAGIC_IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(safeUrl, { signal: controller.signal });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) return null;

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_MAGIC_IMAGE_BYTES) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_MAGIC_IMAGE_BYTES) return null;

    return {
      blob: new Blob([buffer], { type: contentType }),
      size: buffer.byteLength,
      mimeType: contentType,
      extension: extensionFromMimeType(contentType),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function requestBusinessDraft(apiKey: string, businessName: string): Promise<BusinessMagicFillResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAGIC_FILL_TIMEOUT_MS);
  const knownServiceSlugs = services.map((service) => service.slug);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_BUSINESS_MAGIC_FILL_MODEL ?? DEFAULT_MAGIC_FILL_MODEL,
        tools: [
          {
            type: "web_search",
            search_context_size: "low",
            user_location: {
              type: "approximate",
              country: "SG",
              city: "Singapore",
            },
          },
        ],
        input: [
          {
            role: "developer",
            content: [
              {
                type: "input_text",
                text: [
                  "You help MakeSG draft editable business listings for Singapore's creative production directory.",
                  "Use web search to find public information about the named business.",
                  "Do not invent contact details. Use empty strings for anything uncertain.",
                  "Prefer the business's own website as a source.",
                  "Choose services only from the provided service slugs.",
                  "Return JSON only, with no markdown.",
                ].join(" "),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  businessName,
                  allowedBusinessTypes: ["independent", "studio", "workshop", "consultancy", "manufacturer", "supplier"],
                  allowedServices: knownServiceSlugs,
                  requiredShape: {
                    businessName: "string",
                    shortDescription: "20 to 140 characters",
                    description: "80 to 700 characters",
                    websiteUrl: "string or empty string",
                    publicEmail: "string or empty string",
                    phoneNumber: "string or empty string",
                    location: "Singapore location or empty string",
                    businessType: "one allowed business type",
                    services: "array of up to 6 allowed service slugs",
                    otherService: "string or empty string",
                    sources: "array of source URLs used",
                    confidenceNotes: "array of short notes about uncertain fields",
                  },
                }),
              },
            ],
          },
        ],
        max_output_tokens: 1000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await readOpenAiError(response);
      if (isQuotaError(message)) {
        cachedAvailability = {
          available: false,
          message: "Magic fill is paused because the OpenAI account has no credits or quota available.",
          checkedAt: Date.now(),
        };
      }
      return { ok: false, message };
    }

    const payload = (await response.json()) as OpenAiMagicFillPayload;
    const parsed = parseDraft(extractOutputText(payload), businessName);
    if (!parsed) {
      return { ok: false, message: "Magic fill could not read the draft returned by OpenAI. Try again, or fill the form manually." };
    }

    return { ok: true, message: "Magic fill added a draft. Please check everything before submitting.", draft: parsed };
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Magic fill took too long. Try again, or fill the form manually."
      : "Magic fill could not complete. Try again, or fill the form manually.";
    return { ok: false, message };
  } finally {
    clearTimeout(timeout);
  }
}

async function findBusinessProfileImage(websiteUrl: string) {
  const safeUrl = safeHttpUrl(websiteUrl);
  if (!safeUrl) return "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAGIC_IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(safeUrl, { signal: controller.signal });
    if (!response.ok) return "";

    const html = (await response.text()).slice(0, 200000);
    const imageUrl = firstMatchingMetaContent(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
      /<link[^>]+rel=["'][^"']*(?:apple-touch-icon|icon)[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*(?:apple-touch-icon|icon)[^"']*["'][^>]*>/i,
    ]);

    if (!imageUrl) return "";
    return safeHttpUrl(new URL(imageUrl, safeUrl).toString()) ?? "";
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function parseDraft(text: string, fallbackName: string): MagicFillDraft | null {
  try {
    const jsonText = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const raw = JSON.parse(jsonText) as RawMagicDraft;
    const businessType = isBusinessType(raw.businessType) ? raw.businessType : "studio";
    const serviceSlugs = new Set(services.map((service) => service.slug));
    const selectedServices = Array.isArray(raw.services)
      ? raw.services.filter((service): service is string => typeof service === "string" && serviceSlugs.has(service)).slice(0, 6)
      : [];

    return {
      businessName: stringValue(raw.businessName) || fallbackName,
      shortDescription: stringValue(raw.shortDescription).slice(0, 180),
      description: stringValue(raw.description).slice(0, 900),
      websiteUrl: safeHttpUrl(stringValue(raw.websiteUrl)) ?? "",
      publicEmail: stringValue(raw.publicEmail),
      phoneNumber: stringValue(raw.phoneNumber),
      location: stringValue(raw.location),
      businessType,
      services: selectedServices,
      otherService: stringValue(raw.otherService),
      profileImageUrl: "",
      profileImageCaption: "",
      sources: stringArray(raw.sources).filter((source) => Boolean(safeHttpUrl(source))).slice(0, 5),
      confidenceNotes: stringArray(raw.confidenceNotes).slice(0, 4),
    };
  } catch {
    return null;
  }
}

function firstMatchingMetaContent(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern)?.[1]?.trim();
    if (match) return match;
  }

  return null;
}

function extractOutputText(payload: OpenAiMagicFillPayload) {
  if (typeof payload.output_text === "string") return payload.output_text;

  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === "string") return content.text;
    }
  }

  return "";
}

async function readOpenAiError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: { message?: unknown; type?: unknown; code?: unknown } };
    const message = typeof payload.error?.message === "string" ? payload.error.message : null;
    const type = typeof payload.error?.type === "string" ? payload.error.type : null;
    const code = typeof payload.error?.code === "string" ? payload.error.code : null;
    return [message, type ? `Type: ${type}` : null, code ? `Code: ${code}` : null].filter(Boolean).join(" · ") || `HTTP ${response.status} ${response.statusText}`;
  } catch {
    return `HTTP ${response.status} ${response.statusText}`;
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()) : [];
}

function safeHttpUrl(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isBusinessType(value: unknown): value is BusinessType {
  return typeof value === "string" && ["independent", "studio", "workshop", "consultancy", "manufacturer", "supplier"].includes(value);
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function isQuotaError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("insufficient_quota")
    || normalized.includes("credit_balance_exhausted")
    || normalized.includes("no credits remaining")
    || normalized.includes("quota");
}
