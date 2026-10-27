import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();

  return {
    ...react,
    ViewTransition: ({ children }: { children: React.ReactNode }) => children,
  };
});
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

describe("Layout", () => {
  it("wraps pages in the main landmark without site chrome", async () => {
    const {
      default: Layout,
      metadata,
      viewport,
    } = await import("~/app/layout");

    render(
      <Layout>
        <p>Page content</p>
      </Layout>,
    );

    expect(screen.getByRole("main")).toHaveTextContent("Page content");
    // The landing page brings its own navigation; the glass chrome only
    // appears on the 404 page.
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByText("Analytics choices")).not.toBeInTheDocument();
    expect(metadata.metadataBase).toEqual(new URL("https://www.khanhduy.com"));
    expect(metadata.title).toBe("Khanh Duy – Indie Mac & iPhone App Developer");
    expect(metadata.description).toBe(
      "I'm Khanh Duy, an indie developer in Ho Chi Minh City making small, calm apps for Mac, iPhone, Apple Watch and Discord, like LofiHood, WakeArc and Voxy.",
    );
    expect(viewport.themeColor).toBe("#1d2430");
  });
});
