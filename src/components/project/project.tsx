import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import projectIcon from "@/src/assets/svg/projectIcon.svg";
import mobileProject from "@/src/assets/svg/mobileProject.svg";
import iconReadMoreButton from "@/src/assets/svg/iconReadMoreButton.svg";
import focusIconReadMoreButton from "@/src/assets/svg/focusIconReadMoreButton.svg";
import { projects } from "@/src/portfolio";

export const Project = () => {
  const MULTIDIRECTION_SLIDE_VARIANTS = {
    hidden: { opacity: 0, x: "-25vw" },
    visible: { opacity: 1, x: 0 },
    right: { opacity: 0, x: "25vw" },
  };

  const { ref, inView } = useInView({
    triggerOnce: false,
  });

  const [isHoveredReadMore, setIsHoveredReadMore] = useState(false);

  return (
    <div
      className="flex lg:flex-row flex-col justify-center items-center w-full h-screen"
      ref={ref}
    >
      <div className="lg:ml-[250px] justify-center items-center w-1/2 md:order-1">
        <motion.h1
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={MULTIDIRECTION_SLIDE_VARIANTS}
          transition={{ duration: 1.5 }}
        >
          <div className="flex flex-row justify-start items-center">
            <Image src={projectIcon} alt="projectIcon" width={87} height={27} />
            <p className="ml-4 text-sm text-mask">01</p>
          </div>
          <h1 className="text-start">Agile Helper</h1>
          <div className="justify-center items-center w-full text-sm font-normal text-start space-y-4">
            <li>
              Help set up easy planning and retro, review in an agile team
            </li>
            <li>
              Planning poker: Have a table with many cards to vote points for
              task
            </li>
            <li>Retro: create a retro event in the agile team</li>
          </div>
          <button
            className={`relative ${
              isHoveredReadMore ? "text-mask" : "text-white"
            }`}
            onClick={() => {
              window.open(projects.agileHelper, "_blank");
            }}
            onMouseEnter={() => setIsHoveredReadMore(true)}
            onMouseLeave={() => setIsHoveredReadMore(false)}
          >
            <div className="relative">
              <Image
                src={
                  isHoveredReadMore
                    ? focusIconReadMoreButton
                    : iconReadMoreButton
                }
                alt="logo"
                width={140}
                height={50}
              />
              <span
                className={`text-sm transition-opacity duration-500 inset-0 flex items-center justify-center absolute top-0 left-0 w-full h-full bg-opacity-50`}
              >
                Read more...
              </span>
            </div>
          </button>
        </motion.h1>
      </div>

      <div className="justify-center items-center w-1/2 md:order-2">
        <motion.h1
          initial="right"
          animate={inView ? "visible" : "right"}
          variants={MULTIDIRECTION_SLIDE_VARIANTS}
          transition={{ duration: 1.5 }}
          className="text-center"
        >
          <Image
            className="self-center items-center"
            src={mobileProject}
            alt="projectIcon"
            width={379}
            height={369}
          />
        </motion.h1>
      </div>
    </div>
  );
};
