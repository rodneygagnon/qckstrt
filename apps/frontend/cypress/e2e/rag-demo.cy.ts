describe("RAG Demo Page", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    cy.visit("/rag-demo");
  });

  describe("Login Flow", () => {
    it("should show login form when not authenticated", () => {
      cy.contains("RAG Demo - Login").should("be.visible");
      cy.contains("Enter an email to create a demo session").should(
        "be.visible",
      );
      cy.get('input[type="email"]').should("be.visible");
      cy.contains("button", "Start Demo Session").should("be.visible");
    });

    it("should have default email placeholder", () => {
      cy.get('input[type="email"]').should(
        "have.attr",
        "placeholder",
        "demo@example.com",
      );
    });

    it("should login successfully with email", () => {
      cy.get('input[type="email"]').clear().type("test@example.com");
      cy.contains("button", "Start Demo Session").click();

      // Should show the main RAG demo interface
      cy.contains("RAG Pipeline Demo").should("be.visible");
      cy.contains("test@example.com").should("be.visible");
      cy.contains("Logout").should("be.visible");
    });

    it("should persist login state in localStorage", () => {
      cy.get('input[type="email"]').clear().type("persist@example.com");
      cy.contains("button", "Start Demo Session").click();

      // Verify user is stored
      cy.window().then((win) => {
        const user = JSON.parse(win.localStorage.getItem("user") || "null");
        expect(user).to.not.be.null;
        expect(user.email).to.equal("persist@example.com");
      });
    });

    it("should logout successfully", () => {
      // Login first
      cy.get('input[type="email"]').clear().type("logout@example.com");
      cy.contains("button", "Start Demo Session").click();
      cy.contains("RAG Pipeline Demo").should("be.visible");

      // Logout
      cy.contains("Logout").click();

      // Should return to login screen
      cy.contains("RAG Demo - Login").should("be.visible");

      // localStorage should be cleared
      cy.window().then((win) => {
        const user = win.localStorage.getItem("user");
        expect(user).to.be.null;
      });
    });
  });

  describe("RAG Demo Interface", () => {
    beforeEach(() => {
      // Login before each test in this block
      cy.get('input[type="email"]').clear().type("demo@example.com");
      cy.contains("button", "Start Demo Session").click();
      cy.contains("RAG Pipeline Demo").should("be.visible");
    });

    it("should show Index Document tab by default", () => {
      cy.contains("Index Document").should("be.visible");
      cy.contains("Index a Document").should("be.visible");
      cy.contains(
        "Paste text content below to index it into the vector database",
      ).should("be.visible");
    });

    it("should have document ID and text inputs in Index tab", () => {
      cy.get('input[placeholder="e.g., my-document-1"]').should("be.visible");
      cy.get('textarea[placeholder="Paste your document text here..."]').should(
        "be.visible",
      );
      cy.contains("button", "Index Document").should("be.visible");
    });

    it("should disable Index Document button when text is empty", () => {
      cy.contains("button", "Index Document").should("be.disabled");
    });

    it("should enable Index Document button when text is entered", () => {
      cy.get('textarea[placeholder="Paste your document text here..."]').type(
        "Some test document content",
      );
      cy.contains("button", "Index Document").should("not.be.disabled");
    });

    it("should switch to Query tab", () => {
      cy.contains("button", "Query Knowledge Base").click();
      cy.contains("Ask a Question").should("be.visible");
      cy.contains("Ask a question about your indexed documents").should(
        "be.visible",
      );
    });

    it("should have query input and buttons in Query tab", () => {
      cy.contains("button", "Query Knowledge Base").click();
      cy.get(
        'input[placeholder="e.g., What are the main topics discussed in the document?"]',
      ).should("be.visible");
      cy.contains("button", "Ask Question (RAG)").should("be.visible");
      cy.contains("button", "Search Only").should("be.visible");
    });

    it("should disable query buttons when query is empty", () => {
      cy.contains("button", "Query Knowledge Base").click();
      cy.contains("button", "Ask Question (RAG)").should("be.disabled");
      cy.contains("button", "Search Only").should("be.disabled");
    });

    it("should enable query buttons when query is entered", () => {
      cy.contains("button", "Query Knowledge Base").click();
      cy.get(
        'input[placeholder="e.g., What are the main topics discussed in the document?"]',
      ).type("What is this about?");
      cy.contains("button", "Ask Question (RAG)").should("not.be.disabled");
      cy.contains("button", "Search Only").should("not.be.disabled");
    });

    it("should switch between tabs", () => {
      // Start on Index tab
      cy.contains("Index a Document").should("be.visible");

      // Switch to Query tab
      cy.contains("button", "Query Knowledge Base").click();
      cy.contains("Ask a Question").should("be.visible");
      cy.contains("Index a Document").should("not.exist");

      // Switch back to Index tab
      cy.contains("button", "Index Document").first().click();
      cy.contains("Index a Document").should("be.visible");
    });
  });

  describe("RAG Demo with API Mocking", () => {
    beforeEach(() => {
      // Login
      cy.get('input[type="email"]').clear().type("demo@example.com");
      cy.contains("button", "Start Demo Session").click();
      cy.contains("RAG Pipeline Demo").should("be.visible");
    });

    it("should handle index document API call", () => {
      // Mock the GraphQL endpoint
      cy.intercept("POST", "**/graphql", (req) => {
        if (req.body.query?.includes("indexDocument")) {
          req.reply({
            data: {
              indexDocument: true,
            },
          });
        }
      }).as("indexDocument");

      // Fill in document form
      cy.get('input[placeholder="e.g., my-document-1"]').type("test-doc-1");
      cy.get('textarea[placeholder="Paste your document text here..."]').type(
        "This is a test document about artificial intelligence and machine learning.",
      );

      // Submit - this will trigger the alert
      cy.contains("button", "Index Document").click();

      // Wait for API call
      cy.wait("@indexDocument");

      // The alert should show success (Cypress automatically accepts alerts)
      cy.on("window:alert", (text) => {
        expect(text).to.include("indexed successfully");
      });
    });

    it("should handle answer query API call", () => {
      // Mock the GraphQL endpoint
      cy.intercept("POST", "**/graphql", (req) => {
        if (req.body.query?.includes("answerQuery")) {
          req.reply({
            data: {
              answerQuery: "Based on the indexed documents, the answer is 42.",
            },
          });
        }
      }).as("answerQuery");

      // Switch to Query tab
      cy.contains("button", "Query Knowledge Base").click();

      // Enter a question
      cy.get(
        'input[placeholder="e.g., What are the main topics discussed in the document?"]',
      ).type("What is the meaning of life?");

      // Ask question
      cy.contains("button", "Ask Question (RAG)").click();

      // Wait for API call
      cy.wait("@answerQuery");

      // Answer should be displayed
      cy.contains("Answer").should("be.visible");
      cy.contains("Based on the indexed documents, the answer is 42.").should(
        "be.visible",
      );
    });

    it("should handle search API call", () => {
      // Mock the GraphQL endpoint
      cy.intercept("POST", "**/graphql", (req) => {
        if (req.body.query?.includes("searchText")) {
          req.reply({
            data: {
              searchText: [
                "First relevant chunk about AI",
                "Second relevant chunk about ML",
                "Third relevant chunk about NLP",
              ],
            },
          });
        }
      }).as("searchText");

      // Switch to Query tab
      cy.contains("button", "Query Knowledge Base").click();

      // Enter a search query
      cy.get(
        'input[placeholder="e.g., What are the main topics discussed in the document?"]',
      ).type("artificial intelligence");

      // Search
      cy.contains("button", "Search Only").click();

      // Wait for API call
      cy.wait("@searchText");

      // Results should be displayed
      cy.contains("Relevant Chunks (3)").should("be.visible");
      cy.contains("First relevant chunk about AI").should("be.visible");
      cy.contains("Second relevant chunk about ML").should("be.visible");
      cy.contains("Third relevant chunk about NLP").should("be.visible");
    });

    it("should handle API error gracefully", () => {
      // Mock the GraphQL endpoint to return an error
      cy.intercept("POST", "**/graphql", (req) => {
        if (req.body.query?.includes("answerQuery")) {
          req.reply({
            errors: [{ message: "Internal server error" }],
          });
        }
      }).as("answerQueryError");

      // Switch to Query tab
      cy.contains("button", "Query Knowledge Base").click();

      // Enter a question
      cy.get(
        'input[placeholder="e.g., What are the main topics discussed in the document?"]',
      ).type("What is this?");

      // Ask question
      cy.contains("button", "Ask Question (RAG)").click();

      // Wait for API call
      cy.wait("@answerQueryError");

      // Error should be displayed in answer area
      cy.contains("Error:").should("be.visible");
    });
  });
});
