"use client";

import {
	Badge,
	Button,
	Card,
	Container,
	Group,
	SimpleGrid,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { IconFileTypePdf, IconSchool } from "@tabler/icons-react";
import type { ReactNode } from "react";

import classes from "./projects.module.css";

const projects = [
	{
		title: "ChatAcademia",
		description:
			"All-in-one AI platform for researchers. Chat with multiple AI models (GPT-4, Claude 3, Gemini), find research gaps, and search millions of papers across Google Scholar and PubMed.",
		link: "https://chatacademia.com",
		icon: IconSchool,
		tags: ["AI", "Research", "SaaS", "Next.js"],
		color: "blue",
	},
	{
		title: "PDFVector",
		description:
			"AI-powered PDF processing API for developers. Extract structured data from PDFs, Word docs, and images using generic schemas. Scale your RAG pipelines with high-accuracy document parsing.",
		link: "https://pdfvector.com",
		icon: IconFileTypePdf,
		tags: ["API", "Developer Tool", "PDF", "AI"],
		color: "red",
	},
];

export function Projects(): ReactNode {
	return (
		<Container className={classes.wrapper} size="lg">
			<Title className={classes.title} ta="center">
				Projects I'm Working On
			</Title>

			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
				{projects.map((project) => {
					const Icon = project.icon;
					return (
						<Card
							className={classes.card}
							key={project.title}
							padding="lg"
							radius="md"
							withBorder
						>
							<Card.Section className={classes.header}>
								<ThemeIcon
									color={project.color}
									radius="md"
									size={50}
									variant="light"
								>
									<Icon size={30} stroke={1.5} />
								</ThemeIcon>
								<Text fw={700} fz="xl" mt="md">
									{project.title}
								</Text>
							</Card.Section>

							<Text c="dimmed" mt="sm" size="sm">
								{project.description}
							</Text>

							<Group gap={7} mt="md">
								{project.tags.map((tag) => (
									<Badge color={project.color} key={tag} variant="light">
										{tag}
									</Badge>
								))}
							</Group>

							<Button
								component="a"
								color={project.color}
								fullWidth
								href={project.link}
								mt="xl"
								radius="md"
								target="_blank"
								variant="light"
							>
								Visit Website
							</Button>
						</Card>
					);
				})}
			</SimpleGrid>
		</Container>
	);
}
