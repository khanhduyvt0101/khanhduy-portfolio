"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const catAsset = "/pets/wandering-cat/cat.gif";
const desktopCat = { height: 112, width: 182 };
const mobileCat = { height: 84, width: 137 };
const desktopSpeed = 66;
const mobileSpeed = 48;

type Point = {
  x: number;
  y: number;
  rest?: number;
};

type Layout = {
  height: number;
  path: Point[];
  petHeight: number;
  petWidth: number;
  reducedMotion: boolean;
  speed: number;
  width: number;
};

type Walker = {
  current: Point;
  dragVelocity: Point;
  facing: 1 | -1;
  initialized: boolean;
  lastTime: number;
  restingUntil: number;
  targetIndex: number;
};

type Heart = {
  id: number;
  x: number;
  y: number;
};

type DragState = {
  active: boolean;
  lastClientX: number;
  lastClientY: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
};

const initialLayout: Layout = {
  height: 0,
  path: [],
  petHeight: desktopCat.height,
  petWidth: desktopCat.width,
  reducedMotion: false,
  speed: desktopSpeed,
  width: 0,
};

const initialWalker: Walker = {
  current: { x: 0, y: 0 },
  dragVelocity: { x: 0, y: 0 },
  facing: 1,
  initialized: false,
  lastTime: 0,
  restingUntil: 0,
  targetIndex: 1,
};

