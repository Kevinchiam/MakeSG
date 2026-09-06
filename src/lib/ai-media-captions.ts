import { smartMediaCaption } from "@/lib/media-captions";

type CaptionUploadedMediaInput = {
  caption?: string | null;
  fileName?: string | null;
  fallback: string;
  mediaKind?: "photo" | "video" | "media";
  mimeType?: string | null;
  publicUrl?: string | null;
};

const DEFAULT_IMAGE_CAPTION_MODEL = "gpt-4.1-mini";
const CAPTION_TIMEOUT_MS = 8000;

export async function captionUploadedMedia(input: CaptionUploadedMediaInput) {
  const fallbackCaption = smartMediaCaption(input);
  if (input.caption?.trim()) return fallbackCaption;
  if (!input.publicUrl || !input.mimeType?.startsWith("image/")) return fallbackCaption;

  const aiCaption = await describeImage(input.publicUrl, input.fallback);
  return aiCaption ?? fallbackCaption;
}

async function describeImage(imageUrl: string, fallback: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAPTION_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_CAPTION_MODEL ?? DEFAULT_IMAGE_CAPTION_MODEL,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Write one short, factual caption for this MakeSG upload. Describe only what is visible. Keep it warm but plain, under 16 words, no markdown, no quotation marks. Context: ${fallback}.`,
              },
              {
                type: "input_image",
                image_url: imageUrl,
                detail: "low",
              },
            ],
          },
        ],
        max_output_tokens: 60,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as ResponsesCaptionPayload;
    return cleanCaption(extractOutputText(payload));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

type ResponsesCaptionPayload = {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{
      text?: unknown;
      type?: unknown;
    }>;
  }>;
};

function extractOutputText(payload: ResponsesCaptionPayload) {
  if (typeof payload.output_text === "string") return payload.output_text;

  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === "string") return content.text;
    }
  }

  return "";
}

function cleanCaption(caption: string) {
  const cleaned = caption
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;
  return cleaned.length > 140 ? `${cleaned.slice(0, 137).trim()}...` : cleaned;
}
