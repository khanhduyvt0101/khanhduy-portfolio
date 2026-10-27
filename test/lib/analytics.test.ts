import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountAnalytics } from "../../lib/analytics";

const config = {
  id: "G-TESTONLY123",
  host: "www.khanhduy.com",
  titles: { "/": "Khanh Duy", "/privacy": "Privacy" },
  actions: {},
};
function fixture(choice: string | null = null) {
  let stored = choice;
  const navigator: { doNotTrack?: string; globalPrivacyControl?: boolean } = {};
  const win = {
    document,
    location: new URL("https://www.khanhduy.com/?email=SECRET#SECRET"),
    navigator,
    localStorage: {
      getItem: vi.fn(() => stored),
      setItem: vi.fn((_key: string, value: string) => {
        stored = value;
      }),
    },
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
  };
  return {
    win: win as unknown as Window,
    navigator,
    storage: win.localStorage,
  };
}
function mockCollector(
  frame: HTMLIFrameElement,
  gtag: ReturnType<typeof vi.fn>,
) {
  const doc = frame.contentDocument as Document;
  doc.write("<!doctype html><html><head></head><body></body></html>");
  const create = doc.createElement.bind(doc);
  vi.spyOn(doc, "createElement").mockImplementation((tag) => {
    const element = create(tag);
    if (tag === "script") element.setAttribute("type", "application/json");
    return element;
  });
  Object.assign(frame.contentWindow as Window, { gtag });
}
const preventNavigation = (event: Event) => event.preventDefault();
beforeEach(() => document.addEventListener("click", preventNavigation));
afterEach(() => {
  document.removeEventListener("click", preventNavigation);
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

it("keeps failed revoke persistence denied across focus, route sync and CTA until a successful explicit regrant", () => {
  const { win, storage } = fixture("granted");
  const action = {
    href: "https://lofihood.com",
    name: "select_content",
    params: { item_id: "lofihood" },
  };
  const control = mountAnalytics(win, {
    ...config,
    actions: { lofihood: action },
  });
  expect(document.querySelector("iframe")).not.toBeNull();
  storage.setItem.mockImplementation(() => {
    throw new DOMException("Storage quota denied", "QuotaExceededError");
  });
  control.choose("denied");
  expect(control.enabled()).toBe(false);
  expect(document.querySelector("iframe")).toBeNull();
  window.dispatchEvent(new Event("focus"));
  document.dispatchEvent(new Event("visibilitychange"));
  control.sync();
  document.body.insertAdjacentHTML(
    "beforeend",
    '<a href="https://lofihood.com" data-analytics-cta="lofihood">Product</a>',
  );
  document.querySelector("a")?.click();
  expect(document.querySelector("iframe")).toBeNull();
  control.choose("granted");
  expect(control.enabled()).toBe(false);
  storage.setItem.mockImplementation(() => {});
  control.choose("granted");
  expect(control.enabled()).toBe(true);
  expect(document.querySelector("iframe")).not.toBeNull();
  control.destroy();
});

it("disables the collector before removal so queued events cannot flush on withdrawal", () => {
  const { win } = fixture("granted");
  const control = mountAnalytics(win, config);
  const frame = document.querySelector("iframe") as HTMLIFrameElement;
  const runtime = frame.contentWindow as Window & {
    dataLayer: unknown[];
    [key: `ga-disable-${string}`]: boolean;
  };
  runtime.dataLayer = [["event", "page_view"]];
  const collectorDocument = frame.contentDocument as Document;
  const open = vi.spyOn(collectorDocument, "open");
  const remove = frame.remove.bind(frame);
  vi.spyOn(frame, "remove").mockImplementation(() => {
    expect(runtime[`ga-disable-${config.id}`]).toBe(true);
    expect(runtime.dataLayer).toHaveLength(0);
    expect(open).toHaveBeenCalledTimes(1);
    expect(
      collectorDocument
        .querySelector('meta[http-equiv="Content-Security-Policy"]')
        ?.getAttribute("content"),
    ).toBe("default-src 'none'");
    remove();
  });
  control.choose("denied");
  expect(document.querySelector("iframe")).toBeNull();
  control.destroy();
});

it("enables analytics by default without recording visitor consent, respects privacy signals, and honors saved denial", () => {
  const { win, navigator, storage } = fixture();
  const control = mountAnalytics(win, config);
  expect(document.querySelector("iframe")).not.toBeNull();
  expect(document.cookie).toBe("");
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(storage.getItem()).toBeNull();
  control.choose("denied");
  expect(document.querySelector("iframe")).toBeNull();
  navigator.doNotTrack = "1";
  control.choose("granted");
  expect(document.querySelector("iframe")).toBeNull();
  navigator.doNotTrack = "yes";
  control.sync();
  expect(document.querySelector("iframe")).toBeNull();
  navigator.doNotTrack = "0";
  navigator.globalPrivacyControl = true;
  control.sync();
  expect(document.querySelector("iframe")).toBeNull();
  navigator.globalPrivacyControl = false;
  control.sync();
  expect(document.querySelector("iframe")).not.toBeNull();
  control.destroy();
  expect(document.querySelector("iframe")).toBeNull();
});

it("sends one sanitized view per public pathname in a disposable no-referrer frame", () => {
  const { win } = fixture("granted");
  const control = mountAnalytics(win, config);
  const frame = document.querySelector("iframe") as HTMLIFrameElement;
  expect(frame.referrerPolicy).toBe("no-referrer");
  expect(frame.getAttribute("src")).toBe("/analytics-frame.html");
  const gtag = vi.fn();
  mockCollector(frame, gtag);
  frame.dispatchEvent(new Event("load"));
  const bootstrap = frame.contentDocument?.querySelector("script")?.textContent;
  expect(bootstrap).toContain("send_page_view: false");
  expect(bootstrap).toContain('ad_storage: "denied"');
  expect(bootstrap).toContain("allow_google_signals: false");
  expect(bootstrap).not.toContain("SECRET");
  control.sync();
  expect(gtag).toHaveBeenCalledExactlyOnceWith("event", "page_view", {
    send_to: config.id,
    page_location: "https://www.khanhduy.com/",
    page_path: "/",
    page_title: "Khanh Duy",
    page_referrer: "",
  });
  win.location.hash = "#another-secret";
  win.location.search = "?token=another-secret";
  control.sync();
  expect(gtag).toHaveBeenCalledTimes(1);
  win.location.pathname = "/privacy";
  control.sync();
  expect(gtag).toHaveBeenCalledTimes(2);
  expect(gtag.mock.calls[1][2]).toEqual({
    send_to: config.id,
    page_location: "https://www.khanhduy.com/privacy",
    page_path: "/privacy",
    page_title: "Privacy",
    page_referrer: "",
  });
  win.location.pathname = "/";
  control.sync();
  expect(gtag).toHaveBeenCalledTimes(3);
  win.location.pathname = "/admin/SECRET";
  control.sync();
  expect(frame.isConnected).toBe(false);
  frame.dispatchEvent(new Event("load"));
  expect(gtag).toHaveBeenCalledTimes(3);
  control.destroy();
});

it("fails closed when storage is denied and expires only analytics cookies on revoke", () => {
  const { win, storage } = fixture("granted");
  storage.getItem.mockImplementationOnce(() => {
    throw Error("blocked");
  });
  const control = mountAnalytics(win, config);
  expect(document.querySelector("iframe")).toBeNull();
  storage.setItem.mockImplementationOnce(() => {
    throw Error("blocked");
  });
  control.choose("granted");
  expect(document.querySelector("iframe")).toBeNull();
  // biome-ignore lint/suspicious/noDocumentCookie: exercise real browser-compatible revocation cookies.
  document.cookie = "public_analytics_ga=identifier; path=/";
  // biome-ignore lint/suspicious/noDocumentCookie: exercise real browser-compatible revocation cookies.
  document.cookie = "theme=dark; path=/";
  control.choose("denied");
  expect(document.cookie).toBe("theme=dark");
  // biome-ignore lint/suspicious/noDocumentCookie: exercise real browser-compatible revocation cookies.
  document.cookie = "theme=; Max-Age=0; path=/";
  control.destroy();
});

it("owns curated CTA clicks once, ignores unknown metadata and gates every event sink", () => {
  const { win, navigator } = fixture("granted");
  const control = mountAnalytics(win, {
    ...config,
    actions: {
      product: {
        href: "https://lofihood.com",
        name: "select_content",
        params: {
          item_id: "lofihood",
          content_type: "owner_product",
          link_placement: "footer",
        },
      },
    },
  });
  const frame = document.querySelector("iframe") as HTMLIFrameElement;
  const gtag = vi.fn();
  mockCollector(frame, gtag);
  frame.dispatchEvent(new Event("load"));
  document.body.insertAdjacentHTML(
    "beforeend",
    '<a href="https://lofihood.com" data-analytics-cta="product" data-analytics-secret="SECRET"><span>SECRET</span></a><a href="https://evil.test/SECRET" data-analytics-cta="unknown">Unknown</a>',
  );
  const link = document.querySelector("a") as HTMLAnchorElement;
  document.addEventListener("click", (e) => e.preventDefault(), { once: true });
  (link.querySelector("span") as HTMLSpanElement).click();
  expect(gtag).toHaveBeenCalledTimes(2);
  expect(gtag.mock.calls[1]).toEqual([
    "event",
    "select_content",
    {
      send_to: config.id,
      page_location: "https://www.khanhduy.com/",
      page_path: "/",
      page_title: "Khanh Duy",
      page_referrer: "",
      item_id: "lofihood",
      content_type: "owner_product",
      link_placement: "footer",
    },
  ]);
  document.dispatchEvent(new Event("click"));
  document
    .querySelectorAll("a")[1]
    .dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  link.href = "https://evil.test/SECRET";
  link.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  expect(gtag).toHaveBeenCalledTimes(2);
  link.href = "https://lofihood.com";
  navigator.globalPrivacyControl = true;
  link.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  expect(gtag).toHaveBeenCalledTimes(2);
  expect(frame.isConnected).toBe(false);
  navigator.globalPrivacyControl = false;
  control.sync();
  const nextFrame = document.querySelector("iframe") as HTMLIFrameElement;
  mockCollector(nextFrame, gtag);
  nextFrame.dispatchEvent(new Event("load"));
  win.location.pathname = "/admin";
  link.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  expect(nextFrame.isConnected).toBe(false);
  expect(gtag).toHaveBeenCalledTimes(3);
  control.destroy();
  link.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  expect(gtag).toHaveBeenCalledTimes(3);
});

it("honors cross-tab revocation immediately and rechecks permission before delayed tag initialization", () => {
  const { win, storage } = fixture("granted");
  const control = mountAnalytics(win, config);
  const frame = document.querySelector("iframe") as HTMLIFrameElement;
  storage.setItem("website-analytics-v1", "denied");
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "website-analytics-v1",
      newValue: "denied",
    }),
  );
  expect(frame.isConnected).toBe(false);
  frame.dispatchEvent(new Event("load"));
  expect(document.querySelector("iframe")).toBeNull();
  control.choose("granted");
  const pending = document.querySelector("iframe") as HTMLIFrameElement;
  win.location.pathname = "/private";
  pending.dispatchEvent(new Event("load"));
  expect(pending.contentDocument?.querySelector("script")).toBeNull();
  window.dispatchEvent(new Event("focus"));
  expect(pending.isConnected).toBe(false);
  document.dispatchEvent(new Event("visibilitychange"));
  control.destroy();
});

