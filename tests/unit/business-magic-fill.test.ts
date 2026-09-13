import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMagicProfileImage, isBusinessMagicFillAvailable, researchBusinessMagicFill } from "@/lib/business-magic-fill";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_BUSINESS_MAGIC_FILL_MODEL;

afterEach(() => {
  process.env.OPENAI_API_KEY = originalApiKey;
  process.env.OPENAI_BUSINESS_MAGIC_FILL_MODEL = originalModel;
  vi.unstubAllGlobals();
});

describe("business magic fill", () => {
  it("hides magic fill when OpenAI credits are exhausted", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: "You have no credits remaining.", type: "insufficient_quota", code: "credit_balance_exhausted" } }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(isBusinessMagicFillAvailable()).resolves.toBe(false);

    const openAiBody = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as { max_output_tokens?: number };
    expect(openAiBody.max_output_tokens).toBe(16);
  });

  it("reports when OpenAI is not configured", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    delete process.env.OPENAI_API_KEY;

    await expect(researchBusinessMagicFill("Studio Test")).resolves.toMatchObject({
      ok: false,
      message: expect.stringContaining("Magic fill is not connected"),
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns a draft and profile image from the business website", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output_text: JSON.stringify({
            businessName: "Studio Test",
            shortDescription: "A photography studio for thoughtful product campaigns.",
            description: "Studio Test is a Singapore photography studio helping brands document products, interiors and campaigns with a calm visual approach.",
            websiteUrl: "https://example.com",
            publicEmail: "",
            phoneNumber: "",
            location: "Singapore",
            businessType: "studio",
            services: ["photography", "videography"],
            otherService: "",
            sources: ["https://example.com"],
            confidenceNotes: ["Public email not found."],
          }),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '<meta property="og:image" content="/profile.jpg">',
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "image/jpeg", "content-length": "4" }),
        arrayBuffer: async () => new ArrayBuffer(4),
      });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(researchBusinessMagicFill("Studio Test")).resolves.toMatchObject({
      ok: true,
      draft: {
        businessName: "Studio Test",
        profileImageUrl: "https://example.com/profile.jpg",
        services: ["photography", "videography"],
      },
    });

    const openAiBody = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as { tools?: Array<{ type?: string }> };
    expect(openAiBody.tools?.[0]?.type).toBe("web_search");
  });

  it("only accepts supported image responses for storage upload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "text/html" }),
        arrayBuffer: async () => new ArrayBuffer(8),
      }),
    );

    await expect(fetchMagicProfileImage("https://example.com")).resolves.toBeNull();
  });
});