export function HeroPetPlayground(): ReactNode {
  const [isDragging, setIsDragging] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const animationRef = useRef(0);
  const dragRef = useRef<DragState>({
    active: false,
    lastClientX: 0,
    lastClientY: 0,
    offsetX: 0,
    offsetY: 0,
    pointerId: -1,
  });
  const heartIdRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isPettedRef = useRef(false);
  const layoutRef = useRef<Layout>(initialLayout);
  const petRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<Walker>(initialWalker);

  const renderPet = useCallback((time: number) => {
    const pet = petRef.current;
    const sprite = spriteRef.current;
    const walker = walkerRef.current;
    const layout = layoutRef.current;

    if (!(pet && sprite && layout.path.length)) {
      return;
    }

    const bob =
      layout.reducedMotion || isDraggingRef.current
        ? 0
        : Math.sin(time / 210) * 2.1;
    pet.style.transform = `translate3d(${walker.current.x}px, ${walker.current.y}px, 0)`;
    sprite.style.transform = `translate3d(0, ${bob}px, 0) scaleX(${walker.facing})`;
  }, []);

  const spawnHeart = useCallback(() => {
    const layout = layoutRef.current;
    const walker = walkerRef.current;
    const id = heartIdRef.current + 1;
    heartIdRef.current = id;

    setHearts((current) => [
      ...current.slice(-5),
      {
        id,
        x: walker.current.x + layout.petWidth * 0.54,
        y: walker.current.y + layout.petHeight * 0.12,
      },
    ]);

    window.setTimeout(() => {
      setHearts((current) => current.filter((heart) => heart.id !== id));
    }, 950);
  }, []);

  const pauseForPetting = useCallback(() => {
    if (isDraggingRef.current) {
      return;
    }

    isPettedRef.current = true;
    setIsPetted(true);
    spawnHeart();
  }, [spawnHeart]);

  const resumePatrol = useCallback(() => {
    if (isDraggingRef.current) {
      return;
    }

    isPettedRef.current = false;
    setIsPetted(false);
    walkerRef.current.restingUntil = performance.now() + 300;
  }, []);

  const beginDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const layout = layoutRef.current;
      const walker = walkerRef.current;

      if (!layout.path.length) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        active: true,
        lastClientX: event.clientX,
        lastClientY: event.clientY,
        offsetX: event.clientX - walker.current.x,
        offsetY: event.clientY - walker.current.y,
        pointerId: event.pointerId,
      };
      isDraggingRef.current = true;
      isPettedRef.current = false;
      setIsDragging(true);
      setIsPetted(false);
      walker.restingUntil = performance.now();
      renderPet(performance.now());
    },
    [renderPet],
  );

  const dragPet = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      const layout = layoutRef.current;
      const walker = walkerRef.current;

      if (!(drag.active && drag.pointerId === event.pointerId)) {
        return;
      }

      event.preventDefault();
      const nextX = clamp(
        event.clientX - drag.offsetX,
        0,
        Math.max(0, layout.width - layout.petWidth),
      );
      const nextY = clamp(
        event.clientY - drag.offsetY,
        0,
        Math.max(0, layout.height - layout.petHeight),
      );
      const velocity = {
        x: event.clientX - drag.lastClientX,
        y: event.clientY - drag.lastClientY,
      };

      walker.current = { x: nextX, y: nextY };
      walker.dragVelocity = velocity;

      if (Math.abs(velocity.x) > 0.5) {
        walker.facing = velocity.x > 0 ? 1 : -1;
      }

      drag.lastClientX = event.clientX;
      drag.lastClientY = event.clientY;
      renderPet(performance.now());
    },
    [renderPet],
  );

  const endDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      const layout = layoutRef.current;
      const walker = walkerRef.current;

      if (!(drag.active && drag.pointerId === event.pointerId)) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      drag.active = false;
      isDraggingRef.current = false;
      setIsDragging(false);
      walker.lastTime = performance.now();
      walker.restingUntil = walker.lastTime + 260;
      walker.targetIndex = chooseNextTargetAfterDrag(
        walker.current,
        walker.dragVelocity,
        layout.path,
      );
      renderPet(walker.lastTime);
    },
    [renderPet],
  );

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    function updateLayout() {
      if (!stage) {
        return;
      }

      const rect = stage.getBoundingClientRect();
      const compact = rect.width < 640;
      const petWidth = compact ? mobileCat.width : desktopCat.width;
      const petHeight = compact ? mobileCat.height : desktopCat.height;
      const path = createHeroPetPath({
        height: rect.height,
        petHeight,
        petWidth,
        width: rect.width,
      });
      layoutRef.current = {
        height: rect.height,
        path,
        petHeight,
        petWidth,
        reducedMotion: reducedMotionQuery.matches,
        speed: compact ? mobileSpeed : desktopSpeed,
        width: rect.width,
      };

      const walker = walkerRef.current;

      if (!walker.initialized || reducedMotionQuery.matches) {
        const restingPoint = path[0] ?? { x: 0, y: 0 };
        walker.current = restingPoint;
        walker.facing = 1;
        walker.initialized = true;
        walker.lastTime = performance.now();
        walker.targetIndex = 1;
        renderPet(walker.lastTime);
      }
    }

    updateLayout();

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(stage);
    reducedMotionQuery.addEventListener("change", updateLayout);

    return () => {
      resizeObserver.disconnect();
      reducedMotionQuery.removeEventListener("change", updateLayout);
    };
  }, [renderPet]);

  useEffect(() => {
    function step(time: number) {
      const walker = walkerRef.current;
      const layout = layoutRef.current;

      if (!layout.path.length) {
        animationRef.current = window.requestAnimationFrame(step);
        return;
      }

      if (!walker.lastTime) {
        walker.lastTime = time;
      }

      const delta = Math.min(time - walker.lastTime, 48);
      walker.lastTime = time;

      if (
        !(
          isDraggingRef.current ||
          isPettedRef.current ||
          layout.reducedMotion ||
          time < walker.restingUntil
        )
      ) {
        const target = layout.path[walker.targetIndex] ?? layout.path[0];
        const dx = target.x - walker.current.x;
        const dy = target.y - walker.current.y;
        const distance = Math.hypot(dx, dy);
        const stepDistance = (layout.speed * delta) / 1000;

        if (distance <= Math.max(stepDistance, 0.5)) {
          walker.current = target;
          walker.restingUntil = time + (target.rest ?? 0);
          walker.targetIndex = (walker.targetIndex + 1) % layout.path.length;
        } else {
          walker.current = {
            x: walker.current.x + (dx / distance) * stepDistance,
            y: walker.current.y + (dy / distance) * stepDistance,
          };

          if (Math.abs(dx) > 0.5) {
            walker.facing = dx > 0 ? 1 : -1;
          }
        }
      }

      renderPet(time);
      animationRef.current = window.requestAnimationFrame(step);
    }

    animationRef.current = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationRef.current);
  }, [renderPet]);

  return (
    <div aria-hidden={false} className="hero-pet-stage" ref={stageRef}>
      <div className="hero-pet-glint left-[16%] top-[78%] bg-chart-2" />
      <div className="hero-pet-glint left-[42%] top-[10%] bg-chart-4 [--glint-delay:-0.7s]" />
      <div className="hero-pet-glint left-[72%] top-[22%] bg-chart-1 [--glint-delay:-1.5s]" />

      {hearts.map((heart) => (
        <span
          aria-hidden="true"
          className="hero-pet-heart"
          key={heart.id}
          style={
            {
              "--heart-x": `${heart.x}px`,
              "--heart-y": `${heart.y}px`,
            } as CSSProperties
          }
        />
      ))}

      <button
        aria-label="Pet the walking cat"
        className="hero-pet-button"
        data-dragging={isDragging}
        data-petted={isPetted}
        onBlur={resumePatrol}
        onClick={spawnHeart}
        onFocus={pauseForPetting}
        onPointerCancel={endDrag}
        onPointerDown={beginDrag}
        onPointerEnter={pauseForPetting}
        onPointerLeave={resumePatrol}
        onPointerMove={dragPet}
        onPointerUp={endDrag}
        ref={petRef}
        type="button"
      >
        <span className="hero-pet-bubble">MEW</span>
        <span className="hero-pet-sprite" ref={spriteRef}>
          <span className="hero-pet-aura" />
          <span className="hero-pet-shadow" />
          <Image
            alt=""
            aria-hidden="true"
            className="relative h-[84px] w-[137px] select-none object-contain [image-rendering:auto] md:h-[112px] md:w-[182px]"
            draggable={false}
            height={desktopCat.height}
            src={catAsset}
            unoptimized
            width={desktopCat.width}
          />
        </span>
      </button>
    </div>
  );
}

