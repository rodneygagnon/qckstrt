import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Home from "../app/page";

it("should display Qckstrt title", () => {
  render(<Home />);

  const title = screen.getByText(/Qckstrt/i);

  expect(title).toBeInTheDocument();
});

it("should have RAG Demo link", () => {
  render(<Home />);

  const ragDemoLink = screen.getByText(/RAG Demo/i);

  expect(ragDemoLink).toBeInTheDocument();
});
