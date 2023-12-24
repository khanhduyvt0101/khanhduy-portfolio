import React, { forwardRef, ReactNode } from "react";
import styles from "./VisuallyHidden.module.css";
import { classes } from "@/src/utils/style";

// Define a type for the component's props
interface VisuallyHiddenProps {
  className?: string;
  showOnFocus?: boolean;
  as?: React.ElementType;
  children: ReactNode;
  visible?: boolean;
  [key: string]: any; // For additional props that might be passed
}

export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  (
    {
      className,
      showOnFocus,
      as: Component = "span",
      children,
      visible,
      ...rest
    },
    ref
  ) => {
    return (
      <Component
        className={classes(styles.hidden, className)}
        data-hidden={!visible && !showOnFocus}
        data-show-on-focus={showOnFocus}
        ref={ref}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
