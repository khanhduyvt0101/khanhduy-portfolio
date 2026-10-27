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

    expect(alt).toBe(
      "Khanh Duy's 3D desk at night, with his Mac and iPhone apps",
    );
    expect(contentType).toBe("image/png");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(twitterAlt).toBe(alt);
    expect(twitterContentType).toBe(contentType);
    expect(twitterSize).toBe(size);
    expect(imageResponseMock).toHaveBeenCalledTimes(2);
  });

  it("renders the copy over the embedded room backdrop", () => {
    createOgImage({
      title: "Khanh Duy",
      description: "Focused software",
      footer: "Portfolio",
    });

    const { container } = render(capturedImage());
    expect(container).toHaveTextContent("Khanh Duy");
    expect(container).toHaveTextContent("Focused software");
    expect(container).toHaveTextContent("Portfolio");
    expect(container.querySelector("img")?.getAttribute("src")).toMatch(
      /^data:image\/jpeg;base64,/,
    );
    expect(imageResponseMock).toHaveBeenCalledWith(
      expect.anything(),
      ogImageSize,
    );
    expect(ogImageContentType).toBe("image/png");
  });
});
