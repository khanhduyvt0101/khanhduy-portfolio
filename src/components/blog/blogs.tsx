"use client";
import React, { useEffect, useState, useContext } from "react";
import { Fade } from "react-awesome-reveal";
import BlogCard, { BlogProps } from "./blogsCard";
import MotionDiv from "../motion-div";
import { StyleContext } from "@/src/app/contexts/StyleContext";

const Blogs: React.FC = () => {
  const [mediumBlogs, setMediumBlogs] = useState<BlogProps[]>([]);
  const { isDark } = useContext(StyleContext);

  const extractTextContent = (html: string) => {
    return typeof html === "string"
      ? html
          .split("p>")
          .filter((el) => !el.includes(">"))
          .map((el) => el.replace("</", ".").replace("<", ""))
          .join(" ")
      : NaN;
  };

  useEffect(() => {
    fetch("/route/medium")
      .then((result) => {
        if (result.ok) {
          return result.json();
        }
        throw result;
      })
      .then((response) => {
        setMediumBlogs(response as BlogProps[]);
      })
      .catch((error) => {
        console.error(`${error} (error in Blogs section)`);
        setMediumBlogs([]);
      });
  }, []);

  return (
    <Fade duration={2000}>
      <div className={`my-12 items-center justify-center px-12`}>
        <MotionDiv>
          <div className="mb-8">
            <h1 className="my-2 w-full text-center text-3xl font-bold">
              My Blogs
            </h1>
            <p className="text-light text-sm">
              WITH LOVE FOR DEVELOPING COOL STUFF, I LOVE TO WRITE AND TEACH
              OTHERS WHAT I HAVE LEARNT.
            </p>
          </div>
        </MotionDiv>
        <MotionDiv>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mediumBlogs.map((blog, index) => (
              <BlogCard
                key={blog.link}
                blog={{
                  link: blog.link,
                  title: blog.title,
                  description: extractTextContent(blog.description) as string,
                }}
                isDark={isDark ?? false}
              />
            ))}
          </div>
        </MotionDiv>
      </div>
    </Fade>
  );
};

export default Blogs;
