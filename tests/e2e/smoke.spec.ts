import { expect, test } from "@playwright/test";

test("homepage renders primary CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Stop queueing with strangers who ruin the night\./i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse LFG board" })).toBeVisible();
});

test("lfg page renders filter stack and listings", async ({ page }) => {
  await page.goto("/lfg");

  await expect(page.getByRole("heading", { name: "Filter stack" })).toBeVisible();
  await expect(page.getByText("Roles needed").first()).toBeVisible();
});

test("squads page renders core squad intelligence", async ({ page }) => {
  await page.goto("/squads");

  await expect(page.getByRole("heading", { name: "Give good teams a home that survives one session." })).toBeVisible();
  await expect(page.getByText("Session and review activity synced")).toBeVisible();
});

test("profile page renders trust badges", async ({ page }) => {
  await page.goto("/profile/ghosttrace");

  await expect(page.getByRole("heading", { name: "Public trust badges" })).toBeVisible();
  await expect(page.getByText("Reliable")).toBeVisible();
});

test("auth routes render entry forms", async ({ page }) => {
  await page.goto("/auth/register");
  await expect(page.getByRole("heading", { name: "Build your Raidbase profile" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();

  await page.goto("/auth/sign-in");
  await expect(page.getByRole("heading", { name: "Welcome back to Raidbase" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
