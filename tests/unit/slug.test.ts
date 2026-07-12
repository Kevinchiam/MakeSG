import { describe, expect, it } from "vitest";
import { createSlug } from "@/lib/slug";

describe("createSlug", () => {
  it("creates stable URL slugs", () => {
    expect(createSlug("Kaki Bukit Precision Works!")).toBe("kaki-bukit-precision-works");
    expect(createSlug("Design & Fabrication")).toBe("design-and-fabrication");
  });
});
