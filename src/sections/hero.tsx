"use client";
import MotionDiv from "@/src/components/motion-div";
import { Title } from "../components/intro/Title";
import { DownloadCVButton } from "../components/intro/DownloadCVButton";
import { IntroAnimation } from "../components/intro/IntroAnimation";

export default function hero() {
  return (
    <section
      className={`lg:pl-[200px] py-12 flex flex-col lg:items-start duration-500 transition-all h-screen justify-center`}
    >
      <div className="absolute right-12 z-[0]">
        <IntroAnimation />
      </div>
      <MotionDiv delayOffset={0.8}>
        <Title />
      </MotionDiv>

      <div className="mt-[200px]">
        <DownloadCVButton />
      </div>
    </section>
  );
}
