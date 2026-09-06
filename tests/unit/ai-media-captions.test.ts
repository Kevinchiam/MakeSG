import { afterEach, describe, expect, it, vi } from "vitest";
import { captionUploadedMedia } from "@/lib/ai-media-captions";

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
});
