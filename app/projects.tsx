"use client";

import { IconExternalLink } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
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
    title: "ChatAcademia",
    description:
      "Your AI-powered research sidekick. Chat with multiple advanced models (GPT-4, Claude 3, Gemini), discover research gaps, and search millions of papers instantly. Trusted by 2,000+ researchers.",
    link: "https://chatacademia.com",
    image: "/products/chatacademia-og.png",
    tags: ["AI Platform", "SaaS", "Next.js", "Research"],
    category: "SaaS Product",
  },
  {
    title: "PDFVector",
    description:
      "The scalable AI-powered PDF processing API. Extract structured data from complex documents with high accuracy using generic schemas. Perfect for building RAG pipelines and document analysis tools.",
    link: "https://pdfvector.com",
    image: "/products/pdfvector-og.png",
    tags: ["API", "Developer Tool", "PDF Processing", "AI"],
    category: "Developer Tool",
  },
];

export function Projects(): ReactNode {
  return (
    <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-12 text-foreground">
        Featured Projects
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <Card
            key={project.title}
            className="flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg bg-card"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                alt={project.title}
                src={project.image}
                className="object-cover w-full h-full"
              />
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold">
                  {project.title}
                </CardTitle>
                <Badge variant="secondary" className="shrink-0">
                  {project.category}
                </Badge>
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
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-0 mt-auto">
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
