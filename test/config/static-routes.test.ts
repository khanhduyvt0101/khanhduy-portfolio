import { describe, expect, it } from "vitest";
import * as openGraph from "~/app/opengraph-image";
import * as robots from "~/app/robots";
import * as sitemap from "~/app/sitemap";
import * as twitter from "~/app/twitter-image";

describe("exported metadata routes", () => {
  it.each([
    ["Open Graph image", openGraph],
    ["Twitter image", twitter],
    ["robots.txt", robots],
    ["sitemap.xml", sitemap],
  ])("generates %s at build time", (_name, route) => {
    expect(route).toHaveProperty("dynamic", "force-static");
  });
});
