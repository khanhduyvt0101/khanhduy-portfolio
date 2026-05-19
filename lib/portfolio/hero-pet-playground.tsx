"use client";

import { Oneko } from "lots-o-nekos";
import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const desktopCat = { height: 128, width: 128 };
const mobileCat = { height: 96, width: 96 };
const idleFrameMs = 230;
const pettingFrameMs = 140;
const walkFrameRate = 7.5;
const runFrameRate = 10;
const dragFrameRate = 8.5;
const desktopSpeed = 132;
const mobileSpeed = 98;
const heroCatAtlasColumns = 16;
const heroCatSource = "/pets/hero-cat-smooth.webp";

type OnekoSprite =
  | "idle"
  | "alert"
  | "scratchSelf"
  | "tired"
  | "sleeping"
  | "N"
  | "NE"
  | "E"
  | "SE"
  | "S"
  | "SW"
  | "W"
  | "NW";

type HeroOneko = {
  allowedIdleAnimations: string[];
  allowedTargetDistance: number;
  draw: () => HeroOneko;
  element: HTMLDivElement;
  idleAnimation: string | null;
  idleAnimationFrame: number;
  idleTime: number;
  isInitialized: () => boolean;
  loopAnimating: boolean;
  setSprite: (setName: OnekoSprite, frame: number) => HeroOneko;
  setTarget: (x: number, y: number) => HeroOneko;
  size: number;
  speed: number;
  source: string;
  spriteSets: Record<OnekoSprite, number[][]>;
  targetX: number;
  targetY: number;
  updateSpeed: number;
  x: number;
  y: number;
};

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
  velocity: Point;
};

