import { AnimatePresence, usePresence } from "framer-motion";
import React, { useEffect, useRef, useState, ReactNode } from "react";

type TimeoutType = number | { enter?: number; exit?: number };

interface TransitionContentProps {
  children: (isPresent: boolean, status: string) => ReactNode;
  timeout: TimeoutType;
  enterTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  exitTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  show: boolean;
}

const TransitionContent: React.FC<TransitionContentProps> = ({
  children,
  timeout,
  enterTimeout,
  exitTimeout,
  onEnter,
  onEntered,
  onExit,
  onExited,
  show,
}) => {
  const [status, setStatus] = useState("exited");
  const [isPresent, safeToRemove] = usePresence();
  const [hasEntered, setHasEntered] = useState(false);
  const splitTimeout = typeof timeout === "object";

  useEffect(() => {
    if (hasEntered || !show) return;

    const actualTimeout = splitTimeout ? timeout.enter : timeout;

    clearTimeout(enterTimeout.current);
    clearTimeout(exitTimeout.current);

    setHasEntered(true);
    setStatus("entering");
    onEnter?.();

    enterTimeout.current = setTimeout(() => {
      setStatus("entered");
      onEntered?.();
    }, actualTimeout);
  }, [onEnter, onEntered, timeout, status, show]);

  useEffect(() => {
    if (isPresent && show) return;

    const actualTimeout = splitTimeout ? timeout.exit : timeout;

    clearTimeout(enterTimeout.current);
    clearTimeout(exitTimeout.current);

    setStatus("exiting");
    onExit?.();

    exitTimeout.current = setTimeout(() => {
      setStatus("exited");
      safeToRemove?.();
      onExited?.();
    }, actualTimeout);
  }, [isPresent, onExit, safeToRemove, timeout, onExited, show]);

  return children(hasEntered && show ? isPresent : false, status);
};

interface TransitionProps {
  children: (isPresent: boolean, status: string) => ReactNode;
  timeout?: TimeoutType;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  in: boolean;
  unmount?: boolean;
}

export const Transition: React.FC<TransitionProps> = ({
  children,
  timeout = 0,
  onEnter,
  onEntered,
  onExit,
  onExited,
  in: show,
  unmount,
}) => {
  const enterTimeout = useRef<NodeJS.Timeout>();
  const exitTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (show) {
      clearTimeout(exitTimeout.current);
    } else {
      clearTimeout(enterTimeout.current);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {(show || !unmount) && (
        <TransitionContent
          timeout={timeout}
          enterTimeout={enterTimeout}
          exitTimeout={exitTimeout}
          onEnter={onEnter}
          onEntered={onEntered}
          onExit={onExit}
          onExited={onExited}
          show={show}
        >
          {children}
        </TransitionContent>
      )}
    </AnimatePresence>
  );
};
