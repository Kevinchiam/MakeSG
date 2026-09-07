import { afterEach, describe, expect, it, vi } from "vitest";
import { captionUploadedMedia, testAiImageCaptionConnection } from "@/lib/ai-media-captions";

const originalApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = originalApiKey;
  vi.unstubAllGlobals();
});

describe("AI media captions", () => {
  it("preserves a user-written caption", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    process.env.OPENAI_API_KEY = "test-key";

    await expect(
      captionUploadedMedia({
        caption: "Finished ceramic bowl",
        fileName: "IMG_1234.jpg",
        fallback: "Studio portfolio",
        mimeType: "image/jpeg",
        publicUrl: "https://example.com/bowl.jpg",
      }),
    ).resolves.toBe("Finished ceramic bowl");

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses AI for blank image captions when available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output_text: "A ceramic bowl with blue glaze on a table." }),
      }),
    );
    process.env.OPENAI_API_KEY = "test-key";

    await expect(
      captionUploadedMedia({
        caption: "",
        fileName: "Screenshot 2026-09-06.png",
        fallback: "StudioWongs portfolio",
        mediaKind: "photo",
        mimeType: "image/png",
        publicUrl: "https://example.com/bowl.png",
      }),
    ).resolves.toBe("A ceramic bowl with blue glaze on a table.");
  });

  it("falls back when AI captioning is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    process.env.OPENAI_API_KEY = "test-key";

    await expect(
      captionUploadedMedia({
        caption: "",
        fileName: "Screenshot 2026-09-06.png",
        fallback: "StudioWongs portfolio",
        mediaKind: "photo",
        mimeType: "image/png",
        publicUrl: "https://example.com/bowl.png",
      }),
    ).resolves.toBe("StudioWongs portfolio photo");
  });

  it("does not send videos to AI captioning", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    process.env.OPENAI_API_KEY = "test-key";

    await expect(
      captionUploadedMedia({
        caption: "",
        fileName: "workshop-process.mov",
        fallback: "StudioWongs portfolio",
        mediaKind: "video",
        mimeType: "video/quicktime",
        publicUrl: "https://example.com/process.mov",
      }),
    ).resolves.toBe("Workshop process");

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports when the OpenAI key is missing", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    delete process.env.OPENAI_API_KEY;

    await expect(testAiImageCaptionConnection()).resolves.toMatchObject({
      ok: false,
      keyAvailable: false,
      message: "OpenAI is not available to this deployment yet.",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports OpenAI diagnostic errors without exposing the key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ error: { message: "Incorrect API key provided.", type: "invalid_request_error", code: "invalid_api_key" } }),
      }),
    );
    process.env.OPENAI_API_KEY = "secret-test-key";

    await expect(testAiImageCaptionConnection({ imageUrl: "https://example.com/test.png" })).resolves.toMatchObject({
      ok: false,
      keyAvailable: true,
      message: "OpenAI was reached, but the caption test did not complete.",
      detail: expect.not.stringContaining("secret-test-key"),
    });
  });

  it("reports when the diagnostic image URL is missing", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    process.env.OPENAI_API_KEY = "test-key";

    await expect(testAiImageCaptionConnection()).resolves.toMatchObject({
      ok: false,
      keyAvailable: true,
      message: "The AI caption check could not create a public test image URL.",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
