"use client";
import React, { useEffect } from "react";

interface StyleContextType {
  isDark?: boolean;
  setIsDark: (value: boolean) => void;
}

export const StyleContext = React.createContext<StyleContextType>({
  isDark: undefined,
  setIsDark: () => {},
});

export const StyleContextProvider: React.FC<{ children: JSX.Element }> = (
  props
) => {
  // Initialize isDark state with a default value
  const [isDark, setIsDarkState] = React.useState<boolean>(false);

  useEffect(() => {
    // Retrieve isDark value from localStorage on component mount
    const storedIsDark = localStorage.getItem("isDark");

    if (storedIsDark !== null) {
      // Convert the string value to a boolean
      setIsDarkState(storedIsDark === "true");
    }
  }, []); // Run this effect only once on component mount

  // Create a wrapper function for setIsDark that updates both state and localStorage
  const setIsDark: StyleContextType["setIsDark"] = (value) => {
    setIsDarkState(value); // Update the state
    localStorage.setItem("isDark", value.toString()); // Update localStorage
  };

  const styleContext: StyleContextType = {
    setIsDark,
    isDark,
  };

  return (
    <StyleContext.Provider value={styleContext}>
      {props.children}
    </StyleContext.Provider>
  );
};
