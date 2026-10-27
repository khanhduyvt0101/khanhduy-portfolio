import {
  appLinks,
  developerProjects,
  discordBot,
  profileSameAs,
} from "~/lib/profile";
import { defaultSeoDescription, siteName, siteUrl } from "~/lib/seo";

export const dynamic = "force-static";

/** Plain-text summary for AI assistants and answer engines (llmstxt.org). */
export function GET(): Response {
  const lines = [
    `# ${siteName}`,
    "",
    `> ${defaultSeoDescription}`,
    "",
    "## Apps and bots I own",
    ...[...appLinks, discordBot].map(
      (app) =>
        `- [${app.label}](${app.href}) (${app.platform}): ${app.description}`,
    ),
    "",
    "## Products I help build as a developer",
    ...developerProjects.map(
      (project) =>
        `- [${project.label}](${project.href}): ${project.description}`,
    ),
    "",
    "## Contact and profiles",
    "- Email: khanhduyvt0101@gmail.com",
    `- Website: ${siteUrl}`,
    ...profileSameAs.map((url) => `- ${url}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
