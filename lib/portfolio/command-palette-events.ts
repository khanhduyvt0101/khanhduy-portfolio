export const portfolioCommandPaletteOpenEvent =
  "portfolio-command-palette:open";

export const portfolioCommandPaletteShortcutLabel = "Cmd/Ctrl + K";

export type PortfolioCommandPaletteOpenDetail = {
  source: "header_search" | "keyboard_shortcut";
};

type PortfolioCommandPaletteShortcutEvent = Pick<
  KeyboardEvent,
  "altKey" | "code" | "ctrlKey" | "isComposing" | "key" | "metaKey"
>;

export function isPortfolioCommandPaletteShortcut(
  event: PortfolioCommandPaletteShortcutEvent,
) {
  return (
    !event.altKey &&
    !event.isComposing &&
    (event.metaKey || event.ctrlKey) &&
    (event.key.toLowerCase() === "k" || event.code === "KeyK")
  );
}