type PatrolState = {
  initialized: boolean;
  lastFrameAt: number;
  lastManualFrame: number;
  restingUntil: number;
  runUntil: number;
  spriteFrame: number;
  targetIndex: number;
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

const initialPatrol: PatrolState = {
  initialized: false,
  lastFrameAt: 0,
  lastManualFrame: 0,
  restingUntil: 0,
  runUntil: 0,
  spriteFrame: 0,
  targetIndex: 1,
};

const createSpriteRow = (row: number) =>
  Array.from({ length: heroCatAtlasColumns }, (_, column) => [-column, -row]);

const heroCatSpriteSets: Record<OnekoSprite, number[][]> = {
  alert: [[0, 0]],
  E: createSpriteRow(1),
  idle: createSpriteRow(0),
  N: createSpriteRow(3),
  NE: createSpriteRow(1),
  NW: createSpriteRow(2),
  S: createSpriteRow(4),
  scratchSelf: createSpriteRow(5),
  SE: createSpriteRow(1),
  sleeping: createSpriteRow(6),
  SW: createSpriteRow(2),
  tired: [[0, -6]],
  W: createSpriteRow(2),
};

export function HeroPetPlayground(): ReactNode {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const animationRef = useRef(0);
  const dragRef = useRef<DragState>({
    active: false,
    lastClientX: 0,
    lastClientY: 0,
    offsetX: 0,
    offsetY: 0,
    pointerId: -1,
    velocity: { x: 0, y: 0 },
  });
  const heartIdRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isPettedRef = useRef(false);
  const layoutRef = useRef<Layout>(initialLayout);
  const onekoRef = useRef<HeroOneko | null>(null);
  const petRef = useRef<HTMLButtonElement>(null);
  const patrolRef = useRef<PatrolState>(initialPatrol);
  const stageRef = useRef<HTMLDivElement>(null);

  const spawnHeart = useCallback(() => {
    const layout = layoutRef.current;
    const cat = onekoRef.current;

    if (!cat) {
      return;
    }

    const id = heartIdRef.current + 1;
    heartIdRef.current = id;

    setHearts((current) => [
      ...current.slice(-5),
      {
        id,
        x: cat.x + layout.petWidth * 0.08,
        y: cat.y - layout.petHeight * 0.42,
      },
    ]);

    window.setTimeout(() => {
      setHearts((current) => current.filter((heart) => heart.id !== id));
    }, 950);
  }, []);

  const pauseForPetting = useCallback(() => {
    const cat = onekoRef.current;

    if (!(cat && !isDraggingRef.current)) {
      return;
    }

    isPettedRef.current = true;
    setIsPetted(true);
    cat.idleTime = 24;
    cat.idleAnimation = "scratchSelf";
    cat.idleAnimationFrame = 0;
    cat.setTarget(cat.x, cat.y);
    setHeroCatSprite(cat, "scratchSelf", 0);
    spawnHeart();
  }, [spawnHeart]);

  const resumePatrol = useCallback(() => {
    const cat = onekoRef.current;

    if (!(cat && !isDraggingRef.current)) {
      return;
    }

    isPettedRef.current = false;
    setIsPetted(false);
    patrolRef.current.restingUntil = performance.now() + 260;
    cat.idleAnimation = null;
    cat.idleAnimationFrame = 0;
  }, []);

  const beginDrag = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const cat = onekoRef.current;
    const layout = layoutRef.current;

    if (!(cat && layout.path.length)) {
      return;
    }

    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic browser tests can dispatch pointer events without an active pointer.
    }
    dragRef.current = {
      active: true,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      offsetX: event.clientX - cat.x,
      offsetY: event.clientY - cat.y,
      pointerId: event.pointerId,
      velocity: { x: 0, y: 0 },
    };
    isDraggingRef.current = true;
    isPettedRef.current = false;
    setIsDragging(true);
    setIsPetted(false);
    cat.setTarget(cat.x, cat.y);
    cat.idleAnimation = null;
    setHeroCatSprite(cat, "alert", 0);
  }, []);

  const dragPet = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const cat = onekoRef.current;
    const drag = dragRef.current;
    const layout = layoutRef.current;

    if (!(cat && drag.active && drag.pointerId === event.pointerId)) {
      return;
    }

    event.preventDefault();
    const nextX = clamp(
      event.clientX - drag.offsetX,
      layout.petWidth / 2,
      Math.max(layout.petWidth / 2, layout.width - layout.petWidth / 2),
    );
    const nextY = clamp(
      event.clientY - drag.offsetY,
      layout.petHeight / 2,
      Math.max(layout.petHeight / 2, layout.height - layout.petHeight / 2),
    );
    const velocity = {
      x: event.clientX - drag.lastClientX,
      y: event.clientY - drag.lastClientY,
    };

    drag.velocity = velocity;
    drag.lastClientX = event.clientX;
    drag.lastClientY = event.clientY;
    cat.x = nextX;
    cat.y = nextY;
    cat.targetX = nextX;
    cat.targetY = nextY;
    cat.draw();
    setHeroCatSprite(
      cat,
      getDirectionSprite(velocity),
      patrolRef.current.lastManualFrame,
    );
  }, []);

  const endDrag = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const cat = onekoRef.current;
    const drag = dragRef.current;
    const layout = layoutRef.current;
    const patrol = patrolRef.current;

    if (!(cat && drag.active && drag.pointerId === event.pointerId)) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // The pointer may already be released by the browser.
      }
    }

    drag.active = false;
    isDraggingRef.current = false;
    setIsDragging(false);
    patrol.restingUntil = performance.now() + 220;
    patrol.runUntil =
      patrol.restingUntil +
      Math.min(1300, Math.hypot(drag.velocity.x, drag.velocity.y) * 46);
    patrol.targetIndex = chooseNextTargetAfterDrag(
      { x: cat.x, y: cat.y },
      drag.velocity,
      layout.path,
    );
    cat.speed = layout.speed * 1.35;
    setCatTargetPoint(cat, layout.path[patrol.targetIndex]);
  }, []);

  useEffect(() => {
    const pet = petRef.current;

    if (!pet) {
      return;
    }

    const cat = new Oneko({
      allowedIdleAnimations: ["sleeping", "scratchSelf"],
      allowedTargetDistance: 10,
      element: pet as unknown as HTMLDivElement,
      maxAlertDuration: 1,
      size: desktopCat.width,
      skipAlertAnimation: true,
      skipElementInit: true,
      source: heroCatSource,
      speed: 0,
      updateSpeed: Number.POSITIVE_INFINITY,
      x: desktopCat.width / 2,
      y: desktopCat.height / 2,
    }) as unknown as HeroOneko;

    if (!cat.isInitialized()) {
      return;
    }

    cat.spriteSets = heroCatSpriteSets;
    cat.draw = () => drawHeroCat(cat);
    cat.loopAnimating = false;
    cat.draw();
    setHeroCatSprite(cat, "idle", 0);
    onekoRef.current = cat;

    return () => {
      cat.loopAnimating = false;
      onekoRef.current = null;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    function updateLayout() {
      const cat = onekoRef.current;

      if (!stage) {
        return;
      }

      const rect = stage.getBoundingClientRect();
      const compact = rect.width < 640;
      const petWidth = compact ? mobileCat.width : desktopCat.width;
      const petHeight = compact ? mobileCat.height : desktopCat.height;
      const patrolHeight = Math.min(
        rect.height,
        Math.max(petHeight + 16, window.innerHeight - Math.max(rect.top, 0)),
      );
      const path = createHeroPetPath({
        height: patrolHeight,
        petHeight,
        petWidth,
        width: rect.width,
      });

      layoutRef.current = {
        height: patrolHeight,
        path,
        petHeight,
        petWidth,
        reducedMotion: reducedMotionQuery.matches,
        speed: compact ? mobileSpeed : desktopSpeed,
        width: rect.width,
      };

      if (!cat) {
        return;
      }

      cat.size = petWidth;
      cat.speed = compact ? mobileSpeed : desktopSpeed;

      if (!patrolRef.current.initialized || reducedMotionQuery.matches) {
        const firstPoint = path[0] ?? {
          x: petWidth / 2,
          y: petHeight / 2,
        };
        cat.x = firstPoint.x;
        cat.y = firstPoint.y;
        const firstTargetIndex = path.length > 1 ? 1 : 0;
        setCatTargetPoint(cat, path[firstTargetIndex] ?? firstPoint);
        patrolRef.current = {
          ...initialPatrol,
          initialized: true,
          targetIndex: firstTargetIndex,
        };
        cat.draw();
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
  }, []);

  useEffect(() => {
    function step(time: number) {
      const cat = onekoRef.current;
      const layout = layoutRef.current;
      const patrol = patrolRef.current;

      if (!patrol.lastFrameAt) {
        patrol.lastFrameAt = time;
      }

      const deltaSeconds = Math.min((time - patrol.lastFrameAt) / 1000, 0.05);
      patrol.lastFrameAt = time;

      if (cat && layout.path.length && !layout.reducedMotion) {
        if (isDraggingRef.current) {
          const dragSpeed = Math.hypot(
            dragRef.current.velocity.x,
            dragRef.current.velocity.y,
          );
          patrol.lastManualFrame +=
            deltaSeconds * (dragSpeed > 1 ? dragFrameRate : walkFrameRate / 2);
          setHeroCatSprite(
            cat,
            getDirectionSprite(dragRef.current.velocity),
            patrol.lastManualFrame,
          );
        } else if (isPettedRef.current) {
          cat.idleAnimation = "scratchSelf";
          cat.setTarget(cat.x, cat.y);
          setHeroCatSprite(
            cat,
            "scratchSelf",
            Math.floor(time / pettingFrameMs),
          );
        } else if (time < patrol.restingUntil) {
          cat.setTarget(cat.x, cat.y);
          setHeroCatSprite(cat, "idle", Math.floor(time / idleFrameMs));
          cat.draw();
        } else {
          const target = layout.path[patrol.targetIndex] ?? layout.path[0];
          const deltaX = target.x - cat.x;
          const deltaY = target.y - cat.y;
          const distance = Math.hypot(deltaX, deltaY);
          const moveSpeed =
            time < patrol.runUntil ? layout.speed * 1.45 : layout.speed;
          const stepDistance = moveSpeed * deltaSeconds;

          if (distance <= Math.max(cat.allowedTargetDistance, stepDistance)) {
            cat.x = target.x;
            cat.y = target.y;
            patrol.restingUntil = time + (target.rest ?? 0);
            patrol.targetIndex = (patrol.targetIndex + 1) % layout.path.length;
            cat.setTarget(cat.x, cat.y);
            setHeroCatSprite(cat, "idle", Math.floor(time / idleFrameMs));
            cat.draw();
          } else {
            setCatTargetPoint(cat, target);
            cat.x += (deltaX / distance) * stepDistance;
            cat.y += (deltaY / distance) * stepDistance;
            cat.draw();
            patrol.spriteFrame +=
              deltaSeconds *
              (time < patrol.runUntil ? runFrameRate : walkFrameRate);
            setHeroCatSprite(
              cat,
              getDirectionSprite({ x: deltaX, y: deltaY }),
              patrol.spriteFrame,
            );
          }
        }
      }

      animationRef.current = window.requestAnimationFrame(step);
    }

    animationRef.current = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationRef.current);
  }, []);

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
        <span
          aria-hidden="true"
          className="hero-pet-sprite-layer hero-pet-sprite-layer-primary"
        />
        <span
          aria-hidden="true"
          className="hero-pet-sprite-layer hero-pet-sprite-layer-next"
        />
        <span className="hero-pet-bubble">MEW</span>
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
  const left = pad + petWidth / 2;
  const right = Math.max(left, width - petWidth / 2 - pad);
  const top = Math.max(pad + petHeight / 2, height * 0.08 + petHeight / 2);
  const middle = Math.max(top, height * 0.42);
  const bottom = Math.max(top, height - petHeight / 2 - pad);
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

function getDirectionSprite(velocity: Point): OnekoSprite {
  const x = velocity.x;
  const y = velocity.y;
  const absoluteX = Math.abs(x);
  const absoluteY = Math.abs(y);

  if (Math.hypot(x, y) < 0.75) {
    return "alert";
  }

  const vertical = y < -1.2 ? "N" : y > 1.2 ? "S" : "";
  const horizontal = x < -1.2 ? "W" : x > 1.2 ? "E" : "";
  const direction = `${vertical}${horizontal}`;

  if (isOnekoSprite(direction)) {
    return direction;
  }

  if (absoluteX >= absoluteY) {
    return x < 0 ? "W" : "E";
  }

  return y < 0 ? "N" : "S";
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

function drawHeroCat(cat: HeroOneko) {
  const halfSize = cat.size / 2;

  cat.element.style.width = `${cat.size}px`;
  cat.element.style.height = `${cat.size}px`;
  cat.element.style.top = "0";
  cat.element.style.left = "0";
  cat.element.style.transform = `translate3d(${cat.x - halfSize}px, ${cat.y - halfSize}px, 0)`;

  return cat;
}

function isOnekoSprite(value: string): value is OnekoSprite {
  return value in heroCatSpriteSets;
}

function setHeroCatSprite(cat: HeroOneko, setName: OnekoSprite, frame: number) {
  const spriteSet = cat.spriteSets[setName] ?? cat.spriteSets.alert;
  const currentIndex = Math.floor(positiveModulo(frame, spriteSet.length));
  const sprite = spriteSet[currentIndex] ?? [0, 0];
  const { nextLayer, primaryLayer } = getHeroCatLayers(cat);

  if (primaryLayer && nextLayer) {
    cat.element.style.backgroundImage = "none";
    setHeroCatLayerSprite(primaryLayer, cat, sprite, 1);
    setHeroCatLayerSprite(nextLayer, cat, sprite, 0);
  } else {
    setHeroCatElementSprite(cat, sprite);
  }

  cat.draw();

  return cat;
}

function getHeroCatLayers(cat: HeroOneko) {
  const primaryLayer = cat.element.querySelector<HTMLSpanElement>(
    ".hero-pet-sprite-layer-primary",
  );
  const nextLayer = cat.element.querySelector<HTMLSpanElement>(
    ".hero-pet-sprite-layer-next",
  );

  return { nextLayer, primaryLayer };
}

function positiveModulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

function setHeroCatLayerSprite(
  layer: HTMLSpanElement | null,
  cat: HeroOneko,
  sprite: number[],
  opacity: number,
) {
  if (!layer) {
    return;
  }

  layer.style.position = "absolute";
  layer.style.inset = "0";
  layer.style.zIndex = "1";
  layer.style.display = "block";
  layer.style.backgroundImage = `url(${cat.source})`;
  layer.style.backgroundPosition = `${sprite[0] * cat.size}px ${sprite[1] * cat.size}px`;
  layer.style.backgroundSize = `${cat.size * heroCatAtlasColumns}px auto`;
  layer.style.backgroundRepeat = "no-repeat";
  layer.style.opacity = `${clamp(opacity, 0, 1)}`;
  layer.style.pointerEvents = "none";
}

function setHeroCatElementSprite(cat: HeroOneko, sprite: number[]) {
  cat.element.style.backgroundImage = `url(${cat.source})`;
  cat.element.style.backgroundPosition = `${sprite[0] * cat.size}px ${sprite[1] * cat.size}px`;
  cat.element.style.backgroundRepeat = "no-repeat";
  cat.element.style.backgroundSize = `${cat.size * heroCatAtlasColumns}px auto`;
}

function setCatTargetPoint(cat: HeroOneko, point: Point) {
  cat.setTarget(point.x, point.y);
}
