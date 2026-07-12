import { describe, expect, it } from "vitest";
import { businessRecommendationSchema, businessSchema, projectSchema } from "@/lib/validation";

describe("form validation", () => {
  it("accepts a complete project brief", () => {
    const result = projectSchema.safeParse({
      title: "Lamp prototype",
      description: "A machined aluminium table lamp prototype for photography.",
      intendedOutcome: "Working prototype",
      projectType: "physical",
      materials: ["aluminium"],
      knownServices: ["cnc-machining"],
      prototypeOrProduction: "prototype",
    });
    expect(result.success).toBe(true);
  });

  it("requires useful business listing content", () => {
    const result = businessSchema.safeParse({
      name: "A",
      shortDescription: "too short",
      description: "short",
      websiteUrl: "not-a-url",
      publicEmail: "nope",
      location: "",
      minimumBudget: 0,
      typicalLeadTime: 1,
      businessType: "studio",
      services: [],
      materials: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a specific word-of-mouth recommendation", () => {
    const result = businessRecommendationSchema.safeParse({
      businessId: "biz_ubi_formworks",
      recommenderName: "Alicia",
      recommenderEmail: "alicia@example.com",
      relationship: "client",
      projectContext: "Exhibition plinth prototype",
      recommendedFor: ["Clear communication"],
      comment: "They were clear about materials, timelines and install details throughout the project.",
      permissionToContact: true,
      permissionToPublishName: false,
    });

    expect(result.success).toBe(true);
  });
});
