import { describe, expect, it } from "vitest";
import { canEditBusiness, canEditProject, canModerate, canPublishBusiness } from "@/lib/permissions";

describe("permission helpers", () => {
  it("allows owners to edit their own project", () => {
    expect(canEditProject({ userId: "u1", accountType: "creative" }, { ownerId: "u1" })).toBe(true);
    expect(canEditProject({ userId: "u2", accountType: "creative" }, { ownerId: "u1" })).toBe(false);
  });

  it("allows admins to moderate and publish", () => {
    const admin = { userId: "admin", accountType: "admin" as const };
    expect(canModerate(admin)).toBe(true);
    expect(canPublishBusiness(admin)).toBe(true);
    expect(canEditBusiness(admin, { ownerId: "other" })).toBe(true);
  });
});
