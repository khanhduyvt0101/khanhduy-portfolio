import ContactList from "@/src/components/contact-list";
import MotionDiv from "@/src/components/motion-div";
import reachOutLottie from "@/src/assets/lottie/reachout.json";
import DisplayLottie from "../components/displayLottie/displayLottie";
import { FooterContact } from "../components/contact/footerContact";

export default function contact() {
  return (
    <section id="contact">
      <div
        className={`pb-28 flex flex-row items-center justify-center gap-5 text-center pt-8`}
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
      </div>
    </section>
  );
}
