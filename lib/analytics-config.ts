import type { AnalyticsConfig } from "./analytics";
import { appLinks, developerProjects, discordBot } from "./profile";

export const portfolioAnalytics: AnalyticsConfig = {
  id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  host: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    .hostname,
  titles: { "/": "Khanh Duy" },
  actions: Object.fromEntries([
    ...appLinks.flatMap((app) =>
      ["owner_showcase", "footer"].map((placement) => [
        `${placement}:${app.label}`,
        {
          href: app.href,
          name: "select_content",
          params: {
            content_type: "owner_product",
            item_id: app.label.toLowerCase().replaceAll(" ", "-"),
            link_placement: placement,
          },
        },
      ]),
    ),
    [
      "owner_showcase:Voxy",
      {
        href: discordBot.href,
        name: "select_content",
        params: {
          content_type: "owner_product",
          item_id: "voxy",
          link_placement: "owner_showcase",
        },
      },
    ],
    ...developerProjects.map((project) => [
      `developer_showcase:${project.label}`,
      {
        href: project.href,
        name: "select_content",
        params: {
          content_type: "developer_project",
          item_id: project.label.toLowerCase().replaceAll(" ", "-"),
          link_placement: "developer_showcase",
        },
      },
    ]),
    ...["hero", "footer"].flatMap((placement) => [
      [
        `${placement}:Email`,
        {
          href: "mailto:khanhduyvt0101@gmail.com",
          name: "contact_click",
          params: { contact_method: "email", link_placement: placement },
        },
      ],
      [
        `${placement}:LinkedIn`,
        {
          href: "https://www.linkedin.com/in/buitrongkhanhduy/",
          name: "contact_click",
          params: { contact_method: "linkedin", link_placement: placement },
        },
      ],
    ]),
  ]),
};
