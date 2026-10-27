import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogImageSize = {
  width: 1200,
  height: 630,
};

export const ogImageContentType = "image/png";

type OgImageOptions = {
  title: string;
  description: string;
  footer: string;
};

/** The 3D desk from the landing page, rendered once and kept in the repo. */
function roomBackdrop(): string {
  const file = join(process.cwd(), "assets/og/room.jpg");
  return `data:image/jpeg;base64,${readFileSync(file).toString("base64")}`;
}

export function createOgImage({
  title,
  description,
  footer,
}: OgImageOptions): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        background: "#1d2430",
        color: "#F6F1E9",
        display: "flex",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        height: "100%",
        position: "relative",
        width: "100%",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: Satori renders plain img elements only. */}
      <img
        alt=""
        height={630}
        src={roomBackdrop()}
        style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        width={1200}
      />
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(20,24,34,0.94) 0%, rgba(20,24,34,0.78) 38%, rgba(20,24,34,0) 68%)",
          display: "flex",
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 64px",
          position: "relative",
          width: 620,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 0.95,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#D9D3E6",
            fontSize: 32,
            lineHeight: 1.35,
            marginTop: 28,
          }}
        >
          {description}
        </div>
        <div
          style={{
            color: "#FFB86B",
            fontSize: 26,
            fontWeight: 600,
            marginTop: 40,
          }}
        >
          {footer}
        </div>
      </div>
    </div>,
    ogImageSize,
  );
}
