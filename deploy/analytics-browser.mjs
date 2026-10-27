// Offline production-artifact QA with the REAL downloaded gtag runtime.
// Every browser request is intercepted; only local export files and the supplied
// tag fixture are fulfilled. Collection is captured + fulfilled locally (204).
// No production page or Google collection endpoint is contacted by this script.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";

const pendingEnhanced = process.env.ALLOW_PENDING_ENHANCED_MEASUREMENT === "1";
const campus = process.argv[2] === "campuscue";
const host = new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname;
const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
assert.match(id ?? "", /^G-[A-Z0-9]+$/, "Inject NEXT_PUBLIC_GA_MEASUREMENT_ID");
const origin = `https://${host}`;
const out = path.resolve(campus ? "packages/website/out" : "out");
// Apply actual exported path-based _headers too; otherwise a DOM-only fixture
// could miss X-Frame-Options/CSP blocking the collector after deployment.
const headerRules = [];
let headerRule;
for (const line of (await readFile(path.join(out, "_headers"), "utf8")).split(
  "\n",
)) {
  if (!line.trim() || line.startsWith("#")) continue;
  if (!line.startsWith(" ")) {
    headerRule = { path: line, headers: [] };
    headerRules.push(headerRule);
  } else {
    const [name, ...value] = line.trim().split(":");
    headerRule.headers.push({ name, value: value.join(":").trim() });
  }
}
function assetHeaders(pathname, file) {
  const configured = new Map();
  for (const rule of headerRules) {
    if (!rule.path.startsWith("/")) continue;
    const pattern = rule.path
      .split("*")
      .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*");
    if (!new RegExp(`^${pattern}$`).test(pathname)) continue;
    for (const { name, value } of rule.headers) {
      const key = name.toLowerCase();
      configured.set(
        key,
        configured.has(key) ? `${configured.get(key)}, ${value}` : value,
      );
    }
  }
  return [
    ...new Map([
      ["content-type", mime[path.extname(file)] ?? "application/octet-stream"],
      ...configured,
    ]),
  ].map(([name, value]) => ({ name, value }));
}
assert.ok(
  process.env.GA_TAG_FIXTURE,
  "Set GA_TAG_FIXTURE to an already downloaded real gtag/js response",
);
const tag = await readFile(process.env.GA_TAG_FIXTURE);
assert.ok(tag.length > 100000, "expected real Google runtime, not a stub");
const profile = await mkdtemp(path.join(process.env.TMPDIR, "ga-browser-"));
const chrome = spawn(
  process.env.CHROME_BIN ?? "google-chrome",
  [
    "--headless",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
let socket;
const captured = [];
const requests = [];
const errors = [];
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".json": "application/json",
};
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(
      () => reject(new Error(`Chrome startup: ${output}`)),
      20000,
    );
    chrome.on("error", reject);
    chrome.stderr.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  const targets = await (
    await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json/list`)
  ).json();
  socket = new WebSocket(
    targets.find((t) => t.type === "page").webSocketDebuggerUrl,
  );
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = ++sequence;
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`CDP timeout: ${method}`));
      }, 20000);
      pending.set(requestId, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
  }
  async function intercept({ requestId, request, resourceType }) {
    const url = new URL(request.url);
    requests.push({ url: request.url, resourceType, headers: request.headers });
    if (
      url.hostname === "www.googletagmanager.com" &&
      url.pathname === "/gtag/js"
    ) {
      assert.equal(url.searchParams.get("id"), id);
      await send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        responseHeaders: [
          { name: "Content-Type", value: "application/javascript" },
        ],
        body: tag.toString("base64"),
      });
    } else if (
      /(^|\.)google-analytics\.com$/.test(url.hostname) ||
      url.pathname.endsWith("/collect")
    ) {
      captured.push({
        url: request.url,
        body: request.postData ?? "",
        headers: request.headers,
      });
      await send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 204,
        responseHeaders: [{ name: "Access-Control-Allow-Origin", value: "*" }],
      });
    } else if (
      url.protocol === "https:" &&
      (url.hostname === host ||
        url.hostname.endsWith(".pages.dev") ||
        url.hostname === `www.${host}` ||
        url.hostname === host.replace(/^www\./, ""))
    ) {
      if (process.env.ASSET_BASE_URL) {
        assert.match(process.env.ASSET_BASE_URL, /^http:\/\/127\.0\.0\.1:\d+$/);
        const upstream = await fetch(
          new URL(url.pathname + url.search, process.env.ASSET_BASE_URL),
          { redirect: "manual" },
        );
        const headers = [...upstream.headers].filter(
          ([name]) =>
            ![
              "content-encoding",
              "content-length",
              "transfer-encoding",
            ].includes(name),
        );
        await send("Fetch.fulfillRequest", {
          requestId,
          responseCode: upstream.status,
          responseHeaders: headers.map(([name, value]) => ({ name, value })),
          body: Buffer.from(await upstream.arrayBuffer()).toString("base64"),
        });
        return;
      }
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      assert.ok(!relative.split("/").includes(".."));
      let file = path.join(out, relative || "index.html");
      let responseCode = 200;
      try {
        if ((await stat(file)).isDirectory())
          file = path.join(file, "index.html");
        await stat(file);
      } catch {
        file = path.join(out, `${relative}.html`);
        try {
          await stat(file);
        } catch {
          file = path.join(out, "404.html");
          responseCode = 404;
        }
      }
      const body = await readFile(file);
      await send("Fetch.fulfillRequest", {
        requestId,
        responseCode,
        responseHeaders: assetHeaders(url.pathname, file),
        body: body.toString("base64"),
      });
    } else {
      // Includes telemetry relays, ads, external navigation and unexpected scripts.
      await send("Fetch.failRequest", {
        requestId,
        errorReason: "BlockedByClient",
      });
    }
  }
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const item = pending.get(message.id);
      if (!item) return;
      clearTimeout(item.timer);
      pending.delete(message.id);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
    }
    if (message.method === "Fetch.requestPaused")
      intercept(message.params).catch((error) => errors.push(String(error)));
    if (message.method === "Runtime.exceptionThrown")
      errors.push(message.params.exceptionDetails);
  });
  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function wait(expression) {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(
      `Timed out: ${expression}\nCaptured: ${JSON.stringify(captured)}`,
    );
  }
  async function waitCollected(predicate) {
    const deadline = Date.now() + 16000;
    while (Date.now() < deadline) {
      if (predicate()) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(
      "Collection timeout: " +
        JSON.stringify({
          events: events(),
          queue: await evaluate(
            "document.querySelector('iframe')?.contentWindow?.dataLayer?.map(x => x.length ? Array.from(x) : x)",
          ),
        }),
    );
  }
  const settle = () => new Promise((r) => setTimeout(r, 1400));
  function events() {
    return captured
      .flatMap((request) => {
        const base = new URL(request.url).searchParams;
        return (request.body ? request.body.split("\n") : [""]).map((line) =>
          Object.fromEntries([...base, ...new URLSearchParams(line)]),
        );
      })
      .filter((event) => event.en);
  }
  function assertSanitized() {
    for (const request of captured) {
      assert.ok(
        !decodeURIComponent(request.url + request.body).includes("SECRET"),
        "raw sentinel leaked into actual collection request",
      );
      assert.ok(
        !JSON.stringify(request.headers).includes("SECRET"),
        "raw URL leaked through HTTP Referer",
      );
    }
    for (const event of events()) {
      assert.equal(event.tid, id);
      assert.ok(
        [
          "page_view",
          "select_content",
          "contact_click",
          "app_store_click",
          "support_click",
          "user_engagement",
          "session_start",
          "first_visit",
          ...(pendingEnhanced ? ["scroll"] : []),
        ].includes(event.en),
        `unexpected automatic event: ${event.en}`,
      );
      assert.ok(
        ["/", ...(campus ? ["/privacy", "/terms", "/support"] : [])].some(
          (route) => event.dl === origin + route,
        ),
        `bad page_location: ${event.dl}`,
      );
      assert.ok(!event.dr, `unexpected referrer: ${event.dr}`);
      assert.ok(!JSON.stringify(event).includes("mailto:"));
      assert.ok(!JSON.stringify(event).includes("@gmail"));
    }
  }
  async function navigate(url) {
    await send("Page.navigate", { url });
    await wait(
      `location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && !!document.querySelector('summary')`,
    );
    await settle();
  }
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `document.addEventListener('click', event => { if (event.target.closest?.('a[data-analytics-cta]')) event.preventDefault(); });`,
  });
  await navigate(`${origin}/?token=SECRET#SECRET`);
  assert.equal(
    requests.filter((r) => /google/.test(new URL(r.url).hostname)).length,
    0,
    "Google request before consent",
  );
  assert.equal(
    (await send("Network.getCookies", { urls: [origin] })).cookies.filter((c) =>
      c.name.startsWith("public_analytics_"),
    ).length,
    0,
  );
  await evaluate(
    `document.querySelector('details').open = true; [...document.querySelectorAll('button')].find(b => b.textContent === 'Allow analytics').click()`,
  );
  await wait(
    `!!document.querySelector('iframe')?.contentWindow?.google_tag_manager`,
  );
  await settle();
  assert.equal(
    events().filter((e) => e.en === "page_view").length,
    1,
    "one initial view: " +
      JSON.stringify({
        requests: requests.filter((r) => /google/.test(r.url)),
        captured,
        errors,
        frame: await evaluate(
          `({ location: document.querySelector('iframe').contentWindow.location.href, data: document.querySelector('iframe').contentWindow.dataLayer.map(x => x.length ? Array.from(x) : x), manager: Object.keys(document.querySelector('iframe').contentWindow.google_tag_manager) })`,
        ),
      }),
  );
  assertSanitized();
  const frameInfo = await evaluate(
    `({ url: document.querySelector('iframe').contentWindow.location.href, referrer: document.querySelector('iframe').contentDocument.referrer, title: document.querySelector('iframe').contentDocument.title })`,
  );
  console.log("Collector document", frameInfo);
  let expectedViews = 1;
  // Real Next Link navigation, not a fake route callback.
  if (campus) {
    for (const route of ["/privacy", "/terms", "/support", "/"]) {
      await evaluate(
        `document.querySelector(${JSON.stringify(`a[href=${JSON.stringify(route)}]`)}).click()`,
      );
      await wait(`location.pathname === ${JSON.stringify(route)}`);
      await settle();
      expectedViews++;
      await waitCollected(
        () =>
          events().filter((e) => e.en === "page_view").length >= expectedViews,
      );
      assert.equal(
        events().filter((e) => e.en === "page_view").length,
        expectedViews,
        `one Next Link view: ${route}`,
      );
    }
  }
  await evaluate(
    `history.pushState({}, '', '?another=SECRET#SECRET'); document.title = 'SECRET';`,
  );
  await settle();
  assert.equal(
    events().filter((e) => e.en === "page_view").length,
    expectedViews,
    "no query/hash-only view",
  );
  const tested = new Set();
  for (const route of campus
    ? ["/", "/privacy", "/terms", "/support"]
    : ["/"]) {
    if ((await evaluate("location.pathname")) !== route) {
      await evaluate(
        `document.querySelector(${JSON.stringify(`a[href=${JSON.stringify(route)}]`)}).click()`,
      );
      await wait(`location.pathname === ${JSON.stringify(route)}`);
      await settle();
    }
    const keys = await evaluate(
      `[...document.querySelectorAll('a[data-analytics-cta]')].map(a => a.dataset.analyticsCta)`,
    );
    for (const key of keys) {
      const before = events().filter((e) =>
        [
          "select_content",
          "contact_click",
          "app_store_click",
          "support_click",
        ].includes(e.en),
      ).length;
      await evaluate(
        `document.querySelector(${JSON.stringify(`a[data-analytics-cta=${JSON.stringify(key)}]`)}).click()`,
      );
      await waitCollected(
        () =>
          events().filter((e) =>
            [
              "select_content",
              "contact_click",
              "app_store_click",
              "support_click",
            ].includes(e.en),
          ).length > before,
      );
      const after = events().filter((e) =>
        [
          "select_content",
          "contact_click",
          "app_store_click",
          "support_click",
        ].includes(e.en),
      );
      assert.equal(
        after.length,
        before + 1,
        `one CTA event: ${key}; ${JSON.stringify(after)}`,
      );
      const event = after.at(-1);
      const [placement, item] = key.split(":");
      if (campus) {
        assert.equal(
          event.en,
          placement === "app_store" ? "app_store_click" : "support_click",
        );
        assert.equal(event["ep.link_placement"], item);
      } else {
        assert.equal(event["ep.link_placement"], placement);
        assert.equal(
          event.en,
          ["Email", "LinkedIn"].includes(item)
            ? "contact_click"
            : "select_content",
        );
      }
      const expectedParams = campus
        ? placement === "app_store"
          ? { app_id: "6774021565", link_placement: item }
          : { contact_method: "email", link_placement: item }
        : ["Email", "LinkedIn"].includes(item)
          ? {
              contact_method: item === "Email" ? "email" : "linkedin",
              link_placement: placement,
            }
          : {
              content_type:
                placement === "developer_showcase"
                  ? "developer_project"
                  : "owner_product",
              item_id: item.toLowerCase().replaceAll(" ", "-"),
              link_placement: placement,
            };
      assert.deepEqual(
        Object.fromEntries(
          Object.entries(event)
            .filter(([k]) => k.startsWith("ep."))
            .map(([k, v]) => [k.slice(3), v]),
        ),
        expectedParams,
        `exact CTA schema: ${key}`,
      );
      tested.add(key);
      assertSanitized();
    }
  }
  assert.equal(
    tested.size,
    campus ? 8 : 21,
    "all audited CTA metadata exercised",
  );
  const beforeRevoke = captured.length;
  await evaluate(
    `document.querySelector('details').open = true; [...document.querySelectorAll('button')].find(b => b.textContent === 'Reject / revoke analytics').click()`,
  );
  await settle();
  assert.equal(await evaluate("!!document.querySelector('iframe')"), false);
  assert.equal(
    (await send("Network.getCookies", { urls: [origin] })).cookies.filter((c) =>
      c.name.startsWith("public_analytics_"),
    ).length,
    0,
    "revoked cookies removed",
  );
  assert.equal(
    captured.length,
    beforeRevoke,
    "revocation emits no final telemetry",
  );
  const afterRevoke = captured.length;
  await evaluate(`document.querySelector('a[data-analytics-cta]').click()`);
  await settle();
  assert.equal(captured.length, afterRevoke, "no collection after revocation");
  await navigate(`${origin}/?persisted=SECRET`);
  assert.equal(
    await evaluate("!!document.querySelector('iframe')"),
    false,
    "denial persists",
  );
  // Signals override an existing saved grant at initialization.
  for (const signal of ["doNotTrack", "globalPrivacyControl"]) {
    const script = await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `localStorage.setItem('website-analytics-v1', 'granted'); Object.defineProperty(navigator, '${signal}', {value: ${signal === "doNotTrack" ? "'1'" : "true"}});`,
    });
    const before = requests.filter((r) =>
      /google/.test(new URL(r.url).hostname),
    ).length;
    await navigate(`${origin}/?signal=${signal}`);
    assert.equal(
      await evaluate("!!document.querySelector('iframe')"),
      false,
      signal,
    );
    assert.equal(
      requests.filter((r) => /google/.test(new URL(r.url).hostname)).length,
      before,
      `${signal} no requests`,
    );
    await send("Page.removeScriptToEvaluateOnNewDocument", {
      identifier: script.identifier,
    });
  }
  // Same artifact and consent state cannot activate a preview, alias or unknown route.
  const savedGrant = await send("Page.addScriptToEvaluateOnNewDocument", {
    source: "localStorage.setItem('website-analytics-v1', 'granted');",
  });
  for (const url of [
    `${origin}/admin?private=SECRET`,
    `${origin}/unknown`,
    `https://preview.${campus ? "campuscue" : "khanhduy-portfolio"}.pages.dev/`,
    campus ? "https://www.campuscue.app/" : "https://khanhduy.com/",
  ]) {
    const before = requests.filter((r) =>
      /google/.test(new URL(r.url).hostname),
    ).length;
    await navigate(url);
    assert.equal(
      await evaluate("!!document.querySelector('iframe')"),
      false,
      url,
    );
    assert.equal(
      requests.filter((r) => /google/.test(new URL(r.url).hostname)).length,
      before,
      `${url} no requests`,
    );
  }
  await send("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: savedGrant.identifier,
  });
  assertSanitized();
  assert.deepEqual(errors, []);
  if (pendingEnhanced)
    console.log(
      "REMOTE RELEASE BLOCKER: Enhanced Measurement must be disabled before strict mode passes; observed automatic scroll events:",
      events().filter((e) => e.en === "scroll").length,
    );
  console.log(
    `PASS ${host}: real gtag runtime, all ${tested.size} CTA keys, unique manual views, sanitized ACTUAL outgoing payloads/headers, no preconsent/revoked/signal/preview/private collection. Captured locally: ${captured.length} collection requests; none transmitted.`,
  );
} finally {
  socket?.close();
  chrome.kill("SIGTERM");
  await new Promise((resolve) => {
    if (chrome.exitCode !== null) resolve();
    else chrome.once("exit", resolve);
  });
  await rm(profile, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 200,
  });
}
