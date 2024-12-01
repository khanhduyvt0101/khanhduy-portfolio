"use client";

import type { ReactNode } from "react";

import {
  ActionIcon,
  Container,
  Group,
  Image,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandThreads,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import { t } from "i18next";

import classes from "./infor.module.css";

const socialLinks = [
  {
    href: "mailto:khanhduyvt0101@gmail.com",
    icon: IconMail,
  },
  {
    href: "https://github.com/khanhduyvt0101",
    icon: IconBrandGithub,
  },
  {
    href: "https://x.com/@khanhduyvt",
    icon: IconBrandX,
  },
  {
    href: "https://www.facebook.com/khanhduyvt0101",
    icon: IconBrandFacebook,
  },
  {
    href: "https://www.threads.net/@_khanhduy",
    icon: IconBrandThreads,
  },
  {
    href: "https://www.instagram.com/_khanhduy",
    icon: IconBrandInstagram,
  },
];

export function Infor(): ReactNode {
  return (
    <Container size="md">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>{t("infor:title")}</Title>
          <Text c="dimmed" mt="md">
            {t("infor:description")}
          </Text>

          <Group gap="md" mt={30}>
            {socialLinks.map(({ href, icon: Icon }) => (
              <ActionIcon
                key={href}
                component="a"
                href={href}
                size="lg"
                target="_blank"
                variant="default"
              >
                <Icon stroke={1.5} style={{ width: "70%", height: "70%" }} />
              </ActionIcon>
            ))}
          </Group>
        </div>
        <Image className={classes.image} radius="md" src="avatar.webp" />
      </div>
    </Container>
  );
}
