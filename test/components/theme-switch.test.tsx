import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeSwitch } from "~/components/theme-switch";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

const useThemeMock = vi.mocked(useTheme);
const setTheme = vi.fn();

describe("ThemeSwitch", () => {
  beforeEach(() => {
    setTheme.mockClear();
    useThemeMock.mockReturnValue({
      setTheme,
      theme: "system",
      themes: ["system", "light", "dark"],
    });
  });

  it.each(["System", "Light", "Dark"])(
    "selects the %s theme",
    async (label) => {
      const user = userEvent.setup();
      render(<ThemeSwitch />);

      await user.click(
        screen.getByRole("button", { name: "Select color theme" }),
      );
      await user.click(screen.getByRole("menuitemradio", { name: label }));

      expect(setTheme).toHaveBeenCalledWith(label.toLowerCase());
    },
  );

  it("falls back to System when no saved preference exists", async () => {
    const user = userEvent.setup();
    useThemeMock.mockReturnValue({
      setTheme,
      theme: undefined,
      themes: ["system", "light", "dark"],
    });
    render(<ThemeSwitch />);

    await user.click(
      screen.getByRole("button", { name: "Select color theme" }),
    );

    expect(
      screen.getByRole("menuitemradio", { name: "System" }),
    ).toHaveAttribute("data-state", "checked");
  });
});
