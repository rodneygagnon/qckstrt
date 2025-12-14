/// <reference types="cypress" />

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      demoLogin(email?: string): Chainable<void>;
      demoLogout(): Chainable<void>;
      mockGraphQL(operationName: string, response: object): Chainable<null>;
      mockGraphQLError(
        operationName: string,
        errorMessage: string,
      ): Chainable<null>;
    }
  }
}

// Custom command for demo login
Cypress.Commands.add("demoLogin", (email: string = "demo@example.com") => {
  const demoUser = {
    id: crypto.randomUUID(),
    email,
    roles: ["user"],
    department: "demo",
    clearance: "public",
  };

  cy.window().then((win) => {
    win.localStorage.setItem("user", JSON.stringify(demoUser));
  });
});

// Custom command to clear demo session
Cypress.Commands.add("demoLogout", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("user");
  });
});

// Custom command to mock GraphQL responses
Cypress.Commands.add(
  "mockGraphQL",
  (operationName: string, response: object) => {
    cy.intercept("POST", "**/graphql", (req) => {
      if (
        req.body.operationName === operationName ||
        req.body.query?.includes(operationName)
      ) {
        req.reply({ data: response });
      }
    }).as(operationName);
  },
);

// Custom command to mock GraphQL error
Cypress.Commands.add(
  "mockGraphQLError",
  (operationName: string, errorMessage: string) => {
    cy.intercept("POST", "**/graphql", (req) => {
      if (
        req.body.operationName === operationName ||
        req.body.query?.includes(operationName)
      ) {
        req.reply({ errors: [{ message: errorMessage }] });
      }
    }).as(`${operationName}Error`);
  },
);
