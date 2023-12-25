"use client";
import Link from "next/link";
import { ToggleSwitch } from "./toggleSwitch/ToggleSwitch";
import { useContext } from "react";
import { StyleContext } from "../app/contexts/StyleContext";
import KD from "@/src/assets/photo/KD.png";
import KDdarktheme from "@/src/assets/photo/KDdarktheme.png";

export default function Header() {
  const { isDark } = useContext(StyleContext);
  const links = ["about", "skills", "project", "blogs", "contact"];

  return (
    <>
      <nav
        className={`${
          isDark ? "text-white bg-backgroundDarkMode" : ""
        } justify-center fixed left-0 top-0 flex-col select-none font-light px-2 duration-500 transition-all hidden md:flex h-screen`}
      >
        <div className="nav-links flex flex-col gap-y-20 text-base items-center justify-center">
          <Link className="ml-4" href="/">
            <img
              src={!isDark ? KDdarktheme.src : KD.src}
              alt="Khanh Duy"
              className="w-[120px] h-[90px]"
            />
          </Link>
          {links.map((link) => (
            <span
              key={link}
              className="cursor-pointer"
              style={{ transform: "rotate(270deg)" }}
              onClick={() => {
                document
                  .getElementById(link)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {link.charAt(0).toUpperCase() + link.slice(1)}
            </span>
          ))}
          <ToggleSwitch />
        </div>
      </nav>
    </>
  );
}
