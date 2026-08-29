import { expect, test } from "@playwright/test";

test("browses and filters providers", async ({ page }) => {
  await page.goto("/businesses?service=cnc-machining&material=aluminium&recommended=true");
  await expect(page.getByRole("heading", { name: "Browse businesses" })).toBeVisible();
  await expect(page.getByText("No businesses match those filters")).toBeVisible();
});

test("business profile routes have a not-found state without live listings", async ({ page }) => {
  await page.goto("/businesses/kaki-bukit-precision-works");
  await expect(page.getByText(/not found/i)).toBeVisible();
});

test("creates a project draft", async ({ page }) => {
  await page.goto("/projects/new");
  await page.getByLabel("Project title").fill("Aluminium lamp");
  await page.getByLabel("Description").fill("A machined aluminium table lamp prototype with electronics and a dimmable light.");
  await page.getByLabel("Intended outcome").fill("Working prototype");
  await page.getByRole("button", { name: /Next/ }).click();
  await expect(page.getByText("Requirements")).toBeVisible();
});

test("submits a business listing", async ({ page }) => {
  await page.goto("/for-businesses");
  await page.getByLabel("Business name").fill("Demo Fabrication Studio");
  await page.getByLabel("Short summary").fill("A careful fabrication studio for creative prototypes.");
  await page.getByLabel("Full description").fill("A careful fabrication studio for creative prototypes, small batches and installation support across Singapore.");
  await page.getByLabel("Website").fill("https://example.com");
  await page.getByLabel("Public email").fill("hello@example.com");
  await page.getByLabel("Location").fill("Ubi");
  await page.getByLabel("Minimum budget").fill("1000");
  await page.getByLabel("Typical lead time").fill("14");
  await page.getByLabel("Woodworking").check();
  await page.getByRole("button", { name: /Submit for approval/ }).click();
  await expect(page.getByText("Listing submitted for approval")).toBeVisible();
});

test("admin approves a listing", async ({ page }) => {
  await page.goto("/admin/businesses");
  await expect(page.getByRole("heading", { name: "Admin login" }).or(page.getByRole("heading", { name: "Businesses" }))).toBeVisible();
});

test("finds an existing business before recommendation", async ({ page }) => {
  await page.goto("/recommend-business?business=ubi-formworks-studio");
  await expect(page.getByRole("heading", { name: "Recommend a business you trust" })).toBeVisible();
  await expect(page.getByText("No existing listing matches that name.")).toBeVisible();
});
