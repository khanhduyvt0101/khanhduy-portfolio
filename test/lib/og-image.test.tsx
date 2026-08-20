import { render } from "@testing-library/react";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ApplicationImage, {
  alt,
  contentType,
  size,
} from "~/app/opengraph-image";
import TwitterImage, {
  alt as twitterAlt,
  contentType as twitterContentType,
  size as twitterSize,
} from "~/app/twitter-image";
import { createOgImage, ogImageContentType, ogImageSize } from "~/lib/og-image";

vi.mock("next/og", () => ({ ImageResponse: vi.fn() }));

const imageResponseMock = vi.mocked(ImageResponse);

function capturedImage(): ReactElement {
  return imageResponseMock.mock.calls.at(-1)?.[0] as ReactElement;
}

describe("Open Graph images", () => {
  beforeEach(() => imageResponseMock.mockClear());

  it("exposes the application and Twitter image metadata", () => {
    ApplicationImage();
    TwitterImage();

    expect(alt).toContain("Khanh Duy portfolio");
    expect(contentType).toBe("image/png");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(twitterAlt).toBe(alt);
    expect(twitterContentType).toBe(contentType);
    expect(twitterSize).toBe(size);
    expect(imageResponseMock).toHaveBeenCalledTimes(2);
  });

  it("renders short content and the complete dot pattern", () => {
    createOgImage({
      title: "Khanh Duy",
      eyebrow: "Builder",
      description: "Focused software",
      kind: "Portfolio",
    });

    const { container } = render(capturedImage());
    expect(container).toHaveTextContent("Khanh Duy");
    expect(container).toHaveTextContent("Focused software");
    expect(container.querySelectorAll('[style*="height: 4px"]')).toHaveLength(
      144,
    );
    expect(imageResponseMock).toHaveBeenCalledWith(
      expect.anything(),
      ogImageSize,
    );
    expect(ogImageContentType).toBe("image/png");
  });

  it("wraps and truncates long text", () => {
    createOgImage({
      title: "A deliberately long portfolio title with many words",
      eyebrow: "Product Builder",
      description:
        "This deliberately long description wraps across multiple lines and truncates everything beyond its supported second line for a predictable social card.",
      kind: "Applications",
    });

    const { container } = render(capturedImage());
    expect(container.textContent).toContain(
      "A deliberately long\nportfolio title with",
    );
    expect(container.textContent).not.toContain("predictable social card");
  });

  it("accepts empty title and description content", () => {
    createOgImage({
      title: "",
      eyebrow: "Builder",
      description: "",
      kind: "Empty",
    });

    expect(() => render(capturedImage())).not.toThrow();
  });
});
