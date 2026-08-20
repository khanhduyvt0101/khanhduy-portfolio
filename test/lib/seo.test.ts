import { describe, expect, it } from "vitest";
import { createSeoMetadata, serializeJsonLd } from "~/lib/seo";

describe("createSeoMetadata", () => {
  it("builds root metadata with a custom image label", () => {
    const metadata = createSeoMetadata({
      title: "Title",
      description: "Description",
      path: "/",
      imageAlt: "Custom alt",
    });

    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        url: "/",
        images: [
          expect.objectContaining({
            url: "/opengraph-image",
            alt: "Custom alt",
          }),
        ],
      }),
    );
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        images: [{ url: "/twitter-image", alt: "Custom alt" }],
      }),
    );
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        type: "profile",
        firstName: "Khanh",
        lastName: "Duy",
        username: "khanhduyvt",
      }),
    );
    expect(metadata.twitter).toEqual(
      expect.objectContaining({ creator: "@khanhduyvt" }),
    );
  });

  it("builds nested metadata and falls back to the title for image labels", () => {
    const metadata = createSeoMetadata({
      title: "Nested title",
      description: "Nested description",
      path: "/work",
    });

    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        images: [
          expect.objectContaining({
            url: "/work/opengraph-image",
            alt: "Nested title",
          }),
        ],
      }),
    );
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        images: [{ url: "/work/twitter-image", alt: "Nested title" }],
      }),
    );
  });
});

describe("serializeJsonLd", () => {
  it("escapes tag starts in structured data", () => {
    expect(serializeJsonLd({ value: "</script>" })).toBe(
      '{"value":"\\u003c/script>"}',
    );
  });
});
