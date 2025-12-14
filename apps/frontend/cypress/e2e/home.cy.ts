describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the Qckstrt title", () => {
    cy.contains("Qckstrt").should("be.visible");
  });

  it("should display the RAG Demo link", () => {
    cy.contains("RAG Demo").should("be.visible");
  });

  it("should navigate to RAG Demo page when clicking the link", () => {
    cy.contains("RAG Demo").click();
    cy.url().should("include", "/rag-demo");
    cy.contains("RAG Demo - Login").should("be.visible");
  });
});