// First tracer bullet: the collector must exist and fail closed at every boundary.
describe("privacy analytics boundary", () => {
  it("creates no Google frame without a valid ID, exact HTTPS host and public path", async () => {
    const modulePath = "../../lib/analytics";
    const api = await import(/* @vite-ignore */ modulePath).catch(() => null);
    expect(api, "privacy-safe analytics is not implemented").not.toBeNull();
    if (!api) return;
    for (const [url, id] of [
      ["https://www.khanhduy.com/", ""],
      ["https://www.khanhduy.com/", "G-bad"],
      ["https://preview.khanhduy-portfolio.pages.dev/", "G-TESTONLY123"],
      ["https://khanhduy.com/", "G-TESTONLY123"],
      ["http://www.khanhduy.com/", "G-TESTONLY123"],
      ["https://www.khanhduy.com:444/", "G-TESTONLY123"],
      ["https://www.khanhduy.com/admin", "G-TESTONLY123"],
    ]) {
      const host = new URL(url);
      const doc = document.implementation.createHTMLDocument();
      const localStorage = { getItem: () => "granted", setItem: () => {} };
      const win = {
        location: host,
        document: doc,
        navigator: {},
        localStorage,
        addEventListener: window.addEventListener.bind(window),
        removeEventListener: window.removeEventListener.bind(window),
      } as unknown as Window;
      const control = api.mountAnalytics(win, {
        id,
        host: "www.khanhduy.com",
        titles: { "/": "Khanh Duy" },
        actions: {},
      });
      expect(doc.querySelector("iframe")).toBeNull();
      control.destroy();
    }
  });
});
