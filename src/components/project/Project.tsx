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
    <div className="overflow-hidden flex-row justify-center" ref={ref}>
      <motion.h1
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={MULTIDIRECTION_SLIDE_VARIANTS}
        transition={{ duration: 1 }}
        className=""
      >
        Multi Direction
      </motion.h1>

      <motion.h1
        initial="right"
        animate={inView ? "visible" : "right"}
        variants={MULTIDIRECTION_SLIDE_VARIANTS}
        transition={{ duration: 1 }}
        className=""
      >
        Slide
      </motion.h1>
    </div>
  );
};
