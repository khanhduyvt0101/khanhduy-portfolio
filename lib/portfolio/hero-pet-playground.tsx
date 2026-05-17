"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const catAsset = "/pets/wandering-cat/cat.gif";
const catSize = {
  desktopHeight: 90,
  desktopWidth: 146,
  mobileHeight: 70,
  mobileWidth: 114,
};
const walkSpeed = 54;

const path = [
  { x: -0.08, y: 1, restMs: 420, pose: "play" },
  { x: 0.18, y: 1, restMs: 280, pose: "look" },
  { x: 0.48, y: 1, restMs: 360, pose: "play" },
  { x: 0.78, y: 1, restMs: 300, pose: "look" },
  { x: 1.08, y: 1, restMs: 420, pose: "play" },
  { x: 0.72, y: 1, restMs: 260, pose: "look" },
  { x: 0.34, y: 1, restMs: 340, pose: "play" },
] as const;

type StageSize = {
  width: number;
  height: number;
};

function pointFromPath(index: number, stage: StageSize) {
  const waypoint = path[index % path.length];
  const isMobile = stage.width > 0 && stage.width < 640;
  const width = isMobile ? catSize.mobileWidth : catSize.desktopWidth;
  const height = isMobile ? catSize.mobileHeight : catSize.desktopHeight;
  const minX = isMobile ? -width * 0.36 : -width * 0.2;
  const maxX = Math.max(minX, stage.width - width - minX);
  const maxY = Math.max(0, stage.height - height - 2);

  return {
    x: Math.round(minX + (maxX - minX) * waypoint.x),
    y: Math.round(maxY * waypoint.y),
  };
}

function getWalkDuration(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.max(1.1, distance / walkSpeed);
}

function useStageSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<StageSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const update = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, size };
}

export function HeroPetPlayground(): ReactNode {
  const reduceMotion = useReducedMotion();
  const { ref, size } = useStageSize();
  const [targetIndex, setTargetIndex] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const previousPoint = useMemo(
    () => pointFromPath(targetIndex - 1, size),
    [size, targetIndex],
  );
  const targetPoint = useMemo(
    () => pointFromPath(targetIndex, size),
    [size, targetIndex],
  );
  const waypoint = path[targetIndex % path.length];
  const isReady = size.width > 0 && size.height > 0;
  const direction = targetPoint.x >= previousPoint.x ? 1 : -1;
  const walkDuration = getWalkDuration(previousPoint, targetPoint);
  const isInteracting = isPlaying || (isResting && waypoint.pose === "play");

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const restThenMove = () => {
    if (reduceMotion) {
      return;
    }

    setIsResting(true);

    timerRef.current = window.setTimeout(() => {
      setIsResting(false);
      setIsPlaying(false);
      setTargetIndex((index) => index + 1);
    }, waypoint.restMs);
  };

  return (
    <div
      className="pointer-events-none relative h-28 overflow-hidden bg-transparent md:h-36"
      ref={ref}
    >
      <div className="hero-pet-glint left-[16%] top-9 bg-chart-2" />
      <div className="hero-pet-glint left-[42%] top-4 bg-chart-4 [--glint-delay:-0.7s]" />
      <div className="hero-pet-glint left-[72%] top-11 bg-chart-1 [--glint-delay:-1.5s]" />
      {isReady ? (
        <motion.div
          animate={reduceMotion ? previousPoint : targetPoint}
          className="absolute left-0 top-0"
          initial={previousPoint}
          onAnimationComplete={restThenMove}
          transition={{
            duration: reduceMotion ? 0 : walkDuration,
            ease: "linear",
          }}
        >
          <motion.button
            aria-label="Animated cat"
            className="pointer-events-auto group relative block cursor-pointer border-0 bg-transparent p-0"
            onBlur={() => setIsPlaying(false)}
            onFocus={() => setIsPlaying(true)}
            onMouseEnter={() => setIsPlaying(true)}
            onMouseLeave={() => setIsPlaying(false)}
            onPointerDown={() => setIsPlaying(true)}
            style={
              {
                "--cat-direction": direction,
              } as CSSProperties
            }
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
          >
            <motion.span
              animate={{
                opacity: isInteracting ? 0.28 : 0,
                scale: isInteracting ? [0.92, 1.08, 0.98] : 0.86,
              }}
              className="absolute left-5 top-5 h-14 w-24 rounded-full bg-primary/25 blur-xl md:left-6 md:top-6 md:h-16 md:w-28"
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
            />
            <motion.span
              animate={{
                opacity: isResting || isPlaying ? 0.28 : 0.18,
                scaleX: isResting || isPlaying ? 0.86 : 1,
              }}
              className="absolute left-7 top-[3.55rem] h-2.5 w-20 rounded-[999px] bg-foreground/20 blur-sm md:left-8 md:top-[4.6rem] md:h-3 md:w-24"
            />
            <motion.span
              animate={{
                opacity: isInteracting ? 1 : 0,
                scale: isInteracting ? 1 : 0.72,
                y: isInteracting ? -6 : 0,
              }}
              className="-top-6 absolute left-10 rounded-md border bg-background/95 px-2 py-1 font-mono text-[0.62rem] shadow-lg"
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              meow
            </motion.span>
            <motion.span
              animate={{
                opacity: isInteracting ? 1 : 0,
              }}
              className="-right-2 absolute top-3 size-2 rounded-full bg-chart-2 shadow-sm"
            />
            <motion.span
              animate={{
                opacity: isInteracting ? 0.9 : 0,
                scale: isInteracting ? [0.7, 1.15, 0.75] : 0.6,
              }}
              className="absolute right-7 top-0 size-1.5 rounded-full bg-chart-4 shadow-sm"
              transition={{
                duration: 0.6,
                repeat: isInteracting ? Number.POSITIVE_INFINITY : 0,
              }}
            />
            <motion.span
              animate={{
                opacity: isInteracting ? 0.9 : 0,
                scale: isInteracting ? [1, 0.7, 1.1] : 0.6,
              }}
              className="absolute right-12 top-7 size-1 rounded-full bg-chart-1 shadow-sm"
              transition={{
                duration: 0.7,
                repeat: isInteracting ? Number.POSITIVE_INFINITY : 0,
              }}
            />
            <motion.span
              animate={{
                rotate: isInteracting ? [-3, 4, -1] : 0,
                y: isInteracting ? [0, -6, 0] : 0,
              }}
              className="relative block"
              transition={{
                duration: 0.55,
                ease: "easeInOut",
                repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
              }}
            >
              <Image
                alt=""
                aria-hidden="true"
                className="h-[70px] w-[114px] select-none object-contain [image-rendering:auto] [transform:scaleX(var(--cat-direction))] md:h-[90px] md:w-[146px]"
                draggable={false}
                height={catSize.desktopHeight}
                priority
                src={catAsset}
                unoptimized
                width={catSize.desktopWidth}
              />
            </motion.span>
          </motion.button>
        </motion.div>
      ) : null}
    </div>
  );
}
