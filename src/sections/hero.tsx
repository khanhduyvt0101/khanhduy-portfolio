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

export default function hero() {
  const { isDark } = useContext(StyleContext);
  return (
    <section
      className={`${
        isDark ? "bg-backgroundDarkMode text-white" : ""
      } py-12 flex flex-col items-center justify-center duration-500 transition-all`}
    >
      <MotionDiv delayOffset={0.8}>
        <div className="flex flex-row mb-4 text-[1.4rem] md:text-[2rem] pt-12">
          <h1 className="">
            <MotionText delayOffset={0}>Hi, I'm Khanh Duy!</MotionText>
          </h1>
          <h1 className="wave-emoji pt-3 pl-8">{emoji("👋")}</h1>
        </div>
      </MotionDiv>

      <div className="overflow-hidden p-3">
        <MotionDiv
          className="transition-all h-auto w-[90vw] max-w-[350px] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw]"
          delayOffset={0.4}
        >
          <img src={avatar.src} alt="Khanh Duy" className="w-1/2" />
        </MotionDiv>
      </div>
      <MotionDiv delayOffset={0.8}>
        <div className="flex flex-row items-center">
          <h1>
            <MotionDiv delayOffset={0.8}>Developer</MotionDiv>
          </h1>
          <div className="h-[70px] w-[70px] mb-2">
            <DisplayLottie animationData={developerLottie} />
          </div>
        </div>
      </MotionDiv>

      <div className="mb-12 flex w-full flex-col gap-2 text-center lg:w-[50%]">
        <MotionDiv delayOffset={1.2}>
          <p>Welcome to my personal page!</p>
        </MotionDiv>
        <MotionDiv delayOffset={1.4}>
          <p>
            Just a freelancer <b>NextJs | React | Mobile</b> developer who loves
            to build something cool.
          </p>
        </MotionDiv>
      </div>
      <MotionDiv delayOffset={0.8}>
        <div className="flex lg:flex-row flex-col">
          <button
            className="mr-4 w-40 h-10 bg-moreProjectsButton text-white rounded-md hover:bg-buttonHover mb-8"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <p className="text-sm">
              <b>CONTACT ME</b>
            </p>
          </button>
          <button
            className="mr-4 w-40 h-10 bg-moreProjectsButton text-white rounded-md hover:bg-buttonHover"
            onClick={() => window.open(contactInfo.cv)}
          >
            <p className="text-sm">
              <b>SEE MY RESUME</b>
            </p>
          </button>
        </div>
      </MotionDiv>
    </section>
  );
}
