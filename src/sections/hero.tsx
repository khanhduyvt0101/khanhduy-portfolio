"use client";
import MotionDiv from "@/src/components/motion-div";
import { useContext } from "react";
import { StyleContext } from "../app/contexts/StyleContext";
import { Title } from "../components/intro/Title";

export default function hero() {
  const { isDark } = useContext(StyleContext);
  return (
    <section
      className={`${
        isDark ? "bg-backgroundDarkMode text-white" : ""
      } lg:pl-[200px] py-12 flex flex-col lg:items-start duration-500 transition-all h-screen justify-center`}
    >
      <MotionDiv delayOffset={0.8}>
        <Title />
      </MotionDiv>
    </section>
  );
}
