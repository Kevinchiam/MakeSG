import { describe, expect, it } from "vitest";
import {
  adminEntryCookieName,
  adminEntryMaxAge,
  adminLoginConfigured,
  adminSessionCookieName,
  adminSessionMaxAge,
  legacyAdminSessionCookieName,
  validAdminCredentials,
} from "@/lib/admin-auth";

describe("admin auth", () => {
  it("disables login when credentials are not explicitly configured", () => {
    const config = {};

    expect(adminLoginConfigured(config)).toBe(false);
    expect(validAdminCredentials("Admin", "MakeSG", config)).toBe(false);
  });

  it("requires username, password and session token", () => {
    expect(adminLoginConfigured({ username: "owner", password: "secret" })).toBe(false);
    expect(adminLoginConfigured({ username: "owner", sessionToken: "token" })).toBe(false);
    expect(adminLoginConfigured({ password: "secret", sessionToken: "token" })).toBe(false);
    expect(adminLoginConfigured({ username: "owner", password: "secret", sessionToken: "token" })).toBe(true);
  });

  it("accepts only the configured credentials", () => {
    const config = { username: "owner", password: "secret", sessionToken: "token" };

    expect(validAdminCredentials("owner", "secret", config)).toBe(true);
    expect(validAdminCredentials("Admin", "MakeSG", config)).toBe(false);
    expect(validAdminCredentials("owner", "wrong", config)).toBe(false);
  });

  it("uses a short versioned admin session cookie", () => {
    expect(adminSessionCookieName).toBe("makesg_admin_v2");
    expect(adminSessionCookieName).not.toBe(legacyAdminSessionCookieName);
    expect(adminSessionMaxAge).toBeLessThanOrEqual(60 * 60 * 8);
  });

  it("uses a separate short-lived admin home entry cookie", () => {
    expect(adminEntryCookieName).toBe("makesg_admin_entry");
    expect(adminEntryCookieName).not.toBe(adminSessionCookieName);
    expect(adminEntryMaxAge).toBeLessThanOrEqual(60);
  });
});
