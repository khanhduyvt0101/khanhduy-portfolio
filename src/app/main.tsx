"use client";
import { useContext, useEffect, useState } from "react";
import About from "../sections/about";
import Blogs from "../sections/blogs";
import Hero from "../sections/hero";
import Project from "../sections/project";
import Skills from "../sections/skills";
import { StyleContext } from "./contexts/styleContext";
import Contact from "../sections/contact";
import { SplashScreen } from "../components/splashScreen/splashScreen";
import { ToggleSwitch } from "../components/toggleSwitch/toggleSwitch";
import Header from "../components/header";
import BackToTop from "../components/back-to-top";
import { IntroAnimation } from "../components/intro/introAnimation";

export const Main = () => {
  const { isDark } = useContext(StyleContext);
  const [isShowingSplashAnimation, setIsShowingSplashAnimation] =
    useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsShowingSplashAnimation(false);
    }, 2000);
  }, []);

  return isShowingSplashAnimation ? (
    <SplashScreen isDark={isDark} />
  ) : (
    <>
      <div className="fixed w-screen h-screen">
        <IntroAnimation />
      </div>
      <ToggleSwitch />
      <Header />
      <div
        className={`${
          isDark ? "bg-backgroundDarkMode text-white" : "bg-white"
        } duration-500 transition-all`}
      >
        <div className={`lg:px-28`}>
          <Hero />
          <Project />
          <About />
          <Skills />
          <Blogs />
          <Contact />
        </div>
      </div>
      <BackToTop />
    </>
  );
};
