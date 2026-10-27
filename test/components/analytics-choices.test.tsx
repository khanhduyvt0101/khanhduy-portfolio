import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnalyticsChoices } from "~/components/analytics-choices";
import { portfolioAnalytics } from "~/lib/analytics-config";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
afterEach(() => {
  localStorage.clear();
  history.replaceState({}, "", "/");
  route.pathname = "/";
});
it("starts analytics without choices UI or a fabricated consent grant and follows route changes", () => {
  const { container, rerender, unmount } = render(
    <AnalyticsChoices config={portfolioAnalytics} />,
  );
  expect(container).toBeEmptyDOMElement();
  expect(screen.queryByText("Analytics choices")).not.toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(localStorage.getItem("website-analytics-v1")).toBeNull();
  expect(document.querySelector("iframe")).not.toBeNull();
  history.replaceState({}, "", "/admin?secret=SECRET");
  route.pathname = "/admin";
  rerender(<AnalyticsChoices config={portfolioAnalytics} />);
  expect(document.querySelector("iframe")).toBeNull();
  history.replaceState({}, "", "/");
  route.pathname = "/";
  rerender(<AnalyticsChoices config={portfolioAnalytics} />);
  expect(document.querySelector("iframe")).not.toBeNull();
  unmount();
  expect(document.querySelector("iframe")).toBeNull();
});

it("preserves an existing visitor opt-out without displaying choices", () => {
  localStorage.setItem("website-analytics-v1", "denied");
  const { container, unmount } = render(
    <AnalyticsChoices config={portfolioAnalytics} />,
  );
  expect(container).toBeEmptyDOMElement();
  expect(document.querySelector("iframe")).toBeNull();
  expect(localStorage.getItem("website-analytics-v1")).toBe("denied");
  unmount();
});

it("waits for the page load and an idle moment before starting analytics", () => {
  const callbacks: (() => void)[] = [];
  const cancel = vi.fn();
  vi.stubGlobal(
    "requestIdleCallback",
    vi.fn((callback: () => void) => {
      callbacks.push(callback);
      return callbacks.length;
    }),
  );
  vi.stubGlobal("cancelIdleCallback", cancel);
  const readyState = vi
    .spyOn(document, "readyState", "get")
    .mockReturnValue("loading");

  const first = render(<AnalyticsChoices config={portfolioAnalytics} />);
  expect(document.querySelector("iframe")).toBeNull();
  window.dispatchEvent(new Event("load"));
  expect(callbacks).toHaveLength(1);
  callbacks[0]?.();
  expect(document.querySelector("iframe")).not.toBeNull();
  first.unmount();
  expect(cancel).toHaveBeenCalledWith(1);

  readyState.mockReturnValue("complete");
  const second = render(<AnalyticsChoices config={portfolioAnalytics} />);
  expect(callbacks).toHaveLength(2);
  second.unmount();
  expect(document.querySelector("iframe")).toBeNull();

  readyState.mockRestore();
  vi.unstubAllGlobals();
});
