"use client";
import MotionDiv from "@/src/components/motion-div";
import { Title } from "../components/intro/title";
import { DownloadCVButton } from "../components/intro/downloadCVButton";
import { IntroAnimation } from "../components/intro/introAnimation";

export default function hero() {
  return (
    <div
      className={`lg:ml-[200px] pb-[700px] flex flex-col lg:items-start duration-500 transition-all h-screen justify-center`}
    >
      <div className="h-screen">
        <IntroAnimation />
      </div>

      <MotionDiv delayOffset={0.8}>
        <Title />
      </MotionDiv>

      <div className="mt-[200px] text-center">
        <DownloadCVButton />
      </div>
    </div>
  );
}
