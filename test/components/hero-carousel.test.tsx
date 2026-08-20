import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroCarousel } from "~/components/hero-carousel";

describe("HeroCarousel", () => {
  it("starts with the avatar and navigates through every photo", () => {
    render(<HeroCarousel />);

    expect(
      screen.getByRole("button", { name: "Show photo 1" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Portrait of Khanh Duy")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(
      screen.getByRole("button", { name: "Show photo 2" }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Show photo 3" }));
    expect(
      screen.getByText(
        "Khanh Duy posing by a pool surrounded by tropical plants",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(
      screen.getByRole("button", { name: "Show photo 2" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("loops backward from the default portrait", () => {
    render(<HeroCarousel />);

    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));

    expect(
      screen.getByRole("button", { name: "Show photo 3" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
