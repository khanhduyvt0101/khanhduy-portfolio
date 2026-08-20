import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "~/app/error";
import NotFound from "~/app/not-found";
import Page, { metadata as pageMetadata } from "~/app/page";
import robots from "~/app/robots";
import sitemap from "~/app/sitemap";
import { TooltipProvider } from "~/components/ui/tooltip";

function renderPage() {
  return render(
    <TooltipProvider>
      <Page />
    </TooltipProvider>,
  );
}

describe("application routes", () => {
  it("renders the home page and its structured data", () => {
    const { container } = renderPage();

    expect(screen.getByRole("heading", { name: "Khanh Duy" })).toBeVisible();
    expect(screen.getByText("KD")).toBeVisible();
    expect(
      container.querySelector('script[type="application/ld+json"]'),
    ).toHaveTextContent('"@type":"Person"');
    expect(pageMetadata.alternates).toEqual({ canonical: "/" });
    expect(pageMetadata.title).toBe("Khanh Duy");
    expect(pageMetadata.description).toBe(
      "I'm an indie hacker in Ho Chi Minh City building thoughtful macOS and iOS apps that solve everyday problems with focused, practical experiences.",
    );
  });

  it("renders both external and email social links", () => {
    renderPage();

    expect(screen.getByRole("link", { name: "Email" })).not.toHaveAttribute(
      "target",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "target",
      "_blank",
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

  it("renders the not-found recovery link", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "404" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("publishes crawler and sitemap metadata", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://www.khanhduy.com/sitemap.xml",
    });
    expect(sitemap()).toEqual([
      {
        url: "https://www.khanhduy.com",
        lastModified: new Date("2026-08-20T00:00:00.000Z"),
        changeFrequency: "monthly",
        priority: 1,
        images: ["https://www.khanhduy.com/opengraph-image"],
      },
    ]);
  });
});
