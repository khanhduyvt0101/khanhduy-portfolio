"use client";

import type { IconProps } from "@tabler/icons-react";
import type { ReactNode } from "react";

import {
  isMantineColorScheme,
  rem,
  SegmentedControl,
  Skeleton,
  useMantineColorScheme,
  VisuallyHidden,
} from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconDevices, IconMoon, IconSun } from "@tabler/icons-react";
import { t } from "i18next";

import { defaultColorScheme } from "~/lib/default-color-scheme";

const iconProps: IconProps = {
  stroke: 1.5,
  style: { width: rem(20), height: rem(20), display: "block" },
};

export function ColorSchemeControl(): ReactNode {
  const mounted = useMounted();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Skeleton visible={!mounted} width="auto">
      <SegmentedControl
        data={[
          {
            value: "light",
            label: (
              <>
                <IconSun {...iconProps} />
                <VisuallyHidden>{t("colorScheme.light")}</VisuallyHidden>
              </>
            ),
          },
          {
            value: "dark",
            label: (
              <>
                <IconMoon {...iconProps} />
                <VisuallyHidden>{t("colorScheme.dark")}</VisuallyHidden>
              </>
            ),
          },
          {
            value: "auto",
            label: (
              <>
                <IconDevices {...iconProps} />
                <VisuallyHidden>{t("colorScheme.auto")}</VisuallyHidden>
              </>
            ),
          },
        ]}
        value={mounted ? colorScheme : defaultColorScheme}
        withItemsBorders={false}
        onChange={(value) => {
          if (!isMantineColorScheme(value))
            throw new Error("Failed to change color scheme");
          setColorScheme(value);
        }}
      />
    </Skeleton>
  );
}
