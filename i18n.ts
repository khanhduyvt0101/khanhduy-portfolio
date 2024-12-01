export const translation = {
  asCount: "{{count, number}}",
  asDate: "{{date, datetime}}",
  site: {
    title: "dbsky",
    description: "Open-source public analytics for any Bluesky accounts",
    madeBy: "Made by <0>@phuctm97</0>",
  },
  hero: {
    title: "Open-source analytics for any <0>Bluesky</0> account",
    highlights:
      "<0>See public analytics of any Bluesky account</0><0>Contribute to add features you need</0><0>Self-host your own instance</0>",
  },
  colorScheme: {
    light: "Light",
    dark: "Dark",
    auto: "Auto",
  },
  error: {
    title: "Error",
    message: "Something went wrong.",
    close: "Close",
  },
  notFound: {
    title: "404",
    message: "The page you are looking for does not exist or has been moved.",
  },
} as const;
