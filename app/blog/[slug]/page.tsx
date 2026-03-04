import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import blogs from "~/data/blogs.json";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: PageProps): Promise<ReactNode> {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Post not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/blog">
              <Button variant="outline">Back to Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relatedPosts = blogs
    .filter((b) => b.id !== post.id && b.category === post.category)
    .slice(0, 2);

  return (
    <article className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
              {post.category}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.publishedAt}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />5 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <p className="font-semibold text-foreground">{post.author}</p>
                <CardDescription>Author</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        <div className="relative h-64 md:h-96 w-full mb-10 rounded-2xl overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="max-w-2xl mx-auto">
          <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-medium">
            {post.excerpt}
          </p>
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="leading-relaxed text-foreground/90">{post.content}</p>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-wrap gap-2 mb-12">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={related.coverImage}
                        alt={related.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-background/90 backdrop-blur text-foreground">
                          {related.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {related.excerpt}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
