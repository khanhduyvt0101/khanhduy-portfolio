"use client";
import { useContext, useState } from "react";
import { StyleContext } from "../app/contexts/styleContext";
import KDDark from "@/src/assets/svg/KDDark.svg";
import KDFocus from "@/src/assets/svg/KDFocus.svg";
import KDLight from "@/src/assets/svg/KDLight.svg";
import Image from "next/image";

export default function Header() {
  const { isDark } = useContext(StyleContext);
  const [isHovered, setIsHovered] = useState(false);
  const links = ["project", "about", "skills", "blogs", "contact"];

  return (
    <>
      <nav
        className={`${
          isDark ? "text-white" : ""
        } justify-center fixed left-0 top-0 flex-col select-none font-light px-4 py-8 duration-500 transition-all hidden md:flex h-screen`}
      >
        <Image
          className="mb-20"
          src={isHovered ? KDFocus : isDark ? KDLight : KDDark}
          alt="logo"
          width={80}
          height={63}
          onClick={() => {
            window.location.href = "./";
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        <div className="flex flex-col text-base items-center justify-between h-3/4">
          {links.map((link) => (
            <button
              key={link}
              className={`hover:bg-mask hover:text-white rounded-[10px] px-[10px] py-1 text-normal ${
                !isDark ? "focus:bg-white" : "focus:bg-backgroundDarkMode"
              } focus:text-mask`}
              style={{ transform: "rotate(270deg)" }}
              onClick={() => {
                document
                  .getElementById(link)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {link.charAt(0).toUpperCase() + link.slice(1)}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
