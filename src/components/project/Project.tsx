import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export const Project = () => {
  const MULTIDIRECTION_SLIDE_VARIANTS = {
    hidden: { opacity: 0, x: "-25vw" },
    visible: { opacity: 1, x: 0 },
    right: { opacity: 0, x: "25vw" },
  };

  const { ref, inView } = useInView({
    triggerOnce: false,
  });

  return (
    <div
      className="flex flex-row justify-center w-screen items-center"
      ref={ref}
    >
      <div className="h-[100px] w-1/2">
        <motion.h1
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={MULTIDIRECTION_SLIDE_VARIANTS}
          transition={{ duration: 1 }}
          className="text-center"
        >
          Multi Direction
        </motion.h1>
      </div>

      <div className="h-[100px] w-1/2">
        <motion.h1
          initial="right"
          animate={inView ? "visible" : "right"}
          variants={MULTIDIRECTION_SLIDE_VARIANTS}
          transition={{ duration: 1 }}
          className="text-center"
        >
          Slide
        </motion.h1>
      </div>
    </div>
  );
};
