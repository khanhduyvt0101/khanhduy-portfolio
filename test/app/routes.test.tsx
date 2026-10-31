import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "~/app/error";
import { GET } from "~/app/llms.txt/route";
import NotFound from "~/app/not-found";
import Page, { metadata as pageMetadata } from "~/app/page";
import robots from "~/app/robots";
import sitemap from "~/app/sitemap";

vi.mock("next/dynamic", () => ({ default: () => () => null }));

function renderPage() {
  return render(<Page />);
}

function jsonLd(container: HTMLElement): string {
  return (
    container.querySelector('script[type="application/ld+json"]')
      ?.textContent ?? ""
  );
}

describe("application routes", () => {
  it("renders the home page copy as crawlable HTML with structured data", () => {
    const { container } = renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Khanh Duy" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "Three Mac apps",
      "Five pocket apps",
      "Spoken out loud",
      "I help build",
      "Let's talk",
    ]);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      "LofiHood",
      "CafeSignal",
      "Clawdrobe",
      "SpotterFuel",
      "CampusCue",
      "WakeArc",
      "PhotoDay Cleaner",
      "MoveHalo",
      "Voxy",
      "Heartongue",
      "ChatAcademia",
      "PDF Vector",
      "Orchestero",
    ]);
    for (const id of [
      "hero",
      "macos-apps",
      "ios-apps",
      "owner-products",
      "developer-products",
      "contact",
    ]) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(container.querySelectorAll("a[data-analytics-cta]")).toHaveLength(
      15,
    );
    expect(screen.getByRole("link", { name: /voxybot\.app/ })).toHaveAttribute(
      "href",
      "https://voxybot.app",
    );
    expect(
      screen.getByRole("link", { name: /heartongue\.com/ }),
    ).toHaveAttribute("href", "https://heartongue.com");
    expect(
      screen.getByRole("link", { name: /clawdrobe\.com/ }),
    ).toHaveAttribute("href", "https://clawdrobe.com");
    expect(
      screen.getByRole("link", { name: /chatacademia\.com/ }),
    ).toHaveAttribute("rel", "noopener");
    // Without JavaScript the loader steps aside and the copy stays readable.
    expect(renderToStaticMarkup(<Page />)).toContain(
      "<noscript><style>.room-loader{display:none}",
    );

    const data = jsonLd(container);
    for (const fragment of [
      '"@type":"ProfilePage"',
      '"@type":"Person"',
      '"@type":"WebSite"',
      "Bùi Trọng Khánh Duy",
      "PhotoDay Cleaner",
      "https://voxybot.app",
      "https://heartongue.com",
      "https://clawdrobe.com",
      "https://hevy.com/user/khanhduyvt0101",
      '"dateModified":"2026-10-31T00:00:00.000Z"',
    ]) {
      expect(data).toContain(fragment);
    }

    expect(pageMetadata.alternates).toEqual({ canonical: "/" });
    expect(pageMetadata.title).toBe(
      "Khanh Duy – Indie Mac & iPhone App Developer",
    );
    expect(pageMetadata.description).toBe(
      "I'm Khanh Duy, an indie developer in Ho Chi Minh City making small, calm apps for Mac, iPhone, Apple Watch and Discord, like LofiHood, WakeArc and Voxy.",
    );
    expect(String(pageMetadata.description).length).toBeLessThanOrEqual(160);
  });

  it("links every profile and the email address", () => {
    renderPage();

    expect(
      screen.getByRole("link", { name: "khanhduyvt0101@gmail.com" }),
    ).toHaveAttribute("href", "mailto:khanhduyvt0101@gmail.com");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "rel",
      "me noopener",
    );
    expect(screen.getByRole("link", { name: "Strava" })).toHaveAttribute(
      "href",
      "https://strava.app.link/cPWy22txK5b",
    );
    expect(screen.getByRole("link", { name: "Hevy" })).toHaveAttribute(
      "href",
      "https://hevy.com/user/khanhduyvt0101",
    );
  });

  it("serves a plain-text llms.txt summary", async () => {
    const response = GET();
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    const text = await response.text();
    expect(text).toMatch(/^# Khanh Duy\n/);
    expect(text).toContain("- [Voxy](https://voxybot.app) (Discord)");
    expect(text).toContain("- [Heartongue](https://heartongue.com) (Web)");
    expect(text).toContain("- [PDF Vector](https://pdfvector.com)");
    expect(text).toContain("- Email: khanhduyvt0101@gmail.com");
  });

  it("runs the error reset action", () => {
    const reset = vi.fn();
    render(<ErrorBoundary reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: "Reload page" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the not-found page with the site header and footer", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "404" })).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "Product showcases" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "LofiHood" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("publishes crawler and sitemap metadata", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://www.khanhduy.com/sitemap.xml",
      host: "https://www.khanhduy.com",
    });
    expect(sitemap()).toEqual([
      {
        url: "https://www.khanhduy.com",
        lastModified: new Date("2026-10-31T00:00:00.000Z"),
        changeFrequency: "monthly",
        priority: 1,
        images: ["https://www.khanhduy.com/avatar.webp"],
      },
    ]);
  });
});
