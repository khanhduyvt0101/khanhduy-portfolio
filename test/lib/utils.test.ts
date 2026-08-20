import { describe, expect, it } from "vitest";

import { cn } from "~/lib/utils";

describe("cn", () => {
  it("combines conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", ["font-medium", "px-4"])).toBe(
      "font-medium px-4",
    );
  });
});
