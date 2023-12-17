import React, { useState, useContext } from "react";
import emoji from "react-easy-emoji";
import { StyleContext } from "@/src/app/contexts/StyleContext";

export const ToggleSwitch = () => {
  const { isDark, setIsDark } = useContext(StyleContext);
  const [isChecked, setChecked] = useState(isDark);

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={isDark}
        onChange={() => {
          setIsDark(!isDark);
          setChecked(!isChecked);
        }}
      />
      <span className="slider round">
        <span className="emoji">{isChecked ? emoji("🌜") : emoji("☀️")}</span>
      </span>
    </label>
  );
};
