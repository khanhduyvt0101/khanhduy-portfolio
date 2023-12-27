"use client";
import { useContext, useEffect, useState } from "react";
import About from "../sections/about";
import Blogs from "../sections/blogs";
import Hero from "../sections/hero";
import Project from "../sections/project";
import Skills from "../sections/skills";
import { StyleContext } from "./contexts/StyleContext";
import Contact from "../sections/contact";
import { SplashScreen } from "../components/splashScreen/SplashScreen";
import { ToggleSwitch } from "../components/toggleSwitch/ToggleSwitch";
import Header from "../components/header";
import BackToTop from "../components/back-to-top";

export const Main = () => {
  const { isDark } = useContext(StyleContext);
  const [isShowingSplashAnimation, setIsShowingSplashAnimation] =
    useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(
      () => setIsShowingSplashAnimation(false),
      2000
    );
    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  return isShowingSplashAnimation ? (
    <SplashScreen isDark={isDark} />
  ) : (
    <>
      <ToggleSwitch />
      <Header />
      <div
        className={`${
          isDark ? "bg-backgroundDarkMode text-white" : "bg-white"
        } duration-500 transition-all`}
      >
        <div className={`lg:px-28`}>
          <Hero />
          <About />
          <Skills />
          <Project />
          <Blogs />
          <Contact />
        </div>
      </div>
      <BackToTop />
    </>
  );
};
