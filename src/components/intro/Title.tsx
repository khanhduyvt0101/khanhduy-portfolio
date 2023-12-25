import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

export const Title = () => {
  const words = ["Next.JS", "REACT", "Mobile"];
  const [isVisible, setIsVisible] = useState(false);
  const [showText, setShowText] = useState(false);
  const maskControls = useAnimation();

  useEffect(() => {
    // Start the animation
    setIsVisible(true);

    // Reset the animation after it finishes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Adjust the duration as needed

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Animate the mask to expand
      maskControls.start({ width: "100%" });

      const textTimer = setTimeout(() => {
        setShowText(true);
      }, 1500);

      return () => {
        clearTimeout(textTimer);
      };
    } else {
      // Animate the mask to shrink and fade out
      maskControls.start({ width: 0, opacity: 1 });
    }
  }, [isVisible, maskControls]);

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
        <motion.div
          key="mask"
          initial="hidden"
          animate={maskControls}
          exit="hidden"
          variants={{
            hidden: { width: 0, opacity: 1 },
            visible: { width: "100%", opacity: 1 },
          }}
          transition={{ duration: 1 }}
          className="bg-mask h-14 absolute"
          style={{ zIndex: 2 }}
        />
        {showText && <h1>DEVELOPER</h1>}
        <motion.h1
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 1.5 }}
          variants={variants1}
          className="text-center drop-shadow-sm"
        >
          <div className="flex items-center flex-row justify-between lg:w-[280px] w-[200px] tracking-[-0.02em] text-sm font-normal lg:text-base">
            <span>Next.JS</span>
            <motion.h1
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 2 }}
              variants={variants1}
              className="text-sm font-normal lg:text-base"
            >
              |
            </motion.h1>
            <span>React</span>
            <motion.h1
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 2 }}
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
