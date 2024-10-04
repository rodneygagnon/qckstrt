import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Home from "../app/page";

it("shouldHaveDocsText", () => {
  render(<Home />); // ARRANGE

  const myElem = screen.getByText(/Get started by editing/i); // ACT

  expect(myElem).toBeInTheDocument(); // ASSERT
});
