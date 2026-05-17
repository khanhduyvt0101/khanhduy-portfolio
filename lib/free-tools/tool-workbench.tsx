"use client";

import { converter, formatHex, parse } from "culori";
import {
  CopyIcon,
  DownloadIcon,
  RefreshCcwIcon,
  UploadIcon,
} from "lucide-react";
import QR from "qrcode";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Pill } from "~/components/kibo-ui/pill";
import { QRCode as QRCodePreview } from "~/components/kibo-ui/qr-code";
import { Button } from "~/components/ui/button";
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from "~/components/ui/checkbox-group";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";
import {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatValue,
} from "~/components/ui/stat";
import { Status, StatusIndicator, StatusLabel } from "~/components/ui/status";
import { Textarea } from "~/components/ui/textarea";
import type { FreeTool } from "~/lib/free-tools/tool-meta";
import { trackSiteEvent } from "~/lib/site/analytics-events";

type ToolWorkbenchProps = {
  tool: FreeTool;
};

type FileResult = {
  name: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
};

const demoJson = `{
  "name": "Khanh Duy",
  "tools": ["QR Code", "JSON Formatter", "Image Compressor"],
  "private": true
}`;

const demoMarkdown = `# Release checklist

- Run type checks
- Run Biome
- Verify the page in browser

## Notes

Small browser tools should be fast, private, and easy to share.`;

const defaultZones = [
  "Asia/Ho_Chi_Minh",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const toRgb = converter("rgb");
const toOklch = converter("oklch");

export function ToolWorkbench({ tool }: ToolWorkbenchProps): ReactNode {
  useEffect(() => {
    trackSiteEvent("Free Tool Viewed", {
      category: tool.category,
      tool: tool.slug,
    });
  }, [tool.category, tool.slug]);

  switch (tool.slug) {
    case "qr-code-generator":
      return <QRCodeTool />;
    case "json-formatter":
      return <JsonFormatterTool />;
    case "jwt-decoder":
      return <JwtDecoderTool />;
    case "uuid-generator":
      return <UuidGeneratorTool />;
    case "password-generator":
      return <PasswordGeneratorTool />;
    case "base64-encoder":
      return <Base64Tool />;
    case "url-encoder":
      return <UrlEncoderTool />;
    case "regex-tester":
      return <RegexTesterTool />;
    case "hash-generator":
      return <HashGeneratorTool />;
    case "timestamp-converter":
      return <TimestampTool />;
    case "timezone-converter":
      return <TimezoneTool />;
    case "word-counter":
      return <WordCounterTool />;
    case "text-diff-checker":
      return <TextDiffTool />;
    case "markdown-preview":
      return <MarkdownPreviewTool />;
    case "css-gradient-generator":
      return <GradientTool />;
    case "color-converter":
      return <ColorConverterTool />;
    case "palette-from-image":
      return <PaletteTool />;
    case "image-compressor":
      return <ImageCanvasTool mode="compress" />;
    case "image-resizer":
      return <ImageCanvasTool mode="resize" />;
    case "images-to-pdf":
      return <ImagesToPdfTool />;
    default:
      return null;
  }
}

function WorkbenchLayout({
  actions,
  children,
  output,
}: {
  actions?: ReactNode;
  children: ReactNode;
  output: ReactNode;
}): ReactNode {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        {children}
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="min-w-0 rounded-lg border bg-muted/30 p-4 md:p-5">
        {output}
      </div>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}): ReactNode {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ResultBlock({
  children,
  title = "Output",
}: {
  children: ReactNode;
  title?: string;
}): ReactNode {
  return (
    <div className="flex h-full min-h-64 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <Status variant="success">
          <StatusIndicator />
          <StatusLabel>Local</StatusLabel>
        </Status>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-md border bg-background p-3">
        {children}
      </div>
    </div>
  );
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function downloadText(filename: string, content: string, type = "text/plain") {
  downloadBlob(filename, new Blob([content], { type }));
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function QRCodeTool(): ReactNode {
  const [data, setData] = useState("https://www.khanhduy.com");
  const [robustness, setRobustness] = useState<"L" | "M" | "Q" | "H">("M");

  const downloadSvg = async () => {
    const svg = await QR.toString(data.trim() || " ", {
      type: "svg",
      errorCorrectionLevel: robustness,
      margin: 2,
      width: 512,
    });
    downloadText("qr-code.svg", svg, "image/svg+xml");
  };

  const downloadPng = async () => {
    const url = await QR.toDataURL(data.trim() || " ", {
      errorCorrectionLevel: robustness,
      margin: 2,
      width: 1024,
    });
    const response = await fetch(url);
    downloadBlob("qr-code.png", await response.blob());
  };

  return (
    <WorkbenchLayout
      actions={
        <>
          <Button onClick={() => void downloadSvg()} type="button">
            <DownloadIcon data-icon="inline-start" />
            SVG
          </Button>
          <Button
            onClick={() => void downloadPng()}
            type="button"
            variant="outline"
          >
            PNG
          </Button>
        </>
      }
      output={
        <ResultBlock title="Preview">
          <div className="mx-auto flex aspect-square w-full max-w-72 items-center justify-center rounded-lg bg-background p-4">
            <QRCodePreview data={data || " "} robustness={robustness} />
          </div>
        </ResultBlock>
      }
    >
      <Field label="QR data">
        <Textarea
          className="min-h-40"
          onChange={(event) => setData(event.target.value)}
          value={data}
        />
      </Field>
      <Field label="Error correction">
        <div className="flex flex-wrap gap-2">
          {(["L", "M", "Q", "H"] as const).map((level) => (
            <Button
              key={level}
              onClick={() => setRobustness(level)}
              size="sm"
              type="button"
              variant={robustness === level ? "default" : "outline"}
            >
              {level}
            </Button>
          ))}
        </div>
      </Field>
    </WorkbenchLayout>
  );
}

function JsonFormatterTool(): ReactNode {
  const [input, setInput] = useState(demoJson);
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input) as unknown;
      const value = sortKeys ? sortObjectKeys(parsed) : parsed;
      const formatted = JSON.stringify(value, null, indent);
      return { formatted, error: "", valid: true };
    } catch (error) {
      return {
        formatted: "",
        error: error instanceof Error ? error.message : "Invalid JSON",
        valid: false,
      };
    }
  }, [input, indent, sortKeys]);

  return (
    <WorkbenchLayout
      actions={
        <>
          <Button
            disabled={!result.valid}
            onClick={() => void copyText(result.formatted)}
            type="button"
          >
            <CopyIcon data-icon="inline-start" />
            Copy
          </Button>
          <Button
            disabled={!result.valid}
            onClick={() =>
              downloadText(
                "formatted.json",
                result.formatted,
                "application/json",
              )
            }
            type="button"
            variant="outline"
          >
            Download
          </Button>
        </>
      }
      output={
        <ResultBlock
          title={result.valid ? "Formatted JSON" : "Validation error"}
        >
          <pre className="whitespace-pre-wrap break-words font-mono text-sm">
            {result.valid ? result.formatted : result.error}
          </pre>
        </ResultBlock>
      }
    >
      <Field label="JSON input">
        <Textarea
          className="min-h-72 font-mono"
          onChange={(event) => setInput(event.target.value)}
          value={input}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`Indent: ${indent}`}>
          <Slider
            max={8}
            min={0}
            onValueChange={([value]) => setIndent(value ?? 2)}
            step={2}
            value={[indent]}
          />
        </Field>
        <CheckboxGroup
          onValueChange={(value) => setSortKeys(value.includes("sort"))}
          value={sortKeys ? ["sort"] : []}
        >
          <CheckboxGroupItem value="sort">Sort object keys</CheckboxGroupItem>
        </CheckboxGroup>
      </div>
    </WorkbenchLayout>
  );
}

