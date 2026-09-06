import { describe, expect, it } from "vitest";
import { assessModeration } from "@/lib/moderation";

describe("moderation automation", () => {
  it("auto-approves a clean business listing with public contact", () => {
    const result = assessModeration({
      kind: "business",
      texts: [
        "Studio Sample",
        "Product photography for designers and small studios.",
        "Studio Sample helps designers and creative teams photograph objects, prototypes and spaces with clear art direction, careful lighting and reliable post-production support.",
        "hello@example.com",
        "Photography",
      ],
      hasContact: true,
      hasMedia: true,
    });

    expect(result.decision).toBe("auto_approved");
    expect(result.risk).toBe("low");
  });

  it("keeps a clean business listing in review when public contact is missing", () => {
    const result = assessModeration({
      kind: "business",
      texts: [
        "Studio Sample",
        "Product photography for designers and small studios.",
        "Studio Sample helps designers and creative teams photograph objects, prototypes and spaces with clear art direction, careful lighting and reliable post-production support.",
        "Photography",
      ],
      hasContact: false,
      hasMedia: true,
    });

    expect(result.decision).toBe("needs_review");
    expect(result.risk).toBe("medium");
  });

  it("auto-approves a clean recommendation", () => {
    const result = assessModeration({
      kind: "recommendation",
      texts: [
        "Kevin",
        "kevin@example.com",
        "They delivered careful work, communicated clearly and helped solve practical production issues.",
        "Quality 5/5",
        "Reliability 5/5",
        "Collaboration 5/5",
      ],
      hasContact: true,
      hasMedia: false,
    });

    expect(result.decision).toBe("auto_approved");
    expect(result.risk).toBe("low");
  });

  it("blocks clearly unsuitable submissions before they can be approved", () => {
    const result = assessModeration({
      kind: "recommendation",
      texts: ["This is a crypto giveaway and click here for free money."],
      filenames: ["portfolio-porn.jpg"],
      hasContact: true,
    });

    expect(result.decision).toBe("blocked");
    expect(result.risk).toBe("high");
  });
});
