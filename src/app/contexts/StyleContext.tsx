"use client";
import React from "react";

interface StyleContextType {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

export const StyleContext = React.createContext<StyleContextType>({
  isDark: false,
  setIsDark: () => {},
});

export const StyleContextProvider: React.FC<{ children: JSX.Element }> = (
  props
) => {
  const [isDark, setIsDark] = React.useState<boolean>(false);

  let styleContext: StyleContextType = {
    setIsDark: (value: boolean) => {
      setIsDark(value);
    },
    isDark: isDark,
  };

  return (
    <StyleContext.Provider value={styleContext}>
      {props.children}
    </StyleContext.Provider>
  );
};