function JwtDecoderTool(): ReactNode {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrZCIsIm5hbWUiOiJLaGFuaCBEdXkiLCJleHAiOjE4OTM0NTYwMDB9.signature",
  );

  const decoded = useMemo(() => decodeJwt(token), [token]);

  return (
    <WorkbenchLayout
      output={
        <ResultBlock title="Decoded token">
          {decoded.error ? (
            <p className="text-destructive text-sm">{decoded.error}</p>
          ) : (
            <div className="flex flex-col gap-4">
              <Pill variant="outline">{decoded.status}</Pill>
              <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                {JSON.stringify(decoded.parts, null, 2)}
              </pre>
            </div>
          )}
        </ResultBlock>
      }
    >
      <Field label="JWT">
        <Textarea
          className="min-h-56 font-mono"
          onChange={(event) => setToken(event.target.value)}
          value={token}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function UuidGeneratorTool(): ReactNode {
  const [count, setCount] = useState(8);
  const [uppercase, setUppercase] = useState(false);
  const [hyphenless, setHyphenless] = useState(false);
  const [values, setValues] = useState(() => makeUuids(8, false, false));

  const regenerate = () => setValues(makeUuids(count, uppercase, hyphenless));

  return (
    <WorkbenchLayout
      actions={
        <>
          <Button onClick={regenerate} type="button">
            <RefreshCcwIcon data-icon="inline-start" />
            Generate
          </Button>
          <Button
            onClick={() => void copyText(values.join("\n"))}
            type="button"
            variant="outline"
          >
            Copy all
          </Button>
        </>
      }
      output={
        <ResultBlock title="UUIDs">
          <pre className="whitespace-pre-wrap break-all font-mono text-sm">
            {values.join("\n")}
          </pre>
        </ResultBlock>
      }
    >
      <Field label={`How many: ${count}`}>
        <Slider
          max={50}
          min={1}
          onValueChange={([value]) => setCount(value ?? 8)}
          value={[count]}
        />
      </Field>
      <CheckboxGroup
        onValueChange={(value) => {
          setUppercase(value.includes("uppercase"));
          setHyphenless(value.includes("hyphenless"));
        }}
        value={[
          ...(uppercase ? ["uppercase"] : []),
          ...(hyphenless ? ["hyphenless"] : []),
        ]}
      >
        <CheckboxGroupItem value="uppercase">Uppercase</CheckboxGroupItem>
        <CheckboxGroupItem value="hyphenless">Remove hyphens</CheckboxGroupItem>
      </CheckboxGroup>
    </WorkbenchLayout>
  );
}

function PasswordGeneratorTool(): ReactNode {
  const [length, setLength] = useState(24);
  const [sets, setSets] = useState(["upper", "lower", "number", "symbol"]);
  const [passwords, setPasswords] = useState(() =>
    makePasswords(5, 24, ["upper", "lower", "number", "symbol"]),
  );

  const regenerate = () => setPasswords(makePasswords(5, length, sets));

  return (
    <WorkbenchLayout
      actions={
        <>
          <Button onClick={regenerate} type="button">
            <RefreshCcwIcon data-icon="inline-start" />
            Generate
          </Button>
          <Button
            onClick={() => void copyText(passwords[0] ?? "")}
            type="button"
            variant="outline"
          >
            Copy first
          </Button>
        </>
      }
      output={
        <ResultBlock title="Passwords">
          <pre className="whitespace-pre-wrap break-all font-mono text-sm">
            {passwords.join("\n")}
          </pre>
        </ResultBlock>
      }
    >
      <Field label={`Length: ${length}`}>
        <Slider
          max={64}
          min={8}
          onValueChange={([value]) => setLength(value ?? 24)}
          value={[length]}
        />
      </Field>
      <CheckboxGroup onValueChange={setSets} value={sets}>
        <CheckboxGroupItem value="upper">Uppercase</CheckboxGroupItem>
        <CheckboxGroupItem value="lower">Lowercase</CheckboxGroupItem>
        <CheckboxGroupItem value="number">Numbers</CheckboxGroupItem>
        <CheckboxGroupItem value="symbol">Symbols</CheckboxGroupItem>
      </CheckboxGroup>
    </WorkbenchLayout>
  );
}

function Base64Tool(): ReactNode {
  const [input, setInput] = useState("Khanh Duy");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const output = useMemo(
    () => convertBase64(input, mode, urlSafe),
    [input, mode, urlSafe],
  );

  return (
    <SimpleTextTool
      input={input}
      inputLabel="Text"
      onInputChangeAction={setInput}
      output={output}
      title="Base64 result"
    >
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setMode("encode")}
          type="button"
          variant={mode === "encode" ? "default" : "outline"}
        >
          Encode
        </Button>
        <Button
          onClick={() => setMode("decode")}
          type="button"
          variant={mode === "decode" ? "default" : "outline"}
        >
          Decode
        </Button>
        <Button
          onClick={() => setUrlSafe((value) => !value)}
          type="button"
          variant={urlSafe ? "default" : "outline"}
        >
          URL safe
        </Button>
      </div>
    </SimpleTextTool>
  );
}

