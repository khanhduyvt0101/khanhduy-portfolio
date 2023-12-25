"use client";
import MotionText from "@/src/components/motion-text";
import MotionDiv from "@/src/components/motion-div";
import avatar from "@/src/assets/photo/avatar.png";
import { contactInfo } from "../portfolio";
import { useContext } from "react";
import { StyleContext } from "../app/contexts/StyleContext";
import emoji from "react-easy-emoji";
import DisplayLottie from "../components/displayLottie/DisplayLottie";
import developerLottie from "@/src/assets/lottie/developer.json";
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
