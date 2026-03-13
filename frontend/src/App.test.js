import { render, screen } from "@testing-library/react";

jest.mock("./services/api", () => ({
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
}));

import App from "./App";

/**
 * Clears local storage before each frontend test.
 * @returns {void}
 */
function resetBrowserState() {
  window.localStorage.clear();
}

beforeEach(() => {
  resetBrowserState();
});

test("renders the login page by default", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /employee command center/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});
