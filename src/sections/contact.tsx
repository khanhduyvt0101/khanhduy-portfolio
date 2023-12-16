import ContactList from "@/src/components/contact-list";
import MotionDiv from "@/src/components/motion-div";
import { FooterContact } from "../components/contact/FooterContact";

export default function contact() {
  return (
    <section
      className="my-4 mb-28 flex flex-col items-center gap-5 text-center md:mt-8"
      id="contact"
    >
      <FooterContact />
      <ContactList />
    </section>
  );
}
