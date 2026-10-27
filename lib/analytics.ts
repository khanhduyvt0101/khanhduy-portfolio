export type AnalyticsConfig = {
  id: string;
  host: string;
  titles: Record<string, string>;
  actions: Record<
    string,
    { href: string; name: string; params: Record<string, string> }
  >;
};

type CollectorWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  [key: `ga-disable-${string}`]: boolean;
};

export function mountAnalytics(win: Window, config: AnalyticsConfig) {
  let frame: HTMLIFrameElement | null = null;
  let lastPath: string | null = null;
  let deniedInDocument = false;
  function stop() {
    if (frame) {
      const runtime = frame.contentWindow as CollectorWindow;
      runtime[`ga-disable-${config.id}`] = true;
      if (runtime.dataLayer) runtime.dataLayer.length = 0;
      // Clear SDK unload listeners before disposal; removal alone can flush queues.
      const doc = frame.contentDocument as Document;
      doc.open();
      doc.write("<!doctype html><html><head></head><body></body></html>");
      doc.close();
      const deny = doc.createElement("meta");
      deny.httpEquiv = "Content-Security-Policy";
      deny.content = "default-src 'none'";
      doc.head.append(deny);
      frame.remove();
    }
    frame = null;
    lastPath = null;
    for (const cookie of win.document.cookie.split(";")) {
      const name = cookie.split("=")[0].trim();
      if (name.startsWith("public_analytics_")) {
        win.document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      }
    }
  }
  function allowed() {
    try {
      const nav = win.navigator as Navigator & {
        globalPrivacyControl?: boolean;
      };
      return (
        !deniedInDocument &&
        /^G-[A-Z0-9]{6,20}$/.test(config.id) &&
        win.location.origin === `https://${config.host}` &&
        Object.hasOwn(config.titles, win.location.pathname) &&
        // Automatic analytics is not a saved consent grant. Honor existing opt-outs.
        win.localStorage.getItem("website-analytics-v1") !== "denied" &&
        nav.doNotTrack !== "1" &&
        nav.doNotTrack !== "yes" &&
        !nav.globalPrivacyControl
      );
    } catch {
      return false;
    }
  }
  function metadata() {
    const path = win.location.pathname;
    return {
      send_to: config.id,
      page_location: `https://${config.host}${path}`,
      page_path: path,
      page_title: config.titles[path],
      page_referrer: "",
    };
  }
  function sync() {
    if (!allowed()) {
      stop();
      return;
    }
    if (!frame) {
      const created = win.document.createElement("iframe");
      frame = created;
      created.hidden = true;
      created.title = "Optional website analytics";
      created.referrerPolicy = "no-referrer";
      created.setAttribute("sandbox", "allow-scripts allow-same-origin");
      // A real fixed HTTPS document is required: gtag declines collection from
      // about:srcdoc. This inert page has no marketing-page links/forms/history.
      created.src = "/analytics-frame.html";
      created.onload = () => {
        if (frame !== created || !allowed()) return;
        created.onload = null;
        const doc = created.contentDocument as Document;
        const bootstrap = doc.createElement("script");
        bootstrap.textContent = `
window.dataLayer = [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"});
gtag('js', new Date());
gtag('config', '${config.id}', {send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_domain: 'none', cookie_prefix: 'public_analytics', cookie_expires: 2592000, cookie_flags: 'SameSite=Lax;Secure', ignore_referrer: true, ...${JSON.stringify(metadata()).replaceAll("<", "\\u003c")}});`;
        doc.head.append(bootstrap);
        const loader = doc.createElement("script");
        loader.async = true;
        loader.referrerPolicy = "no-referrer";
        loader.src = `https://www.googletagmanager.com/gtag/js?id=${config.id}`;
        doc.head.append(loader);
        sync();
      };
      win.document.body.append(created);
    }
    const gtag = (frame.contentWindow as CollectorWindow | null)?.gtag;
    if (gtag && lastPath !== win.location.pathname) {
      gtag("event", "page_view", metadata());
      lastPath = win.location.pathname;
    }
  }
  function choose(choice: "granted" | "denied") {
    // A failed write must never resurrect an older readable grant.
    deniedInDocument = true;
    try {
      win.localStorage.setItem("website-analytics-v1", choice);
      deniedInDocument = choice === "denied";
    } catch {
      stop();
      return;
    }
    sync();
  }
  function click(event: Event) {
    const link = (event.target as Element | null)?.closest?.(
      "a[data-analytics-cta]",
    );
    const key = link?.getAttribute("data-analytics-cta");
    if (!key || !Object.hasOwn(config.actions, key)) return;
    const action = config.actions[key];
    if (link?.getAttribute("href") !== action.href) return;
    sync();
    if (!allowed()) return;
    (frame?.contentWindow as CollectorWindow | null)?.gtag?.(
      "event",
      action.name,
      { ...action.params, ...metadata() },
    );
  }
  win.document.addEventListener("click", click);
  win.addEventListener("storage", sync);
  win.addEventListener("focus", sync);
  win.document.addEventListener("visibilitychange", sync);
  sync();
  return {
    sync,
    choose,
    enabled: allowed,
    destroy() {
      win.document.removeEventListener("click", click);
      win.removeEventListener("storage", sync);
      win.removeEventListener("focus", sync);
      win.document.removeEventListener("visibilitychange", sync);
      stop();
    },
  };
}
