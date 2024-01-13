import React, { useContext } from "react";
import styles from "./introAnimation.module.css";
import { StyleContext } from "@/src/app/contexts/styleContext";

export const IntroAnimation = () => {
  const { isDark } = useContext(StyleContext);
  return (
    <div className={isDark ? styles.bg_dark : styles.bg}>
      <ul className={styles.glass}>
        {[...Array(12)].map((_, index) => (
          <li key={index}></li>
        ))}
      </ul>
    </div>
  );
};
