import { render, screen } from "@testing-library/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "~/components/theme-provider";

vi.mock("next-themes", () => ({
  ThemeProvider: vi.fn(({ children }) => (
    <div data-testid="provider">{children}</div>
  )),
}));

describe("ThemeProvider", () => {
  it("forwards properties and children", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <span>content</span>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("provider")).toHaveTextContent("content");
    expect(NextThemesProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: "class",
        defaultTheme: "system",
        children: expect.anything(),
      }),
      undefined,
    );
  });
});
