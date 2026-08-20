import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

describe("shadcn UI primitives", () => {
  it("renders a native button", () => {
    render(
      <>
        <Button>Default</Button>
        <Button variant="secondary">Contact</Button>
      </>,
    );

    expect(screen.getByRole("button", { name: "Default" })).toHaveAttribute(
      "data-variant",
      "default",
    );
    expect(screen.getByRole("button", { name: "Contact" })).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });

  it("renders avatar groups, badges, and counts", () => {
    render(
      <AvatarGroup>
        <Avatar size="sm">
          <AvatarFallback>KD</AvatarFallback>
          <AvatarBadge data-testid="badge" />
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>,
    );

    expect(screen.getByText("KD")).toBeVisible();
    expect(screen.getByText("+2")).toBeVisible();
    expect(screen.getByTestId("badge")).toHaveAttribute(
      "data-slot",
      "avatar-badge",
    );
  });

  it("uses the dropdown menu default alignment", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Theme</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="system">
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Theme" }));

    expect(screen.getByRole("menuitemradio", { name: "System" })).toBeVisible();
  });
});
