import About from "@/src/sections/about";
import Hero from "@/src/sections/hero";
import Skills from "@/src/sections/skills";
import Contact from "@/src/sections/contact";
import Project from "@/src/sections/project";
import Blogs from "@/src/sections/blogs";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Project />
      <Blogs />
      <Contact />
    </>
  );
}
