import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the Qckstrt title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Qckstrt", level: 1 }),
    ).toBeVisible();
  });

  test("should display the RAG Demo link", async ({ page }) => {
    await expect(page.getByText("RAG Demo")).toBeVisible();
  });

  test("should navigate to RAG Demo page when clicking the link", async ({
    page,
  }) => {
    await page.getByRole("link", { name: /RAG Demo/i }).click();
    await expect(page).toHaveURL(/\/rag-demo/);
    await expect(page.getByText("RAG Demo - Login")).toBeVisible();
  });
});
