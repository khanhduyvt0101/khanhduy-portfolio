import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
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
import blogs from "~/data/blogs.json";

// Blog page displaying articles with featured post, categories, and recent posts
export default function BlogPage(): ReactNode {
	const featuredPost = blogs[0];
	const recentPosts = blogs.slice(1);

	const categories = Array.from(new Set(blogs.map((b) => b.category)));

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-12 max-w-6xl">
				<div className="mb-12">
					<Badge variant="outline" className="mb-4">
						Blog
					</Badge>
					<h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
						Latest Articles
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl">
						Thoughts on development, design, and building products that matter.
					</p>
				</div>

				<section className="mb-16">
					<Link href={`/blog/${featuredPost.slug}`} className="group">
						<Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-border">
							<div className="grid lg:grid-cols-2 gap-0">
								<div className="relative h-64 lg:h-auto min-h-[300px]">
									<img
										src={featuredPost.coverImage}
										alt={featuredPost.title}
										className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
								</div>
								<div className="p-8 lg:p-12 flex flex-col justify-center">
									<div className="flex items-center gap-3 mb-4 flex-wrap">
										<Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
											{featuredPost.category}
										</Badge>
										<span className="text-sm text-muted-foreground flex items-center gap-1">
											<Calendar className="w-4 h-4" />
											{featuredPost.publishedAt}
										</span>
									</div>
									<CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-3">
										{featuredPost.title}
									</CardTitle>
									<CardDescription className="text-base mb-6 line-clamp-3">
										{featuredPost.excerpt}
									</CardDescription>
									<div className="flex items-center gap-3 mt-auto">
										<img
											src={featuredPost.authorAvatar}
											alt={featuredPost.author}
											className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
										/>
										<div>
											<p className="font-medium text-foreground">
												{featuredPost.author}
											</p>
											<p className="text-sm text-muted-foreground">
												5 min read
											</p>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</Link>
				</section>

				<section className="mb-12">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-2xl font-bold text-foreground">Categories</h2>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{categories.map((category) => (
							<Card
								key={category}
								className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/30"
							>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
										{category}
									</CardTitle>
									<CardDescription>
										{blogs.filter((b) => b.category === category).length}{" "}
										articles
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button
										variant="ghost"
										className="w-full justify-between group-hover:bg-primary/5"
										asChild
									>
										<Link href={`/blog?category=${category}`}>
											View all
											<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section>
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-2xl font-bold text-foreground">Recent Posts</h2>
						<Button variant="ghost" asChild>
							<Link href="/blog">
								View all
								<ArrowRight className="w-4 h-4 ml-1" />
							</Link>
						</Button>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{recentPosts.map((post) => (
							<Link key={post.id} href={`/blog/${post.slug}`}>
								<Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden group">
									<div className="relative h-48 overflow-hidden">
										<img
											src={post.coverImage}
											alt={post.title}
											className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
										/>
										<div className="absolute top-3 left-3">
											<Badge className="bg-background/90 backdrop-blur text-foreground hover:bg-background/90">
												{post.category}
											</Badge>
										</div>
									</div>
									<CardHeader className="pb-2">
										<CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
											{post.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-0">
										<CardDescription className="line-clamp-2">
											{post.excerpt}
										</CardDescription>
									</CardContent>
									<CardFooter className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<User className="w-4 h-4" />
											{post.author}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="w-4 h-4" />5 min
										</span>
									</CardFooter>
								</Card>
							</Link>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
