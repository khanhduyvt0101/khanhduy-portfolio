import React from "react";

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
    <div
      onClick={() => openUrlInNewTab(blog.link, blog.title)}
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } p-4 rounded-sm shadow-md w-[350px] h-[220px] relative hover:shadow-2xl flex flex-col items-center`}
    >
      <h3 className="text-lg font-semibold">{blog.title}</h3>
      <p className="text-sm line-clamp-5">{blog.description}</p>
      <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 overflow-hidden bg-moreProjectsButton rounded-[0_16px_0_128px]">
        <div className="-mt-1 -mr-1 text-white font-[courier,sans]">→</div>
      </div>
    </div>
  );
};

export default BlogCard;
