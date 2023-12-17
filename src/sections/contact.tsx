import ContactList from "@/src/components/contact-list";
import MotionDiv from "@/src/components/motion-div";
import { FooterContact } from "../components/contact/FooterContact";
import { StyleContext } from "../app/contexts/StyleContext";
import { useContext } from "react";

export default function contact() {
  const { isDark } = useContext(StyleContext);
  return (
    <section
      className={`${
        isDark ? "dark-mode" : ""
      } pb-28 flex flex-col items-center gap-5 text-center pt-8`}
      id="contact"
    >
      <FooterContact />
      <ContactList />
    </section>
  );
}
