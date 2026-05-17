import { TransformersJSWorkerHandler } from "@browser-ai/transformers-js";

const consoleError = console.error.bind(console);

console.error = (...args: Parameters<typeof console.error>) => {
  const [message] = args;

  if (
    typeof message === "string" &&
    (message.startsWith("Error in worker load:") ||
      message.startsWith("Error in transcription worker load:"))
  ) {
    return;
  }

  consoleError(...args);
};

const handler = new TransformersJSWorkerHandler();

self.onmessage = (event: MessageEvent) => {
  handler.onmessage(event);
};
