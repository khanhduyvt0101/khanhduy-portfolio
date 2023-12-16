"use client";
import Link from "next/link";
import localFont from "next/font/local";
import { cn } from "@/src/lib/utils";
const goldenSignature = localFont({
  src: "../assets/Tomatoes-O8L8.ttf",
  display: "swap",
});

export default function Header() {
  const links = ["about", "skills", "project", "blogs", "contact"];
  return (
    <>
      <nav className="justify-centerpy-2 flex w-full select-none pt-6 font-light md:px-28 md:pb-2">
        <div className="container flex flex-col items-center justify-between md:flex-row">
          <div
            className={cn("text-xl drop-shadow-2xl", goldenSignature.className)}
          >
            <Link href="/">Khanh Duy</Link>
          </div>
          <div className="nav-links flex gap-x-8 text-xs md:text-base pt-6 lg:pt-0">
            {links.map((link) => (
              <span
                key={link}
                className="cursor-pointer"
                onClick={() => {
                  document
                    .getElementById(link)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