function createHeroPetPath({
  height,
  petHeight,
  petWidth,
  width,
}: {
  height: number;
  petHeight: number;
  petWidth: number;
  width: number;
}): Point[] {
  const pad = width < 640 ? 8 : 14;
  const left = pad;
  const right = Math.max(left, width - petWidth - pad);
  const top = Math.max(pad, height * 0.08);
  const middle = Math.max(top + petHeight * 0.35, height * 0.42);
  const bottom = Math.max(top, height - petHeight - pad);
  const upperRight = Math.max(left, right - width * 0.08);
  const upperLeft = Math.min(right, left + width * 0.08);

  return [
    { x: left + width * 0.08, y: bottom, rest: 500 },
    { x: right, y: bottom, rest: 320 },
    { x: right, y: middle, rest: 160 },
    { x: upperRight, y: top, rest: 260 },
    { x: width * 0.48, y: top, rest: 420 },
    { x: upperLeft, y: Math.min(bottom, top + height * 0.18), rest: 180 },
    { x: left, y: middle, rest: 220 },
    { x: left + width * 0.08, y: bottom, rest: 620 },
  ];
}

function chooseNextTargetAfterDrag(
  current: Point,
  velocity: Point,
  path: Point[],
) {
  if (!path.length) {
    return 0;
  }

  const movementStrength = Math.hypot(velocity.x, velocity.y);
  const direction = movementStrength > 1 ? normalizePoint(velocity) : undefined;
  const scoredTargets = path.map((target, index) => {
    const toTarget = { x: target.x - current.x, y: target.y - current.y };
    const distance = Math.hypot(toTarget.x, toTarget.y);
    const alignment =
      direction && distance > 0
        ? (direction.x * toTarget.x + direction.y * toTarget.y) / distance
        : 0;
    const forwardBonus = alignment > 0 ? alignment * 90 : alignment * 28;

    return {
      index,
      score: distance - forwardBonus + (target.rest ?? 0) * 0.02,
    };
  });

  return scoredTargets.sort((a, b) => a.score - b.score)[0]?.index ?? 0;
}

function normalizePoint(point: Point): Point {
  const length = Math.hypot(point.x, point.y) || 1;

  return {
    x: point.x / length,
    y: point.y / length,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
