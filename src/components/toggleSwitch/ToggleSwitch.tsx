"use client";
import React, { useState, useContext } from "react";
import { StyleContext } from "@/src/app/contexts/StyleContext";
import { Button } from "../ui/button";
import darkModeIconBlack from "@/src/assets/svg/darkModeIconBlack.svg";
import darkModeIconFocus from "@/src/assets/svg/darkModeIconFocus.svg";
import lightModeIconWhite from "@/src/assets/svg/lightModeIconWhite.svg";
import lightModeIconFocus from "@/src/assets/svg/lightModeIconFocus.svg";
import Image from "next/image";

export const ToggleSwitch = () => {
  const { isDark, setIsDark } = useContext(StyleContext);
  const [isChecked, setChecked] = useState(isDark);
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    if (!isDark) {
      return isHovered ? darkModeIconFocus : darkModeIconBlack;
    } else {
      return isHovered ? lightModeIconFocus : lightModeIconWhite;
    }
  };

  return (
    <button
      className={`fixed top-10 right-8 border-0 transition-all duration-500`}
      onClick={() => {
        setIsDark(!isDark);
        setChecked(!isChecked);
      }}
    >
      <Image
        src={getIcon()}
        alt="modeIcon"
        width={50}
        height={50}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </button>
  );
};
