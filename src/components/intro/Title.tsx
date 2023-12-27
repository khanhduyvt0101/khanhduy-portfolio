import { StyleContext } from "@/src/app/contexts/StyleContext";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useContext, useEffect, useState } from "react";

export const Title = () => {
  const { isDark } = useContext(StyleContext);
  const [isVisible, setIsVisible] = useState(false);
  const maskControls = useAnimation();

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isDark]);

  useEffect(() => {
    if (isVisible) {
      maskControls.start({ width: "300px", x: 0 });
    } else {
      maskControls.start({ width: 0, x: "300px" });
    }
  }, [isVisible, maskControls, isDark]);

  const variants1 = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  };

  return (
    <div className="flex justify-center items-center h-12 flex-col mt-2">
      <AnimatePresence>
        <span className="font-kanit font-thin tracking-[0.3em] text-[24px] lg:mr-[250px] text-center">
          KHANH DUY
        </span>
        <div className="w-[300px]">
          <motion.div
            key="mask"
            initial="hidden"
            animate={maskControls}
            exit="hidden"
            variants={{
              hidden: { width: 0, x: "300px" },
              visible: { width: "300px", x: 0 },
            }}
            transition={{ duration: 1 }}
            className="bg-mask h-14 absolute"
            style={{ zIndex: 2 }}
          />
          <h1 className="text-center">DEVELOPER</h1>
        </div>
        <motion.h1
          key={isDark ? 0 : 1}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 2 }}
          variants={variants1}
          className="text-center drop-shadow-sm"
        >
          <div className="flex items-center flex-row justify-between lg:w-[280px] w-[200px] tracking-[-0.02em] text-sm font-normal lg:text-base">
            <span>Next.JS</span>
            <motion.h1
              key={isDark ? 0 : 1}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 2.5 }}
              variants={variants1}
              className="text-sm font-normal lg:text-base"
            >
              |
            </motion.h1>
            <span>React</span>
            <motion.h1
              key={isDark ? 0 : 1}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 2.5 }}
              variants={variants1}
              className="text-sm font-normal lg:text-base"
            >
              |
            </motion.h1>
            <span>Mobile</span>
          </div>
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};
