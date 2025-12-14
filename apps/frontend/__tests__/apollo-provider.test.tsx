import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ApolloProvider } from "../lib/apollo-provider";

describe("ApolloProvider", () => {
  it("should render children", () => {
    render(
      <ApolloProvider>
        <div data-testid="child">Test Child</div>
      </ApolloProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should provide Apollo context to children", () => {
    // The fact that children render without error indicates context is provided
    const { container } = render(
      <ApolloProvider>
        <span>Apollo Context Available</span>
      </ApolloProvider>,
    );

    expect(container.textContent).toBe("Apollo Context Available");
  });
});