function UrlEncoderTool(): ReactNode {
  const [input, setInput] = useState(
    "https://www.khanhduy.com/free-tools?tool=QR Code",
  );
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const output = useMemo(() => {
    try {
      return mode === "encode"
        ? encodeURIComponent(input)
        : decodeURIComponent(input);
    } catch {
      return "Invalid encoded URL input.";
    }
  }, [input, mode]);

  return (
    <SimpleTextTool
      input={input}
      inputLabel="URL or text"
      onInputChangeAction={setInput}
      output={output}
      title="Converted value"
    >
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setMode("encode")}
          type="button"
          variant={mode === "encode" ? "default" : "outline"}
        >
          Encode
        </Button>
        <Button
          onClick={() => setMode("decode")}
          type="button"
          variant={mode === "decode" ? "default" : "outline"}
        >
          Decode
        </Button>
      </div>
    </SimpleTextTool>
  );
}

function RegexTesterTool(): ReactNode {
  const [pattern, setPattern] = useState("\\b(tool|Next\\.js)\\b");
  const [flags, setFlags] = useState("gi");
  const [sample, setSample] = useState(
    "Next.js makes it easy to build private browser tools. A tool should be fast.",
  );

  const result = useMemo(() => {
    try {
      const regex = new RegExp(
        pattern,
        flags.includes("g") ? flags : `${flags}g`,
      );
      const matches = [...sample.matchAll(regex)];
      return {
        error: "",
        matches: matches.map((match) => ({
          text: match[0],
          index: match.index ?? 0,
        })),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Invalid regex",
        matches: [],
      };
    }
  }, [pattern, flags, sample]);

  return (
    <WorkbenchLayout
      output={
        <ResultBlock title="Matches">
          {result.error ? (
            <p className="text-destructive text-sm">{result.error}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {result.matches.map((match) => (
                <div
                  className="rounded-md border p-2 text-sm"
                  key={`${match.index}-${match.text}`}
                >
                  <span className="font-mono">{match.text}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    at {match.index}
                  </span>
                </div>
              ))}
              {result.matches.length === 0 ? (
                <p className="text-muted-foreground text-sm">No matches.</p>
              ) : null}
            </div>
          )}
        </ResultBlock>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <Field label="Pattern">
          <Input
            onChange={(event) => setPattern(event.target.value)}
            value={pattern}
          />
        </Field>
        <Field label="Flags">
          <Input
            onChange={(event) => setFlags(event.target.value)}
            value={flags}
          />
        </Field>
      </div>
      <Field label="Sample text">
        <Textarea
          className="min-h-56"
          onChange={(event) => setSample(event.target.value)}
          value={sample}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function HashGeneratorTool(): ReactNode {
  const [input, setInput] = useState("Khanh Duy");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [output, setOutput] = useState("");

  const generate = async () => {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest(algorithm, data);
    setOutput(
      [...new Uint8Array(hash)]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
    );
  };

  return (
    <SimpleTextTool
      input={input}
      inputLabel="Text to hash"
      onInputChangeAction={setInput}
      output={output || "Click Generate to create a digest."}
      title={algorithm}
    >
      <div className="flex flex-wrap gap-2">
        {["SHA-256", "SHA-384", "SHA-512"].map((item) => (
          <Button
            key={item}
            onClick={() => setAlgorithm(item)}
            type="button"
            variant={algorithm === item ? "default" : "outline"}
          >
            {item}
          </Button>
        ))}
        <Button onClick={() => void generate()} type="button">
          Generate
        </Button>
      </div>
    </SimpleTextTool>
  );
}

function TimestampTool(): ReactNode {
  const [timestamp, setTimestamp] = useState(() =>
    String(Math.floor(Date.now() / 1000)),
  );
  const date = useMemo(() => parseTimestamp(timestamp), [timestamp]);

  return (
    <WorkbenchLayout
      actions={
        <Button
          onClick={() => setTimestamp(String(Math.floor(Date.now() / 1000)))}
          type="button"
        >
          Use now
        </Button>
      }
      output={
        <ResultBlock title="Date formats">
          {date ? (
            <div className="flex flex-col gap-3 text-sm">
              <OutputRow label="Local" value={date.toLocaleString()} />
              <OutputRow label="UTC" value={date.toUTCString()} />
              <OutputRow label="ISO" value={date.toISOString()} />
              <OutputRow label="Milliseconds" value={String(date.getTime())} />
            </div>
          ) : (
            <p className="text-destructive text-sm">Invalid timestamp.</p>
          )}
        </ResultBlock>
      }
    >
      <Field label="Unix timestamp">
        <Input
          onChange={(event) => setTimestamp(event.target.value)}
          value={timestamp}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function TimezoneTool(): ReactNode {
  const [dateTime, setDateTime] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [zones, setZones] = useState(defaultZones);
  const [newZone, setNewZone] = useState("Asia/Singapore");
  const baseDate = new Date(dateTime);

  return (
    <WorkbenchLayout
      actions={
        <Button
          onClick={() => {
            if (newZone && !zones.includes(newZone)) {
              setZones([...zones, newZone]);
            }
          }}
          type="button"
        >
          Add zone
        </Button>
      }
      output={
        <ResultBlock title="Time zones">
          <div className="flex flex-col gap-2">
            {zones.map((zone) => (
              <div className="rounded-md border p-3" key={zone}>
                <p className="font-medium">{zone}</p>
                <p className="text-muted-foreground text-sm">
                  {Number.isNaN(baseDate.getTime())
                    ? "Invalid date"
                    : new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: zone,
                      }).format(baseDate)}
                </p>
              </div>
            ))}
          </div>
        </ResultBlock>
      }
    >
      <Field label="Base date and time">
        <Input
          onChange={(event) => setDateTime(event.target.value)}
          type="datetime-local"
          value={dateTime}
        />
      </Field>
      <Field label="Add IANA timezone">
        <Input
          onChange={(event) => setNewZone(event.target.value)}
          value={newZone}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function WordCounterTool(): ReactNode {
  const [input, setInput] = useState(
    "Small browser tools should be fast, private, and useful enough to bookmark.",
  );
  const stats = useMemo(() => getTextStats(input), [input]);

  return (
    <WorkbenchLayout
      output={
        <ResultBlock title="Text stats">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(stats).map(([label, value]) => (
              <Stat key={label}>
                <StatLabel>{label}</StatLabel>
                <StatValue>{value}</StatValue>
                <StatIndicator variant="badge">{value}</StatIndicator>
                <StatDescription>Calculated locally</StatDescription>
              </Stat>
            ))}
          </div>
        </ResultBlock>
      }
    >
      <Field label="Text">
        <Textarea
          className="min-h-80"
          onChange={(event) => setInput(event.target.value)}
          value={input}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function TextDiffTool(): ReactNode {
  const [left, setLeft] = useState("run check\nrun build\nship");
  const [right, setRight] = useState(
    "run check\nrun browser test\nrun build\nship",
  );
  const diff = useMemo(() => lineDiff(left, right), [left, right]);

  return (
    <WorkbenchLayout
      output={
        <ResultBlock title="Line diff">
          <div className="flex flex-col gap-1 font-mono text-sm">
            {diff.map((line) => (
              <div
                className={
                  line.type === "same"
                    ? "rounded px-2 py-1"
                    : line.type === "add"
                      ? "rounded bg-green-500/10 px-2 py-1 text-green-700 dark:text-green-300"
                      : "rounded bg-destructive/10 px-2 py-1 text-destructive"
                }
                key={line.id}
              >
                {line.type === "add"
                  ? "+ "
                  : line.type === "remove"
                    ? "- "
                    : "  "}
                {line.value}
              </div>
            ))}
          </div>
        </ResultBlock>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Original">
          <Textarea
            className="min-h-72 font-mono"
            onChange={(event) => setLeft(event.target.value)}
            value={left}
          />
        </Field>
        <Field label="Changed">
          <Textarea
            className="min-h-72 font-mono"
            onChange={(event) => setRight(event.target.value)}
            value={right}
          />
        </Field>
      </div>
    </WorkbenchLayout>
  );
}

function MarkdownPreviewTool(): ReactNode {
  const [input, setInput] = useState(demoMarkdown);

  return (
    <WorkbenchLayout
      output={
        <ResultBlock title="Preview">{renderMarkdown(input)}</ResultBlock>
      }
    >
      <Field label="Markdown">
        <Textarea
          className="min-h-96 font-mono"
          onChange={(event) => setInput(event.target.value)}
          value={input}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function GradientTool(): ReactNode {
  const [from, setFrom] = useState("#2563eb");
  const [to, setTo] = useState("#06b6d4");
  const [angle, setAngle] = useState(135);
  const css = `linear-gradient(${angle}deg, ${from}, ${to})`;

  return (
    <WorkbenchLayout
      actions={
        <Button
          onClick={() => void copyText(`background: ${css};`)}
          type="button"
        >
          <CopyIcon data-icon="inline-start" />
          Copy CSS
        </Button>
      }
      output={
        <ResultBlock title="Gradient">
          <div
            className="flex min-h-72 flex-col justify-end rounded-lg border p-4"
            style={{ background: css }}
          >
            <pre className="rounded-md bg-background/80 p-3 font-mono text-sm backdrop-blur">
              {`background: ${css};`}
            </pre>
          </div>
        </ResultBlock>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From">
          <Input
            onChange={(event) => setFrom(event.target.value)}
            type="color"
            value={from}
          />
        </Field>
        <Field label="To">
          <Input
            onChange={(event) => setTo(event.target.value)}
            type="color"
            value={to}
          />
        </Field>
      </div>
      <Field label={`Angle: ${angle}deg`}>
        <Slider
          max={360}
          min={0}
          onValueChange={([value]) => setAngle(value ?? 135)}
          value={[angle]}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function ColorConverterTool(): ReactNode {
  const [color, setColor] = useState("#2563eb");
  const converted = useMemo(() => convertColor(color), [color]);

  return (
    <WorkbenchLayout
      output={
        <ResultBlock title="Color values">
          <div className="flex flex-col gap-3">
            <div
              className="h-28 rounded-lg border"
              style={{ background: converted.hex }}
            />
            <OutputRow label="HEX" value={converted.hex} />
            <OutputRow label="RGB" value={converted.rgb} />
            <OutputRow label="HSL" value={converted.hsl} />
            <OutputRow label="OKLCH" value={converted.oklch} />
            {converted.error ? (
              <p className="text-destructive text-sm">{converted.error}</p>
            ) : null}
          </div>
        </ResultBlock>
      }
    >
      <Field label="Color">
        <Input
          onChange={(event) => setColor(event.target.value)}
          type="color"
          value={converted.hex}
        />
      </Field>
      <Field label="HEX input">
        <Input
          onChange={(event) => setColor(event.target.value)}
          value={color}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function PaletteTool(): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [status, setStatus] = useState("Choose an image to extract colors.");

  const loadFile = async (file: File) => {
    setStatus("Reading image...");
    setPalette([]);

    try {
      const image = await loadImage(file);
      const canvas = canvasRef.current;
      if (!canvas) {
        setStatus("Preview canvas is not available.");
        return;
      }

      const size = 180;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, size, size);
      context?.drawImage(image, 0, 0, size, size);
      const pixels = context?.getImageData(0, 0, size, size).data;
      if (!pixels) {
        setStatus("Could not read image pixels.");
        return;
      }

      const nextPalette = extractPalette(pixels);
      setPalette(nextPalette);
      setStatus(
        nextPalette.length > 0
          ? `Extracted ${nextPalette.length} colors. Click any swatch to copy.`
          : "No visible colors found in this image.",
      );
    } catch {
      setStatus("Could not load that image. Try a PNG, JPEG, or WebP file.");
    }
  };

  return (
    <WorkbenchLayout
      output={
        <ResultBlock title="Palette">
          <div className="flex flex-col gap-4">
            <canvas
              className="aspect-square w-full rounded-lg border bg-background"
              ref={canvasRef}
            />
            <p className="text-muted-foreground text-sm">{status}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {palette.map((swatch) => (
                <button
                  className="h-20 rounded-md border text-xs font-medium shadow-sm"
                  key={swatch}
                  onClick={() => void copyText(swatch)}
                  style={{ background: swatch }}
                  type="button"
                >
                  <span className="rounded bg-background/80 px-2 py-1">
                    {swatch}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </ResultBlock>
      }
    >
      <FileDrop onFileAction={(file) => void loadFile(file)} />
    </WorkbenchLayout>
  );
}

function ImageCanvasTool({ mode }: { mode: "compress" | "resize" }): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.82);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [result, setResult] = useState<FileResult | null>(null);
  const [status, setStatus] = useState("Choose an image to start.");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result?.url]);

  const drawPreview = (
    image: HTMLImageElement,
    nextWidth: number,
    nextHeight: number,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setStatus("Preview canvas is not available.");
      return;
    }

    canvas.width = nextWidth;
    canvas.height = nextHeight;
    const context = canvas.getContext("2d");
    context?.clearRect(0, 0, nextWidth, nextHeight);
    context?.drawImage(image, 0, 0, nextWidth, nextHeight);
  };

  const prepareFile = async (nextFile: File) => {
    setFile(nextFile);
    setResult(null);
    setStatus("Loading preview...");

    try {
      const image = await loadImage(nextFile);
      const nextWidth = Math.max(1, Math.min(1200, image.naturalWidth));
      const ratio = image.naturalWidth / image.naturalHeight || 1;
      const nextHeight = Math.max(1, Math.round(nextWidth / ratio));
      setWidth(nextWidth);
      setHeight(nextHeight);
      drawPreview(image, nextWidth, nextHeight);
      setStatus(
        `${nextFile.name} loaded at ${image.naturalWidth} x ${image.naturalHeight}.`,
      );
    } catch {
      setFile(null);
      setStatus("Could not load that image. Try a PNG, JPEG, or WebP file.");
    }
  };

  const process = async () => {
    if (!file) {
      return;
    }

    setIsProcessing(true);
    setStatus(
      mode === "compress" ? "Compressing image..." : "Resizing image...",
    );

    try {
      const image = await loadImage(file);
      const ratio = image.naturalWidth / image.naturalHeight || 1;
      const nextWidth =
        mode === "compress"
          ? Math.max(1, Math.min(width, image.naturalWidth))
          : Math.max(1, width);
      const nextHeight =
        mode === "compress"
          ? Math.max(1, Math.round(nextWidth / ratio))
          : Math.max(1, height);
      const canvas = canvasRef.current;

      if (!canvas) {
        setStatus("Preview canvas is not available.");
        return;
      }

      canvas.width = nextWidth;
      canvas.height = nextHeight;
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, nextWidth, nextHeight);
      context?.drawImage(image, 0, 0, nextWidth, nextHeight);
      let outputType = "image/webp";
      let blob: Blob;
      try {
        blob = await canvasToBlob(canvas, outputType, quality);
      } catch {
        outputType = "image/png";
        blob = await canvasToBlob(canvas, outputType, 1);
      }
      const url = URL.createObjectURL(blob);
      const extension = outputType === "image/png" ? "png" : "webp";
      setResult((current) => {
        if (current?.url) {
          URL.revokeObjectURL(current.url);
        }
        return {
          name: `${mode === "compress" ? "compressed" : "resized"}.${extension}`,
          url,
          size: blob.size,
          width: nextWidth,
          height: nextHeight,
        };
      });
      setStatus(
        `${mode === "compress" ? "Compressed" : "Resized"} to ${nextWidth} x ${nextHeight}.`,
      );
    } catch {
      setStatus(
        "Could not process that image. Try another file or dimensions.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <WorkbenchLayout
      actions={
        <>
          <Button
            disabled={!file || isProcessing}
            onClick={() => void process()}
            type="button"
          >
            {isProcessing
              ? "Working..."
              : mode === "compress"
                ? "Compress"
                : "Resize"}
          </Button>
          <Button
            disabled={!result}
            onClick={() => {
              if (result) {
                void fetch(result.url)
                  .then((response) => response.blob())
                  .then((blob) => downloadBlob(result.name, blob));
              }
            }}
            type="button"
            variant="outline"
          >
            <DownloadIcon data-icon="inline-start" />
            Download
          </Button>
        </>
      }
      output={
        <ResultBlock title="Image output">
          <div className="flex flex-col gap-3">
            <canvas
              className="max-h-[32rem] w-full rounded-lg border bg-background object-contain"
              ref={canvasRef}
            />
            <p className="text-muted-foreground text-sm">{status}</p>
            {result ? (
              <div className="flex flex-wrap gap-2">
                <Pill variant="outline">{formatBytes(result.size)}</Pill>
                <Pill variant="outline">
                  {result.width} x {result.height}
                </Pill>
              </div>
            ) : null}
          </div>
        </ResultBlock>
      }
    >
      <FileDrop
        accept="image/*"
        onFileAction={(nextFile) => void prepareFile(nextFile)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`Width: ${width}px`}>
          <Input
            onChange={(event) => setWidth(Number(event.target.value))}
            type="number"
            value={width}
          />
        </Field>
        <Field label={`Height: ${height}px`}>
          <Input
            disabled={mode === "compress"}
            onChange={(event) => setHeight(Number(event.target.value))}
            type="number"
            value={height}
          />
        </Field>
      </div>
      <Field label={`Quality: ${Math.round(quality * 100)}%`}>
        <Slider
          max={1}
          min={0.1}
          onValueChange={([value]) => setQuality(value ?? 0.82)}
          step={0.01}
          value={[quality]}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function ImagesToPdfTool(): ReactNode {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("Add PNG or JPEG images to start.");
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    if (files.length === 0) {
      return;
    }

    setIsGenerating(true);
    setStatus("Creating PDF...");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const image = isPngFile(file)
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
        const page = pdf.addPage([612, 792]);
        const scaled = image.scaleToFit(540, 720);
        page.drawImage(image, {
          height: scaled.height,
          width: scaled.width,
          x: (612 - scaled.width) / 2,
          y: (792 - scaled.height) / 2,
        });
      }

      const pdfBytes = await pdf.save();
      const pdfBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength,
      ) as ArrayBuffer;
      downloadBlob(
        "images.pdf",
        new Blob([pdfBuffer], { type: "application/pdf" }),
      );
      setStatus(
        `Created PDF with ${files.length} page${files.length === 1 ? "" : "s"}.`,
      );
    } catch {
      setStatus("Could not create a PDF. Use PNG or JPEG images only.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <WorkbenchLayout
      actions={
        <Button
          disabled={files.length === 0 || isGenerating}
          onClick={() => void generate()}
          type="button"
        >
          <DownloadIcon data-icon="inline-start" />
          {isGenerating ? "Creating..." : "Create PDF"}
        </Button>
      }
      output={
        <ResultBlock title="PDF queue">
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">{status}</p>
            {files.map((file) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border p-3"
                key={`${file.name}-${file.size}-${file.lastModified}`}
              >
                <span className="min-w-0 truncate text-sm">{file.name}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Pill variant="outline">{formatBytes(file.size)}</Pill>
                  <Button
                    aria-label={`Remove ${file.name}`}
                    className="h-7 px-2"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((item) => item !== file),
                      )
                    }
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ResultBlock>
      }
    >
      <div className="rounded-lg border border-dashed p-5">
        <Label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
          <UploadIcon />
          <span>Add PNG or JPEG images</span>
          <Input
            accept="image/png,image/jpeg"
            className="sr-only"
            multiple
            onChange={(event) => {
              const selectedFiles = Array.from(event.target.files ?? []).filter(
                isPdfImageFile,
              );
              setFiles(selectedFiles);
              setStatus(
                selectedFiles.length > 0
                  ? `${selectedFiles.length} image${selectedFiles.length === 1 ? "" : "s"} ready.`
                  : "Add PNG or JPEG images to start.",
              );
            }}
            type="file"
          />
        </Label>
      </div>
    </WorkbenchLayout>
  );
}

function SimpleTextTool({
  children,
  input,
  inputLabel,
  onInputChangeAction,
  output,
  title,
}: {
  children?: ReactNode;
  input: string;
  inputLabel: string;
  onInputChangeAction: (value: string) => void;
  output: string;
  title: string;
}): ReactNode {
  return (
    <WorkbenchLayout
      actions={
        <>
          <Button onClick={() => void copyText(output)} type="button">
            <CopyIcon data-icon="inline-start" />
            Copy output
          </Button>
          {children}
        </>
      }
      output={
        <ResultBlock title={title}>
          <pre className="whitespace-pre-wrap break-words font-mono text-sm">
            {output}
          </pre>
        </ResultBlock>
      }
    >
      <Field label={inputLabel}>
        <Textarea
          className="min-h-72 font-mono"
          onChange={(event) => onInputChangeAction(event.target.value)}
          value={input}
        />
      </Field>
    </WorkbenchLayout>
  );
}

function FileDrop({
  accept = "image/*",
  onFileAction,
}: {
  accept?: string;
  onFileAction: (file: File) => void;
}): ReactNode {
  return (
    <div className="rounded-lg border border-dashed p-5">
      <Label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
        <UploadIcon />
        <span>Choose an image</span>
        <Input
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onFileAction(file);
            }
          }}
          type="file"
        />
      </Label>
    </div>
  );
}

function OutputRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactNode {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 rounded-md border p-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <button
        className="min-w-0 break-all text-right font-mono text-sm"
        onClick={() => void copyText(value)}
        type="button"
      >
        {value}
      </button>
    </div>
  );
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, sortObjectKeys(nested)]),
    );
  }

  return value;
}

function decodeJwt(token: string) {
  try {
    const [header, payload] = token.split(".");
    if (!header || !payload) {
      throw new Error("Token must include header and payload segments.");
    }

    const parts = {
      header: JSON.parse(base64UrlDecode(header)) as unknown,
      payload: JSON.parse(base64UrlDecode(payload)) as Record<string, unknown>,
    };
    const exp =
      typeof parts.payload.exp === "number" ? parts.payload.exp : null;
    const status = exp
      ? exp * 1000 > Date.now()
        ? "Not expired"
        : "Expired"
      : "No exp claim";

    return { parts, status, error: "" };
  } catch (error) {
    return {
      parts: null,
      status: "Invalid",
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(
    atob(normalized)
      .split("")
      .map(
        (character) =>
          `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
      )
      .join(""),
  );
}

function makeUuids(count: number, uppercase: boolean, hyphenless: boolean) {
  return Array.from({ length: count }, () => {
    let uuid = crypto.randomUUID();
    if (hyphenless) {
      uuid = uuid.replaceAll("-", "");
    }
    return uppercase ? uuid.toUpperCase() : uuid;
  });
}

function makePasswords(count: number, length: number, sets: string[]) {
  const pools = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    symbol: "!@#$%^&*()_+-=[]{};:,.?",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  };
  const characters =
    sets.map((set) => pools[set as keyof typeof pools]).join("") || pools.lower;

  return Array.from({ length: count }, () => {
    const random = new Uint32Array(length);
    crypto.getRandomValues(random);
    return [...random]
      .map((value) => characters[value % characters.length])
      .join("");
  });
}

function convertBase64(
  input: string,
  mode: "encode" | "decode",
  urlSafe: boolean,
) {
  try {
    if (mode === "encode") {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      return urlSafe
        ? encoded.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")
        : encoded;
    }

    const normalized = urlSafe
      ? input.replaceAll("-", "+").replaceAll("_", "/")
      : input;
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return decodeURIComponent(escape(atob(padded)));
  } catch {
    return "Invalid Base64 input.";
  }
}

function parseTimestamp(value: string) {
  const numeric = Number(value.trim());
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric);
}

function getTextStats(text: string) {
  const words = text.trim().match(/\S+/g)?.length ?? 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter((item) => item.trim()).length;

  return {
    Words: words,
    Characters: characters,
    "No spaces": charactersNoSpaces,
    Sentences: sentences,
    "Read min": Math.max(1, Math.ceil(words / 220)),
  };
}

function lineDiff(left: string, right: string) {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");
  const rows: Array<{
    id: string;
    type: "same" | "add" | "remove";
    value: string;
  }> = [];
  const max = Math.max(leftLines.length, rightLines.length);

  for (let index = 0; index < max; index += 1) {
    if (leftLines[index] === rightLines[index]) {
      rows.push({
        id: `same-${index}-${leftLines[index] ?? ""}`,
        type: "same",
        value: leftLines[index] ?? "",
      });
    } else {
      if (leftLines[index] !== undefined) {
        rows.push({
          id: `remove-${index}-${leftLines[index]}`,
          type: "remove",
          value: leftLines[index],
        });
      }
      if (rightLines[index] !== undefined) {
        rows.push({
          id: `add-${index}-${rightLines[index]}`,
          type: "add",
          value: rightLines[index],
        });
      }
    }
  }

  return rows;
}

function renderMarkdown(markdown: string) {
  const lines = markdown
    .split("\n")
    .map((line, index) => ({ id: `${index}-${line}`, line }));
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      {lines.map(({ id, line }) => {
        if (line.startsWith("# ")) {
          return (
            <h1 className="font-bold text-2xl" key={id}>
              {line.replace("# ", "")}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 className="font-semibold text-xl" key={id}>
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p className="pl-3" key={id}>
              - {line.replace("- ", "")}
            </p>
          );
        }
        return line ? <p key={id}>{line}</p> : <Separator key={id} />;
      })}
    </div>
  );
}

function convertColor(value: string) {
  const fallback = "#2563eb";
  const rawParsed = parse(value.trim());
  const parsed = rawParsed ?? parse(fallback);
  const rgbColor = parsed ? toRgb(parsed) : undefined;
  const oklchColor = parsed ? toOklch(parsed) : undefined;

  if (!rgbColor) {
    return {
      error:
        "Invalid color. Try #2563eb, rgb(37 99 235), hsl(221 83% 53%), oklch(0.54 0.19 260), or a named color.",
      hex: fallback,
      hsl: "hsl(221, 83%, 53%)",
      oklch: "oklch(54.1% 0.191 260)",
      rgb: "rgb(37, 99, 235)",
    };
  }

  const red = Math.round((rgbColor.r ?? 0) * 255);
  const green = Math.round((rgbColor.g ?? 0) * 255);
  const blue = Math.round((rgbColor.b ?? 0) * 255);
  const alpha = rgbColor.alpha ?? 1;
  const [hue, saturation, lightness] = rgbToHsl(red, green, blue);
  const hex = formatHex(rgbColor) ?? fallback;
  const light = Math.round((oklchColor?.l ?? 0) * 1000) / 10;
  const chroma = Math.round((oklchColor?.c ?? 0) * 1000) / 1000;
  const oklchHue = Math.round(oklchColor?.h ?? 0);

  return {
    error: rawParsed
      ? ""
      : "Invalid color. Showing a safe fallback until the input is valid.",
    hex,
    rgb:
      alpha < 1
        ? `rgba(${red}, ${green}, ${blue}, ${Number(alpha.toFixed(2))})`
        : `rgb(${red}, ${green}, ${blue})`,
    hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    oklch: `oklch(${light}% ${chroma} ${oklchHue})`,
  };
}

function rgbToHsl(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  if (max === min) {
    return [0, 0, Math.round(lightness * 100)];
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  const hue =
    max === r
      ? (g - b) / delta + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;

  return [
    Math.round((hue / 6) * 360),
    Math.round(saturation * 100),
    Math.round(lightness * 100),
  ];
}

function extractPalette(pixels: Uint8ClampedArray) {
  const buckets = new Map<string, number>();

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3] ?? 0;
    if (alpha < 128) {
      continue;
    }

    const red = Math.round((pixels[index] ?? 0) / 32) * 32;
    const green = Math.round((pixels[index + 1] ?? 0) / 32) * 32;
    const blue = Math.round((pixels[index + 2] ?? 0) / 32) * 32;
    const hex = `#${[red, green, blue]
      .map((value) => Math.min(value, 255).toString(16).padStart(2, "0"))
      .join("")}`;
    buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([hex]) => hex);
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size === 0) {
          reject(new Error("Could not export canvas"));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function isPngFile(file: File) {
  return file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
}

function isJpegFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/jpeg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  );
}

function isPdfImageFile(file: File) {
  return isPngFile(file) || isJpegFile(file);
}
