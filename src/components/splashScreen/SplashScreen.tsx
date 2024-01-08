import React from "react";
import styles from "./splashScreen.module.css";
import { classes } from "@/src/utils/style";

interface StyleContextType {
  isDark?: boolean;
}

export const SplashScreen = (props: StyleContextType) => {
  return (
    <div
      className={`${
        props.isDark ? "bg-backgroundDarkMode text-white" : "bg-white"
      } h-screen w-screen`}
    >
      <div className="h-3/4 items-center justify-center flex-col flex">
        <div className={styles.climbing_cube_container}>
          <div className={styles.container}>
            <div className={styles.box}>
              <div className={styles.cube}></div>
            </div>
          </div>
        </div>
        <div className={classes(styles.splash_title_container)}>
          <span className="text-gray-400"> &lt;</span>
          <span className={classes(styles.splash_title)}>Khanh Duy</span>
          <span className="text-gray-400">/&gt;</span>
        </div>
      </div>
    </div>
  );
};
