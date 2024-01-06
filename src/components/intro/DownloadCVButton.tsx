import downloadCVIcon from "@/src/assets/svg/downloadCVIcon.svg";
import { contactInfo } from "@/src/portfolio";
import Image from "next/image";
import styles from "./DownloadCVButton.module.css";
import { useState } from "react";

export const DownloadCVButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => {
        window.open(contactInfo.cv, "_blank");
      }}
      className={styles.button}
    >
      <Image src={downloadCVIcon} alt="logo" width={30} height={26} />
      <span
        className={`transition-opacity duration-500 absolute inset-0 flex items-center justify-center text-mask`}
      >
        Download my resume...
      </span>
    </button>
  );
};
