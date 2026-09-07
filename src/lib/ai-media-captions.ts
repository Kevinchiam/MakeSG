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

export type AiCaptionDiagnosticResult =
  | {
      ok: true;
      keyAvailable: true;
      model: string;
      message: string;
      sample: string;
    }
  | {
      ok: false;
      keyAvailable: boolean;
      model: string;
      message: string;
      detail?: string;
    };

export async function captionUploadedMedia(input: CaptionUploadedMediaInput) {
  const fallbackCaption = smartMediaCaption(input);
  if (input.caption?.trim()) return fallbackCaption;
  if (!input.publicUrl || !input.mimeType?.startsWith("image/")) return fallbackCaption;

  const aiCaption = await describeImage(input.publicUrl, input.fallback);
  return aiCaption ?? fallbackCaption;
}

export async function testAiImageCaptionConnection(input: { imageUrl?: string | null } = {}): Promise<AiCaptionDiagnosticResult> {
  const model = process.env.OPENAI_IMAGE_CAPTION_MODEL ?? DEFAULT_IMAGE_CAPTION_MODEL;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      keyAvailable: false,
      model,
      message: "OpenAI is not available to this deployment yet.",
      detail: "OPENAI_API_KEY is missing from the project environment used by the running site.",
    };
  }

  if (!input.imageUrl) {
    return {
      ok: false,
      keyAvailable: true,
      model,
      message: "The AI caption check could not create a public test image URL.",
      detail: "Open the deployed admin dashboard and run the check from there.",
    };
  }

  const result = await requestImageCaption({
    apiKey,
    model,
    imageUrl: input.imageUrl,
    prompt: "This is a connection test for MakeSG image captions. Reply with exactly: caption-ok",
    timeoutMs: CAPTION_TIMEOUT_MS,
  });

  if (!result.ok) {
    return {
      ok: false,
      keyAvailable: true,
      model,
      message: "OpenAI was reached, but the caption test did not complete.",
      detail: result.error,
    };
  }

  return {
    ok: true,
    keyAvailable: true,
    model,
    message: "AI captions are connected.",
    sample: result.caption,
  };
}

async function describeImage(imageUrl: string, fallback: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const result = await requestImageCaption({
    apiKey,
    model: process.env.OPENAI_IMAGE_CAPTION_MODEL ?? DEFAULT_IMAGE_CAPTION_MODEL,
    imageUrl,
    prompt: `Write one short, factual caption for this MakeSG upload. Describe only what is visible. Keep it warm but plain, under 16 words, no markdown, no quotation marks. Context: ${fallback}.`,
    timeoutMs: CAPTION_TIMEOUT_MS,
  });

  return result.ok ? result.caption : null;
}

async function requestImageCaption({
  apiKey,
  model,
  imageUrl,
  prompt,
  timeoutMs,
}: {
  apiKey: string;
  model: string;
  imageUrl: string;
  prompt: string;
  timeoutMs: number;
}): Promise<{ ok: true; caption: string } | { ok: false; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
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

    if (!response.ok) {
      return { ok: false, error: await readOpenAiError(response) };
    }

    const payload = (await response.json()) as ResponsesCaptionPayload;
    const caption = cleanCaption(extractOutputText(payload));
    return caption ? { ok: true, caption } : { ok: false, error: "OpenAI responded, but no caption text was returned." };
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError" ? "The OpenAI request timed out." : "The OpenAI request failed before a response was returned.";
    return { ok: false, error: message };
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

function cleanCaption(caption: string) {
  const cleaned = caption
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;
  return cleaned.length > 140 ? `${cleaned.slice(0, 137).trim()}...` : cleaned;
}
