import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { Pill } from "~/components/kibo-ui/pill";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const projects = [
  {
    title: "LofiHood",
    description:
      "A local-first lofi player for the Mac menu bar with bundled tracks, mood filters, local albums, imports, shortcuts, and a sleep timer.",
    link: "https://lofihood.com",
    image: "https://lofihood.com/opengraph-image.png",
    tags: ["macOS", "Menu Bar", "Local-first", "Music"],
    category: "macOS App",
  },
  {
    title: "SpotterFuel",
    description:
      "An iPhone fitness app for marking blocked gym equipment and finding same-muscle alternatives when a crowded station gets in the way.",
    link: "https://spotterfuel.com",
    image: "https://spotterfuel.com/opengraph-image",
    tags: ["iPhone", "Fitness", "Exercise Swaps", "App Store"],
    category: "iOS App",
  },
  {
    title: "CampusCue",
    description:
      "A local-first iOS app that turns school notices into reviewed action cards before parents add anything to Calendar or Reminders.",
    link: "https://campuscue.app",
    image: "https://campuscue.app/opengraph-image",
    tags: ["iOS", "Parents", "School Notices", "TestFlight"],
    category: "iOS App",
  },
];

export function Projects(): ReactNode {
  return (
    <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-12 text-foreground">
        Featured Projects
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Card
            key={project.title}
            className="flex flex-col gap-0 overflow-hidden py-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-card"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                alt={project.title}
                src={project.image}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <CardHeader className="pt-6 pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold">
                  {project.title}
                </CardTitle>
                <Pill className="shrink-0">{project.category}</Pill>
              </div>
              <CardDescription className="text-sm mt-2 text-muted-foreground line-clamp-3">
                {project.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Technologies
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Pill key={tag}>{tag}</Pill>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-6 mt-auto">
              <Button asChild className="w-full" size="lg">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Visit Website
                  <IconExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
