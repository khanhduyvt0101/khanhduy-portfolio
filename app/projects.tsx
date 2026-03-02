"use client";

import {
	Badge,
	Button,
	Card,
	Container,
	Group,
	Image,
	SimpleGrid,
	Text,
	Title,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import type { ReactNode } from "react";

import classes from "./projects.module.css";

const projects = [
	{
		title: "ChatAcademia",
		description:
			"Your AI-powered research sidekick. Chat with multiple advanced models (GPT-4, Claude 3, Gemini), discover research gaps, and search millions of papers instantly. Trusted by 2,000+ researchers.",
		link: "https://chatacademia.com",
		image:
			"https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
		tags: ["AI Platform", "SaaS", "Next.js", "Research"],
		category: "SaaS Product",
	},
	{
		title: "PDFVector",
		description:
			"The scalable AI-powered PDF processing API. Extract structured data from complex documents with high accuracy using generic schemas. Perfect for building RAG pipelines and document analysis tools.",
		link: "https://pdfvector.com",
		image:
			"https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
		tags: ["API", "Developer Tool", "PDF Processing", "AI"],
		category: "Developer Tool",
	},
];

export function Projects(): ReactNode {
	return (
		<Container className={classes.wrapper} size="lg">
			<Title className={classes.title} order={2}>
				Featured Projects
			</Title>

			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
				{projects.map((project) => (
					<Card
						className={classes.card}
						key={project.title}
						padding="md"
						radius="md"
						withBorder
					>
						<Card.Section>
							<Image alt={project.title} height={200} src={project.image} />
						</Card.Section>

						<Card.Section className={classes.section} mt="md">
							<Group justify="space-between">
								<Text fw={700} fz="lg">
									{project.title}
								</Text>
								<Badge variant="light">{project.category}</Badge>
							</Group>
							<Text c="dimmed" mt="xs" size="sm">
								{project.description}
							</Text>
						</Card.Section>

						<Card.Section className={classes.section}>
							<Text c="dimmed" className={classes.label} mt="md">
								Technologies
							</Text>
							<Group gap={7} mb="md">
								{project.tags.map((tag) => (
									<Badge key={tag} variant="outline">
										{tag}
									</Badge>
								))}
							</Group>
						</Card.Section>

						<Group mt="xs">
							<Button
								component="a"
								fullWidth
								href={project.link}
								radius="md"
								rightSection={<IconExternalLink size={14} />}
								target="_blank"
							>
								Visit Website
							</Button>
						</Group>
					</Card>
				))}
			</SimpleGrid>
		</Container>
	);
}
