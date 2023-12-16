import About from "@/src/sections/about";
import Hero from "@/src/sections/hero";
import Skills from "@/src/sections/skills";
import Projects from "@/src/components/project/GithubProjects";
import Contact from "@/src/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
    </>
  );
}
