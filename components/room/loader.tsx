"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { room } from "~/components/room/room-state";

const SIGNATURE =
  "M17.5 43.5c3.6-12.9 8.8-24 17-31.1M29.5 32.6c13.5-14.5 27.3-22 34-15.7 6.2 5.9-10.2 15.4-33.1 18.8 12.9.4 23.3 4.9 31.4 12.5M77.5 46.2c4.9-13.7 10.4-25 18.1-33.7m-5.1 10.7c17.5-11.1 41.3-8.7 49.5 5.8 9.9 17.4-13.8 29-38.2 21.4-13.3-4.1-17.3-14.9-8.3-20.2";
const TAIL = "M138.7 33.3c9.4-.8 17.8-4.5 25-10.9";
/** Never reveal faster than this, so the signature finishes drawing. */
const MIN_MS = 1200;

interface Building {
  x: number;
  w: number;
  h: number;
  windows: { x: number; y: number; order: number }[];
}

/** A small deterministic skyline whose windows light up with progress. */
function skyline(): { buildings: Building[]; total: number } {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const buildings: Building[] = [];
  const windows: { b: number; x: number; y: number }[] = [];
  let x = 0;
  while (x < 300) {
    const w = 18 + Math.round(rand() * 22);
    const h = 26 + Math.round(rand() * 46);
    const b = buildings.length;
    buildings.push({ x, w, h, windows: [] });
    for (let wy = 80 - h + 6; wy < 74; wy += 8) {
      for (let wx = x + 4; wx < x + w - 5; wx += 7) {
        if (rand() > 0.35) windows.push({ b, x: wx, y: wy });
      }
    }
    x += w + 3;
  }
  // Light windows in a scattered order, not left to right.
  const order = windows.map((_, i) => i).sort(() => rand() - 0.5);
  order.forEach((wi, rank) => {
    const win = windows[wi];
    if (win)
      buildings[win.b]?.windows.push({ x: win.x, y: win.y, order: rank });
  });
  return { buildings, total: windows.length };
}

export function Loader({
  ready,
  onReveal,
}: {
  ready: boolean;
  onReveal: () => void;
}): ReactNode {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<"loading" | "lit" | "leaving" | "done">(
    "loading",
  );
  const started = useRef(0);
  const city = useMemo(skyline, []);
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;

  const readyRef = useRef(ready);
  readyRef.current = ready;

  // Ease the displayed percentage toward the real one; cap it at 90 until loaded.
  useEffect(() => {
    started.current = performance.now();
    let frame = 0;
    let value = 0;
    const tick = () => {
      const elapsed = performance.now() - started.current;
      const time = Math.min(1, elapsed / MIN_MS);
      // Safety net: never keep visitors behind the loader for more than 8 s.
      const loaded = readyRef.current || elapsed > 8000;
      const real = loaded ? 100 : room.progress;
      const goal = Math.min(real, loaded ? 100 : 90, time * 100);
      value += (goal - value) * 0.08;
      if (goal - value < 0.3) value = goal;
      setShown(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase === "loading" && shown >= 100) setPhase("lit");
  }, [shown, phase]);

  // Hold the lit moment briefly, then open the iris onto the room.
  useEffect(() => {
    if (phase !== "lit") return;
    const id = window.setTimeout(() => {
      setPhase("leaving");
      revealRef.current();
    }, 400);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const id = window.setTimeout(() => setPhase("done"), 1300);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "done") return null;
  const lit = Math.round((shown / 100) * city.total);
  const draw = shown / 100;

  return (
    <div aria-hidden="true" className={`room-loader is-${phase}`}>
      <div className="room-loader-glow" />
      <div className="room-loader-stage">
        <svg className="room-loader-sign" viewBox="0 0 176 56">
          <title>Khanh Duy signature</title>
          <path className="room-loader-sign-ghost" d={SIGNATURE} />
          <path
            d={SIGNATURE}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - Math.min(1, draw * 1.12)}
          />
          <path
            className="room-loader-sign-tail"
            d={TAIL}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - Math.max(0, (draw - 0.88) / 0.12)}
          />
        </svg>
        <svg className="room-loader-city" viewBox="0 0 300 82">
          <title>Skyline</title>
          {city.buildings.map((b) => (
            <g key={b.x}>
              <rect
                fill="#2a3247"
                height={b.h}
                width={b.w}
                x={b.x}
                y={80 - b.h}
              />
              {b.windows.map((w) => (
                <rect
                  className={w.order < lit ? "is-on" : undefined}
                  height={4}
                  key={`${w.x}-${w.y}`}
                  width={3}
                  x={w.x}
                  y={w.y}
                />
              ))}
            </g>
          ))}
          <rect fill="#3a4258" height={2} width={300} x={0} y={80} />
        </svg>
        <p className="room-loader-status">
          <span>
            {phase === "loading" ? "Turning on the lights" : "Come in"}
          </span>
          <span className="room-loader-count">{Math.round(shown)}%</span>
        </p>
      </div>
    </div>
  );
}
