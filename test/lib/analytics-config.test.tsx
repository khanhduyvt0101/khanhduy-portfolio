import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import Page from "~/app/page";
import { SiteFooter } from "~/components/site-footer";
import { TooltipProvider } from "~/components/ui/tooltip";
import { portfolioAnalytics } from "~/lib/analytics-config";
import { appLinks } from "~/lib/profile";

it("does not substitute production analytics when the injected ID is absent", async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", undefined);
  expect((await import("~/lib/analytics-config")).portfolioAnalytics.id).toBe(
    "",
  );
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
  expect((await import("~/lib/analytics-config")).portfolioAnalytics.id).toBe(
    "",
  );
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("maps every approved product/contact placement to fixed audited metadata with corrected migrated URLs", () => {
  expect(appLinks.find((p) => p.label === "PhotoDay Cleaner")?.href).toBe(
    "https://photoday-cleaner.pages.dev",
  );
  expect(appLinks.find((p) => p.label === "MoveHalo")?.href).toBe(
    "https://movehalo.pages.dev",
  );
  const { container } = render(
    <TooltipProvider>
      <Page />
      <SiteFooter />
    </TooltipProvider>,
  );
  const links = [...container.querySelectorAll("a[data-analytics-cta]")];
  expect(links).toHaveLength(22);
  expect(Object.keys(portfolioAnalytics.actions)).toHaveLength(22);
  for (const link of links) {
    const key = link.getAttribute("data-analytics-cta") as string;
    const action = portfolioAnalytics.actions[key];
    expect(action).toBeDefined();
    expect(action.href).toBe(link.getAttribute("href"));
    expect(["select_content", "contact_click"]).toContain(action.name);
    expect(JSON.stringify(action.params)).not.toMatch(/https:|mailto:|@/);
  }
  expect(portfolioAnalytics.host).toBe("www.khanhduy.com");
  expect(portfolioAnalytics.titles).toEqual({ "/": "Khanh Duy" });
});

it("uses only a local development origin when no site origin is injected", async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
  expect((await import("~/lib/analytics-config")).portfolioAnalytics.host).toBe(
    "localhost",
  );
  expect((await import("~/lib/seo")).siteUrl).toBe("http://localhost:3000");
  vi.unstubAllEnvs();
  vi.resetModules();
});
