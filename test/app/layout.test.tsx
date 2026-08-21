import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const analytics = vi.fn(() => <div data-testid="analytics" />);
const speedInsights = vi.fn(() => <div data-testid="speed-insights" />);

vi.mock("@vercel/analytics/next", () => ({ Analytics: analytics }));
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: speedInsights,
}));
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
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("renders the header, content, footer, and production telemetry", async () => {
    vi.stubEnv("VERCEL", "1");
    const { default: Layout, metadata } = await import("~/app/layout");

    render(
      <Layout>
        <p>Page content</p>
      </Layout>,
    );

    expect(
      screen.getByRole("link", { name: "Khanh Duy home" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("navigation", { name: "Product showcases" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Owner products" }),
    ).toHaveAttribute("href", "/#owner-products");
    expect(
      screen.getByRole("link", { name: "Developer products" }),
    ).toHaveAttribute("href", "/#developer-products");
    expect(screen.getByText("Page content")).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Apps" })).toBeVisible();
    expect(screen.getByRole("link", { name: "LofiHood" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Email" })).not.toHaveAttribute(
      "target",
    );
    expect(screen.getByTestId("analytics")).toBeVisible();
    expect(screen.getByTestId("speed-insights")).toBeVisible();
    expect(analytics).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "production" }),
      undefined,
    );
    expect(metadata.metadataBase).toEqual(new URL("https://www.khanhduy.com"));
    expect(metadata.title).toBe("Khanh Duy");
    expect(metadata.description).toBe(
      "I'm an indie hacker in Ho Chi Minh City building thoughtful macOS and iOS apps that solve everyday problems with focused, practical experiences.",
    );
  });

  it("omits production telemetry outside Vercel", async () => {
    vi.stubEnv("VERCEL", "0");
    const { default: Layout } = await import("~/app/layout");

    render(<Layout>Local content</Layout>);

    expect(screen.queryByTestId("analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("speed-insights")).not.toBeInTheDocument();
  });
});
