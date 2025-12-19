import { test, expect } from "@playwright/test";

test.describe("RAG Demo Page", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/rag-demo");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe("Login Flow", () => {
    test("should show login form when not authenticated", async ({ page }) => {
      await expect(page.getByText("RAG Demo - Login")).toBeVisible();
      await expect(
        page.getByText("Enter an email to create a demo session"),
      ).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Start Demo Session" }),
      ).toBeVisible();
    });

    test("should have default email placeholder", async ({ page }) => {
      await expect(page.locator('input[type="email"]')).toHaveAttribute(
        "placeholder",
        "demo@example.com",
      );
    });

    test("should login successfully with email", async ({ page }) => {
      await page.locator('input[type="email"]').fill("test@example.com");
      await page.getByRole("button", { name: "Start Demo Session" }).click();

      // Should show the main RAG demo interface
      await expect(page.getByText("RAG Pipeline Demo")).toBeVisible();
      await expect(page.getByText("test@example.com")).toBeVisible();
      await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
    });

    test("should persist login state in localStorage", async ({ page }) => {
      await page.locator('input[type="email"]').fill("persist@example.com");
      await page.getByRole("button", { name: "Start Demo Session" }).click();

      // Verify user is stored
      const user = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem("user") || "null");
      });
      expect(user).not.toBeNull();
      expect(user.email).toBe("persist@example.com");
    });

    test("should logout successfully", async ({ page }) => {
      // Login first with a non-conflicting email
      await page.locator('input[type="email"]').fill("test@example.com");
      await page.getByRole("button", { name: "Start Demo Session" }).click();
      await expect(page.getByText("RAG Pipeline Demo")).toBeVisible();

      // Logout using the button
      await page.getByRole("button", { name: "Logout" }).click();

      // Should return to login screen
      await expect(page.getByText("RAG Demo - Login")).toBeVisible();

      // localStorage should be cleared
      const user = await page.evaluate(() => localStorage.getItem("user"));
      expect(user).toBeNull();
    });
  });

  test.describe("RAG Demo Interface", () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test in this block
      await page.locator('input[type="email"]').fill("demo@example.com");
      await page.getByRole("button", { name: "Start Demo Session" }).click();
      await expect(page.getByText("RAG Pipeline Demo")).toBeVisible();
    });

    test("should show Index Document tab by default", async ({ page }) => {
      // Check for the heading "Index a Document" which is unique
      await expect(
        page.getByRole("heading", { name: "Index a Document" }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Paste text content below to index it into the vector database",
        ),
      ).toBeVisible();
    });

    test("should have document ID and text inputs in Index tab", async ({
      page,
    }) => {
      await expect(
        page.locator('input[placeholder="e.g., my-document-1"]'),
      ).toBeVisible();
      await expect(
        page.locator(
          'textarea[placeholder="Paste your document text here..."]',
        ),
      ).toBeVisible();
      // Use the submit button (second "Index Document" button)
      await expect(
        page.getByRole("button", { name: "Index Document" }).nth(1),
      ).toBeVisible();
    });

    test("should disable Index Document button when text is empty", async ({
      page,
    }) => {
      // The submit button is the second one
      await expect(
        page.getByRole("button", { name: "Index Document" }).nth(1),
      ).toBeDisabled();
    });

    test("should enable Index Document button when text is entered", async ({
      page,
    }) => {
      await page
        .locator('textarea[placeholder="Paste your document text here..."]')
        .fill("Some test document content");
      await expect(
        page.getByRole("button", { name: "Index Document" }).nth(1),
      ).toBeEnabled();
    });

    test("should switch to Query tab", async ({ page }) => {
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();
      await expect(
        page.getByRole("heading", { name: "Ask a Question" }),
      ).toBeVisible();
      await expect(
        page.getByText("Ask a question about your indexed documents"),
      ).toBeVisible();
    });

    test("should have query input and buttons in Query tab", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();
      await expect(
        page.locator(
          'input[placeholder="e.g., What are the main topics discussed in the document?"]',
        ),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Ask Question (RAG)" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Search Only" }),
      ).toBeVisible();
    });

    test("should disable query buttons when query is empty", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();
      await expect(
        page.getByRole("button", { name: "Ask Question (RAG)" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Search Only" }),
      ).toBeDisabled();
    });

    test("should enable query buttons when query is entered", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();
      await page
        .locator(
          'input[placeholder="e.g., What are the main topics discussed in the document?"]',
        )
        .fill("What is this about?");
      await expect(
        page.getByRole("button", { name: "Ask Question (RAG)" }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "Search Only" }),
      ).toBeEnabled();
    });

    test("should switch between tabs", async ({ page }) => {
      // Start on Index tab
      await expect(
        page.getByRole("heading", { name: "Index a Document" }),
      ).toBeVisible();

      // Switch to Query tab
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();
      await expect(
        page.getByRole("heading", { name: "Ask a Question" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Index a Document" }),
      ).not.toBeVisible();

      // Switch back to Index tab (first "Index Document" button is the tab)
      await page
        .getByRole("button", { name: "Index Document" })
        .first()
        .click();
      await expect(
        page.getByRole("heading", { name: "Index a Document" }),
      ).toBeVisible();
    });
  });

  test.describe("RAG Demo with API Mocking", () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.locator('input[type="email"]').fill("demo@example.com");
      await page.getByRole("button", { name: "Start Demo Session" }).click();
      await expect(page.getByText("RAG Pipeline Demo")).toBeVisible();
    });

    test("should handle index document API call", async ({ page }) => {
      // Mock the GraphQL endpoint
      await page.route("**/graphql", async (route) => {
        const request = route.request();
        const postData = request.postDataJSON();

        if (postData?.query?.includes("indexDocument")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                indexDocument: true,
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Fill in document form
      await page
        .locator('input[placeholder="e.g., my-document-1"]')
        .fill("test-doc-1");
      await page
        .locator('textarea[placeholder="Paste your document text here..."]')
        .fill(
          "This is a test document about artificial intelligence and machine learning.",
        );

      // Submit using the second "Index Document" button (the submit button)
      await page.getByRole("button", { name: "Index Document" }).nth(1).click();

      // Toast notification should appear with success message
      await expect(page.getByText(/indexed successfully/)).toBeVisible();
    });

    test("should handle answer query API call", async ({ page }) => {
      // Mock the GraphQL endpoint
      await page.route("**/graphql", async (route) => {
        const request = route.request();
        const postData = request.postDataJSON();

        if (postData?.query?.includes("answerQuery")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                answerQuery:
                  "Based on the indexed documents, the answer is 42.",
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Switch to Query tab
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();

      // Enter a question
      await page
        .locator(
          'input[placeholder="e.g., What are the main topics discussed in the document?"]',
        )
        .fill("What is the meaning of life?");

      // Ask question
      await page.getByRole("button", { name: "Ask Question (RAG)" }).click();

      // Answer should be displayed
      await expect(page.getByRole("heading", { name: "Answer" })).toBeVisible();
      await expect(
        page.getByText("Based on the indexed documents, the answer is 42."),
      ).toBeVisible();
    });

    test("should handle search API call", async ({ page }) => {
      // Mock the GraphQL endpoint
      await page.route("**/graphql", async (route) => {
        const request = route.request();
        const postData = request.postDataJSON();

        if (postData?.query?.includes("searchText")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: {
                searchText: {
                  results: [
                    {
                      content: "First relevant chunk about AI",
                      documentId: "doc-1",
                      score: 0.95,
                    },
                    {
                      content: "Second relevant chunk about ML",
                      documentId: "doc-2",
                      score: 0.85,
                    },
                    {
                      content: "Third relevant chunk about NLP",
                      documentId: "doc-3",
                      score: 0.75,
                    },
                  ],
                  total: 3,
                  hasMore: false,
                },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Switch to Query tab
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();

      // Enter a search query
      await page
        .locator(
          'input[placeholder="e.g., What are the main topics discussed in the document?"]',
        )
        .fill("artificial intelligence");

      // Search
      await page.getByRole("button", { name: "Search Only" }).click();

      // Results should be displayed
      await expect(page.getByText(/Relevant Chunks \(3\)/)).toBeVisible();
      await expect(
        page.getByText("First relevant chunk about AI"),
      ).toBeVisible();
      await expect(
        page.getByText("Second relevant chunk about ML"),
      ).toBeVisible();
      await expect(
        page.getByText("Third relevant chunk about NLP"),
      ).toBeVisible();
    });

    test("should handle API error gracefully", async ({ page }) => {
      // Mock the GraphQL endpoint to return an error
      await page.route("**/graphql", async (route) => {
        const request = route.request();
        const postData = request.postDataJSON();

        if (postData?.query?.includes("answerQuery")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              errors: [{ message: "Internal server error" }],
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Switch to Query tab
      await page.getByRole("button", { name: "Query Knowledge Base" }).click();

      // Enter a question
      await page
        .locator(
          'input[placeholder="e.g., What are the main topics discussed in the document?"]',
        )
        .fill("What is this?");

      // Ask question
      await page.getByRole("button", { name: "Ask Question (RAG)" }).click();

      // Error should be displayed in answer area
      await expect(page.getByText(/Error:/)).toBeVisible();
    });
  });
});
