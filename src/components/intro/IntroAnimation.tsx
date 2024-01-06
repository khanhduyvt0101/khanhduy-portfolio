import React from "react";
import styles from "./IntroAnimation.module.css";

export const IntroAnimation = () => {
  return (
    <div className={styles.climbing_cube_container}>
      <table>
        <tbody>
          <tr>
            <td>
              <div className={styles.container}>
                <div className={styles.box}>
                  <div className={styles.cube}></div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
