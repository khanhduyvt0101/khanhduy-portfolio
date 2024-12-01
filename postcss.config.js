import { DEFAULT_THEME } from "@mantine/core";

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    "postcss-preset-mantine": {},
    "postcss-simple-vars": {
      variables: Object.fromEntries(
        Object.entries(DEFAULT_THEME.breakpoints).map(([key, value]) => [
          `mantine-breakpoint-${key}`,
          value,
        ]),
      ),
    },
  },
};
