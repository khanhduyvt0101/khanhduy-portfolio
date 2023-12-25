import React from "react";
import styles from "@/src/components/blog/blogCard.module.css";
import { classes } from "@/src/utils/style";

export interface BlogProps {
  title: string;
  description: string;
  link: string;
}

export interface BlogCardProps {
  blog: BlogProps;
  isDark: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, isDark }) => {
  const openUrlInNewTab = (url: string, name: string) => {
    if (!url) {
      console.log(`URL for ${name} not found`);
      return;
    }
    const win = window.open(url, "_blank");
    win?.focus();
  };

  return (
    <div onClick={() => openUrlInNewTab(blog.link, blog.title)}>
      <div
        className={
          isDark
            ? classes(styles.blog_container, styles.dark_mode)
            : classes(styles.blog_container)
        }
      >
        <a
          className={
            isDark
              ? classes(
                  styles.dark_mode,
                  styles.blog_card,
                  styles.blog_card_shadow
                )
              : classes(styles.blog_card)
          }
          href="#blog"
        >
          <h3
            className={
              isDark
                ? classes(styles.blog_title, styles.small_dark)
                : classes(styles.blog_title)
            }
          >
            {blog.title}
          </h3>
          <p
            className={
              isDark
                ? classes(styles.small_dark, styles.small)
                : classes(styles.small)
            }
          >
            {blog.description}
          </p>
          <div className={classes(styles.go_corner)}>
            <div className={classes(styles.go_arrow)}>→</div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default BlogCard;
