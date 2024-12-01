"use client";

import type { ReactNode } from "react";

import { Accordion, Container, Title } from "@mantine/core";
import { t } from "i18next";

import classes from "./experience.module.css";

export function Experience(): ReactNode {
  return (
    <Container className={classes.wrapper} size="sm">
      <Title className={classes.title} ta="center">
        {t("experience:title")}
      </Title>

      <Accordion variant="separated">
        <Accordion.Item className={classes.item} value="flutter-kms-2024">
          <Accordion.Control>
            {t("experience:flutterKMS2024.title")}
          </Accordion.Control>
          <Accordion.Panel>
            {t("experience:flutterKMS2024.description")}
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="nextjs-fullstack">
          <Accordion.Control>{t("experience:nextjs.title")}</Accordion.Control>
          <Accordion.Panel>
            {t("experience:nextjs.description")}
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="react-native">
          <Accordion.Control>
            {t("experience:reactNative.title")}
          </Accordion.Control>
          <Accordion.Panel>
            {t("experience:reactNative.description")}
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="nodejs-kms">
          <Accordion.Control>{t("experience:nodejs.title")}</Accordion.Control>
          <Accordion.Panel>
            {t("experience:nodejs.description")}
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="flutter-kms-2022">
          <Accordion.Control>
            {t("experience:flutterKMS2022.title")}
          </Accordion.Control>
          <Accordion.Panel>
            {t("experience:flutterKMS2022.description")}
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="mobile-geekup">
          <Accordion.Control>
            {t("experience:mobileGeekup.title")}
          </Accordion.Control>
          <Accordion.Panel>
            {t("experience:mobileGeekup.description")}
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="mobile-aziworld">
          <Accordion.Control>
            {t("experience:mobileAziworld.title")}
          </Accordion.Control>
          <Accordion.Panel>
            {t("experience:mobileAziworld.description")}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
