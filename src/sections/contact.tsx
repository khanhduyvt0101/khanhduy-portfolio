import ContactList from "@/src/components/contact-list";
import MotionDiv from "@/src/components/motion-div";
import { FooterContact } from "../components/contact/FooterContact";
import { StyleContext } from "../app/contexts/StyleContext";
import { useContext } from "react";
import DisplayLottie from "../components/displayLottie/DisplayLottie";
import reachOutLottie from "@/src/assets/lottie/reachout.json";

export default function contact() {
  const { isDark } = useContext(StyleContext);
  return (
    <section
      className={`${
        isDark ? "dark-mode" : ""
      } pb-28 flex flex-row items-center justify-center gap-5 text-center pt-8`}
      id="contact"
    >
      <MotionDiv>
        <div className="h-[400px] w-[400px]">
          <DisplayLottie animationData={reachOutLottie} />
        </div>
      </MotionDiv>
      <div className="flex flex-col items-center">
        <FooterContact />
        <ContactList />
      </div>
    </section>
  );
}
