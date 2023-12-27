import React from "react";
import DisplayLottie from "../../components/displayLottie/DisplayLottie";
import styles from "./SplashScreen.module.css";
import { classes } from "@/src/utils/style";
import loadingLottie from "@/src/assets/lottie/loadingLottie.json";

interface StyleContextType {
  isDark?: boolean;
}

export const SplashScreen = (props: StyleContextType) => {
  return (
    <div
      className={
        props.isDark
          ? classes("dark-mode", styles.splash_container)
          : classes(styles.splash_container)
      }
    >
      <div className={classes(styles.splash_animation_container)}>
        <DisplayLottie animationData={loadingLottie} />
      </div>
      <div className={classes(styles.splash_title_container)}>
        <span className="text-gray-400"> &lt;</span>
        <span className={classes(styles.splash_title)}>Khanh Duy</span>
        <span className="text-gray-400">/&gt;</span>
      </div>
    </div>
  );
};
