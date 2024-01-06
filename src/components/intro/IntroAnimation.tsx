import React from "react";
import styles from "./IntroAnimation.module.css";

export const IntroAnimation = () => {
  return (
    <div className={styles.bg}>
      <ul className={styles.glass}>
        {[...Array(12)].map((_, index) => (
          <li key={index}></li>
        ))}
      </ul>
    </div>
  );
};
