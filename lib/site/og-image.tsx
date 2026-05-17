import { ImageResponse } from "next/og";

export const ogImageSize = {
  width: 1200,
  height: 630,
};

export const ogImageContentType = "image/png";

type OgImageOptions = {
  title: string;
  eyebrow: string;
  description: string;
  kind: string;
};

const dotPatternRows = Array.from({ length: 8 }, (_, rowIndex) => {
  return `og-dot-row-${rowIndex}`;
});

const dotPatternColumns = Array.from({ length: 18 }, (_, columnIndex) => {
  return `og-dot-column-${columnIndex}`;
});

export function createOgImage({
  title,
  eyebrow,
  description,
  kind,
}: OgImageOptions) {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#08090D",
        color: "#F8FAFC",
        display: "flex",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        height: "100%",
        justifyContent: "center",
        padding: 40,
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#0E1117",
          border: "2px solid #262B36",
          borderRadius: 40,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          padding: "44px 48px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#0D9488",
            borderRadius: "999px",
            bottom: -170,
            display: "flex",
            height: 360,
            opacity: 0.22,
            position: "absolute",
            right: -90,
            transform: "rotate(-8deg)",
            width: 760,
          }}
        />
        <div
          style={{
            background: "#38BDF8",
            borderRadius: "999px",
            bottom: -210,
            display: "flex",
            height: 360,
            opacity: 0.18,
            position: "absolute",
            right: 160,
            transform: "rotate(-8deg)",
            width: 620,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 32 }}>
            <div
              style={{
                alignItems: "center",
                background: "#111827",
                border: "2px solid #2DD4BF",
                borderRadius: 32,
                display: "flex",
                fontSize: 52,
                fontWeight: 900,
                height: 134,
                justifyContent: "center",
                letterSpacing: 0,
                width: 134,
              }}
            >
              KD
            </div>
            <div
              style={{
                alignItems: "center",
                background: "#172033",
                border: "1px solid #293449",
                borderRadius: 999,
                color: "#A7F3D0",
                display: "flex",
                fontSize: 24,
                fontWeight: 700,
                height: 52,
                padding: "0 28px",
              }}
            >
              {eyebrow}
            </div>
          </div>

          <DotPattern />
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 820,
            position: "relative",
          }}
        >
          <div
            style={{
              color: "#F8FAFC",
              display: "flex",
              fontSize: title.length > 24 ? 72 : 88,
              fontWeight: 900,
              letterSpacing: 0,
              lineHeight: 1.04,
              marginBottom: 34,
              whiteSpace: "pre-wrap",
            }}
          >
            {wrapOgTitle(title)}
          </div>
          <div
            style={{
              color: "#AAB4C2",
              display: "flex",
              fontSize: 32,
              fontWeight: 500,
              lineHeight: 1.28,
              whiteSpace: "pre-wrap",
            }}
          >
            {wrapOgDescription(description)}
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            color: "#CBD5E1",
            display: "flex",
            fontSize: 25,
            fontWeight: 700,
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div>{kind}</div>
          <div style={{ color: "#64748B" }}>khanhduy.com</div>
        </div>
      </div>
    </div>,
    ogImageSize,
  );
}

function DotPattern() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity: 0.22,
        paddingTop: 8,
      }}
    >
      {dotPatternRows.map((rowKey) => (
        <div
          key={rowKey}
          style={{
            display: "flex",
            gap: 14,
          }}
        >
          {dotPatternColumns.map((columnKey) => (
            <div
              key={`${rowKey}-${columnKey}`}
              style={{
                background: "#F8FAFC",
                borderRadius: 999,
                display: "flex",
                height: 4,
                width: 4,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function wrapOgTitle(title: string) {
  return wrapText(title, 22, 2).join("\n");
}

function wrapOgDescription(description: string) {
  return wrapText(description, 52, 2).join("\n");
}

function wrapText(text: string, maxLength: number, maxLines: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}
