"use client";
import { useContext } from "react";
import About from "../sections/about";
import Blogs from "../sections/blogs";
import Hero from "../sections/hero";
import Project from "../sections/project";
import Skills from "../sections/skills";
import { StyleContext } from "./contexts/StyleContext";
import Contact from "../sections/contact";

export const Main = () => {
  const { isDark } = useContext(StyleContext);
  return (
    <div
      className={`${
        isDark ? "bg-backgroundDarkMode w-full" : ""
      } lg:px-28 duration-500 transition-all`}
    >
      <Hero />
      <About />
      <Skills />
      <Project />
      <Blogs />
      <Contact />
    </div>
  );
};
