import ContactList from "@/components/contact-list";
import MotionText from "@/components/motion-text";
import MotionDiv from "@/components/motion-div";
import avatar from "@/assets/photo/avatar.png";

export default function hero() {
  return (
    <section className="my-8 flex flex-col items-center justify-center">
      <h1 className="mb-4 text-[1.4rem] md:text-[2rem]">
        <MotionText delayOffset={0}>Hi, I'm Khanh Duy! 👋</MotionText>
      </h1>
      <div className="overflow-hidden p-3">
        <MotionDiv
          className="transition-all h-auto w-[90vw] max-w-[350px] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw]"
          delayOffset={0.4}
        >
          <img src={avatar.src} alt="Khanh Duy" className="w-1/2" />
        </MotionDiv>
      </div>
      <h1>
        <MotionDiv delayOffset={0.8}>Developer 🧑🏻‍💻</MotionDiv>
      </h1>
      <div className="my-12 flex w-full flex-col gap-2 text-center lg:w-[50%]">
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
      <div className="my-8">
        <ContactList delayOffset={1.45} showWhenInView={false} />
      </div>
    </section>
  );
}
