import { ArrowUpRight } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import chatacademiaLogo from "~/assets/products/chatacademia.webp";
import orchesteroLogo from "~/assets/products/orchestero.webp";
import pdfvectorLogo from "~/assets/products/pdfvector.webp";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { developerProjects } from "~/lib/profile";

const projectLogos: Record<
  (typeof developerProjects)[number]["label"],
  StaticImageData
> = {
  ChatAcademia: chatacademiaLogo,
  "PDF Vector": pdfvectorLogo,
  Orchestero: orchesteroLogo,
};

export function DeveloperShowcase(): ReactNode {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(18rem,0.55fr)] md:items-end">
          <h2 className="max-w-3xl text-balance font-heading text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Products I build
          </h2>
          <p className="max-w-xl text-pretty text-muted-foreground leading-7 md:justify-self-end">
            Platforms I help bring to life as a developer, spanning research,
            document intelligence, and dependable AI assistance.
          </p>
        </div>

        <div>
          <Separator />
          {developerProjects.map((project, index) => (
            <div key={project.href}>
              <article className="group grid gap-8 py-10 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:items-center md:py-14">
                <div
                  className={`overflow-hidden rounded-2xl bg-muted shadow-xl transition-transform duration-700 ease-out group-hover:scale-105 ${index % 2 === 1 ? "md:rotate-2" : "md:-rotate-2"}`}
                >
                  <Image
                    alt={`${project.label} logo`}
                    className="size-32 object-cover md:size-40"
                    placeholder="blur"
                    src={projectLogos[project.label]}
                  />
                </div>
                <div className="flex max-w-3xl flex-col gap-3">
                  <Badge className="w-fit" variant="secondary">
                    Developer
                  </Badge>
                  <h3 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                    {project.label}
                  </h3>
                  <p className="max-w-2xl text-lg text-muted-foreground leading-7">
                    {project.description}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {project.domain}
                  </p>
                </div>
                <Button asChild size="lg" variant="outline">
                  <a
                    aria-label={`Visit ${project.label}`}
                    href={project.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Visit product
                    <ArrowUpRight data-icon="inline-end" />
                  </a>
                </Button>
              </article>
              <Separator />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
