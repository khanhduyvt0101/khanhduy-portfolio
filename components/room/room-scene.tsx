"use client";

import {
  Billboard,
  ContactShadows,
  PerformanceMonitor,
  RoundedBox,
  useAnimations,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CanvasTexture,
  DefaultLoadingManager,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  type Object3D,
  SRGBColorSpace,
  Vector3,
} from "three";
import { room } from "~/components/room/room-state";

export interface ScreenItem {
  label: string;
  description: string;
  host: string;
  logo: string;
}

export interface RoomSceneProps {
  lite: boolean;
  mac: ScreenItem[];
  ios: ScreenItem[];
  work: ScreenItem[];
  /** Speaker badge per voice product, in the voice stage's order. */
  voiceLogos: string[];
}

// Report asset progress to the (three-free) loader in the main bundle.
DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  room.progress = Math.max(room.progress, (loaded / Math.max(1, total)) * 100);
};

const S = 2; // Kenney furniture is modelled at half scale.
const DESK_TOP = 0.384 * S;
const M = (name: string) => `/models/${name}.glb`;

const palette = {
  wall: "#a9bfae",
  wallSide: "#9cb3a2",
  floor: "#7a4f35",
  trim: "#efe6d8",
  cork: "#b8875a",
  night: "#1a2442",
};

/** Loads a Kenney model, enables shadows and returns a fresh clone. */
function useModel(name: string): Object3D {
  const { scene } = useGLTF(M(name));
  return useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);
}

function Model({
  name,
  position,
  rotation = 0,
  scale = S,
}: {
  name: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}): ReactNode {
  const object = useModel(name);
  return (
    <primitive
      object={object}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    />
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** A canvas-backed texture redrawn whenever the active item changes. */
function useScreen(
  width: number,
  height: number,
  items: ScreenItem[],
  read: () => number,
  draw: (
    ctx: CanvasRenderingContext2D,
    item: ScreenItem,
    logo: HTMLImageElement | undefined,
    index: number,
  ) => void,
): CanvasTexture {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  }, [width, height]);
  const texture = useMemo(() => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);
  const logos = useRef<HTMLImageElement[]>([]);
  const shown = useRef(-1);

  useEffect(() => {
    let alive = true;
    Promise.all(
      items.map((item) => loadImage(item.logo).catch(() => undefined)),
    ).then((images) => {
      if (!alive) return;
      logos.current = images.filter(Boolean) as HTMLImageElement[];
      shown.current = -1;
    });
    return () => {
      alive = false;
    };
  }, [items]);

  useFrame(() => {
    const index = Math.min(items.length - 1, Math.max(0, read()));
    if (index === shown.current || logos.current.length === 0) return;
    shown.current = index;
    const ctx = canvas.getContext("2d");
    const item = items[index];
    if (!ctx || !item) return;
    draw(ctx, item, logos.current[index], index);
    texture.needsUpdate = true;
  });
  return texture;
}

function drawMac(
  ctx: CanvasRenderingContext2D,
  item: ScreenItem,
  logo: HTMLImageElement | undefined,
) {
  const { width: w, height: h } = ctx.canvas;
  const sky = ctx.createLinearGradient(0, 0, w, h);
  sky.addColorStop(0, "#2b3a67");
  sky.addColorStop(0.55, "#7a5ea8");
  sky.addColorStop(1, "#f2a37b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Menu bar
  ctx.fillStyle = "rgb(255 255 255 / 22%)";
  ctx.fillRect(0, 0, w, 28);
  ctx.fillStyle = "#fff";
  ctx.font = "600 16px system-ui, sans-serif";
  ctx.fillText(item.label, 44, 20);
  ctx.beginPath();
  ctx.arc(22, 14, 7, 0, Math.PI * 2);
  ctx.fill();
  // App window
  const ww = w * 0.62;
  const wh = h * 0.66;
  const wx = (w - ww) / 2;
  const wy = h * 0.17;
  ctx.shadowColor = "rgb(0 0 0 / 35%)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#f7f5f2";
  roundRect(ctx, wx, wy, ww, wh, 22);
  ctx.fill();
  ctx.shadowColor = "transparent";
  for (const [i, c] of ["#ff5f57", "#febc2e", "#28c840"].entries()) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(wx + 26 + i * 22, wy + 24, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  const icon = wh * 0.42;
  if (logo) {
    ctx.save();
    roundRect(ctx, wx + 48, wy + wh * 0.22, icon, icon, icon * 0.22);
    ctx.clip();
    ctx.drawImage(logo, wx + 48, wy + wh * 0.22, icon, icon);
    ctx.restore();
  }
  const tx = wx + 48 + icon + 36;
  ctx.fillStyle = "#1c1b29";
  ctx.font = "800 54px system-ui, sans-serif";
  ctx.fillText(item.label, tx, wy + wh * 0.36);
  ctx.fillStyle = "#5d5a70";
  ctx.font = "400 24px system-ui, sans-serif";
  wrap(ctx, item.description, tx, wy + wh * 0.36 + 44, ww - (tx - wx) - 36, 32);
  ctx.fillStyle = "#3d6ff0";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText(item.host, tx, wy + wh * 0.84);
  // Dock
  ctx.fillStyle = "rgb(255 255 255 / 28%)";
  roundRect(ctx, w * 0.3, h - 62, w * 0.4, 50, 16);
  ctx.fill();
}

function drawPhone(
  ctx: CanvasRenderingContext2D,
  item: ScreenItem,
  logo: HTMLImageElement | undefined,
) {
  const { width: w, height: h } = ctx.canvas;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#1f2b52");
  bg.addColorStop(1, "#3a2a5c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText("9:41", 48, 64);
  ctx.fillStyle = "#000";
  roundRect(ctx, w / 2 - 70, 26, 140, 40, 20);
  ctx.fill();
  const icon = w * 0.5;
  if (logo) {
    ctx.save();
    roundRect(ctx, (w - icon) / 2, h * 0.2, icon, icon, icon * 0.22);
    ctx.clip();
    ctx.drawImage(logo, (w - icon) / 2, h * 0.2, icon, icon);
    ctx.restore();
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "800 46px system-ui, sans-serif";
  ctx.fillText(item.label, w / 2, h * 0.2 + icon + 80);
  ctx.fillStyle = "rgb(255 255 255 / 72%)";
  ctx.font = "400 26px system-ui, sans-serif";
  wrap(ctx, item.description, w / 2, h * 0.2 + icon + 128, w * 0.8, 36);
  ctx.textAlign = "left";
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  item: ScreenItem,
  logo: HTMLImageElement | undefined,
) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = "#fbf8f2";
  ctx.fillRect(0, 0, w, h);
  if (logo) {
    const s = w * 0.42;
    ctx.save();
    roundRect(ctx, (w - s) / 2, h * 0.1, s, s, s * 0.2);
    ctx.clip();
    ctx.drawImage(logo, (w - s) / 2, h * 0.1, s, s);
    ctx.restore();
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#1c1b29";
  ctx.font = "800 44px system-ui, sans-serif";
  ctx.fillText(item.label, w / 2, h * 0.72);
  ctx.fillStyle = "#3d6ff0";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(item.host, w / 2, h * 0.84);
  ctx.textAlign = "left";
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  line: number,
) {
  let row = "";
  let yy = y;
  for (const word of text.split(" ")) {
    const test = row ? `${row} ${word}` : word;
    if (ctx.measureText(test).width > max && row) {
      ctx.fillText(row, x, yy);
      row = word;
      yy += line;
    } else {
      row = test;
    }
  }
  if (row) ctx.fillText(row, x, yy);
}

function NightWindow(): ReactNode {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 360;
    const ctx = c.getContext("2d");
    if (ctx) {
      const sky = ctx.createLinearGradient(0, 0, 0, c.height);
      sky.addColorStop(0, "#141c3a");
      sky.addColorStop(0.7, "#40306a");
      sky.addColorStop(1, "#c86f7a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#fff6d8";
      ctx.beginPath();
      ctx.arc(400, 70, 26, 0, Math.PI * 2);
      ctx.fill();
      let seed = 7;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (let layer = 0; layer < 2; layer++) {
        let x = -10;
        while (x < c.width) {
          const bw = 30 + rand() * 50;
          const bh =
            (layer === 0 ? 120 : 70) + rand() * (layer === 0 ? 150 : 90);
          ctx.fillStyle = layer === 0 ? "#252a4d" : "#161a33";
          ctx.fillRect(x, c.height - bh, bw, bh);
          for (let wy = c.height - bh + 10; wy < c.height - 8; wy += 14) {
            for (let wx = x + 6; wx < x + bw - 8; wx += 11) {
              if (rand() > 0.62) {
                ctx.fillStyle = rand() > 0.8 ? "#7de3ff" : "#ffd48a";
                ctx.fillRect(wx, wy, 5, 7);
              }
            }
          }
          x += bw + 4;
        }
      }
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={[-2.47, 1.65, -0.9]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.7, 1.15]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Frame and mullions */}
      {[
        [0, 0.6, 1.82, 0.07],
        [0, -0.6, 1.82, 0.07],
        [-0.88, 0, 0.07, 1.27],
        [0.88, 0, 0.07, 1.27],
        [0, 0, 0.04, 1.2],
      ].map(([x, y, w, h]) => (
        <mesh castShadow key={`${x}-${y}`} position={[x, y, 0.03]}>
          <boxGeometry args={[w, h, 0.06]} />
          <meshStandardMaterial color={palette.trim} />
        </mesh>
      ))}
      <mesh position={[0, -0.66, 0.08]}>
        <boxGeometry args={[1.9, 0.05, 0.18]} />
        <meshStandardMaterial color={palette.trim} />
      </mesh>
    </group>
  );
}

function Signature(): ReactNode {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 200;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fbf8f2";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.translate(80, 20);
      ctx.scale(2, 2.4);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#1c1b29";
      ctx.stroke(
        new Path2D(
          "M17.5 43.5c3.6-12.9 8.8-24 17-31.1M29.5 32.6c13.5-14.5 27.3-22 34-15.7 6.2 5.9-10.2 15.4-33.1 18.8 12.9.4 23.3 4.9 31.4 12.5M77.5 46.2c4.9-13.7 10.4-25 18.1-33.7m-5.1 10.7c17.5-11.1 41.3-8.7 49.5 5.8 9.9 17.4-13.8 29-38.2 21.4-13.3-4.1-17.3-14.9-8.3-20.2",
        ),
      );
      ctx.strokeStyle = "#14b8a6";
      ctx.stroke(new Path2D("M138.7 33.3c9.4-.8 17.8-4.5 25-10.9"));
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={[-0.25, 1.95, -2.47]}>
      <mesh castShadow>
        <boxGeometry args={[0.98, 0.42, 0.04]} />
        <meshStandardMaterial color="#2b2a35" />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[0.9, 0.35]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}

function MacScreen({ items }: { items: ScreenItem[] }): ReactNode {
  const texture = useScreen(1024, 620, items, () => room.mac, drawMac);
  return (
    <mesh position={[0, DESK_TOP + 0.355, -1.935]}>
      <planeGeometry args={[0.7, 0.42]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Phone({ items }: { items: ScreenItem[] }): ReactNode {
  const group = useRef<Group>(null);
  const texture = useScreen(512, 1024, items, () => room.ios, drawPhone);
  const rest = useMemo(() => new Vector3(0.55, DESK_TOP + 0.012, -1.62), []);
  const up = useMemo(() => new Vector3(0.62, DESK_TOP + 0.26, -1.6), []);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, delta * 4);
    const lift = room.phoneLift;
    g.position.lerp(rest.clone().lerp(up, lift), k);
    const t = state.clock.elapsedTime;
    g.rotation.x +=
      (-Math.PI / 2 + lift * (Math.PI / 2 - 0.25) - g.rotation.x) * k;
    g.rotation.z +=
      (0.35 * (1 - lift) + Math.sin(t * 0.8) * 0.03 * lift - g.rotation.z) * k;
    g.position.y += Math.sin(t * 1.4) * 0.004 * lift;
  });
  return (
    <group
      ref={group}
      position={rest.toArray()}
      rotation={[-Math.PI / 2, 0, 0.35]}
    >
      <RoundedBox
        args={[0.17, 0.34, 0.016]}
        castShadow
        radius={0.02}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#23222b"
          metalness={0.4}
          roughness={0.35}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.0085]}>
        <planeGeometry args={[0.155, 0.325]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function BoardCard({
  items,
  index,
}: {
  items: ScreenItem[];
  index: number;
}): ReactNode {
  const group = useRef<Group>(null);
  const texture = useScreen(512, 420, items, () => index, drawCard);
  useFrame((state, delta) => {
    const card = group.current;
    if (!card) return;
    const k = Math.min(1, delta * 5);
    const active = room.work === index;
    card.position.z += ((active ? 0.08 : 0.035) - card.position.z) * k;
    const s = active ? 1.08 : 1;
    card.scale.x += (s - card.scale.x) * k;
    card.scale.y += (s - card.scale.y) * k;
    card.rotation.z =
      (index - 1) * 0.06 +
      Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.01;
  });
  return (
    <group
      position={[(index - 1) * 0.56, index === 1 ? 0.04 : -0.03, 0.035]}
      ref={group}
    >
      <mesh castShadow>
        <planeGeometry args={[0.46, 0.38]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <mesh position={[0, 0.17, 0.01]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#e2574c" />
      </mesh>
    </group>
  );
}

function ProjectBoard({ items }: { items: ScreenItem[] }): ReactNode {
  return (
    <group position={[1.35, 1.75, -2.47]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.95, 0.04]} />
        <meshStandardMaterial color={palette.cork} roughness={0.95} />
      </mesh>
      {items.map((item, i) => (
        <BoardCard index={i} items={items} key={item.label} />
      ))}
    </group>
  );
}

function VoiceSpeaker({ logos }: { logos: string[] }): ReactNode {
  const rings = useRef<(Mesh | null)[]>([]);
  const badge = useRef<Group>(null);
  const face = useRef<MeshBasicMaterial>(null);
  const maps = useTexture(logos);
  for (const map of maps) map.colorSpace = SRGBColorSpace;
  useFrame((state, delta) => {
    const map = maps[Math.min(maps.length - 1, Math.max(0, room.voice))];
    if (face.current && map && face.current.map !== map) {
      face.current.map = map;
      face.current.needsUpdate = true;
    }
    const t = state.clock.elapsedTime;
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.6 + i / 3) % 1;
      const s = 0.4 + phase * 1.6;
      ring.scale.set(s, s, s);
      (ring.material as MeshStandardMaterial).opacity =
        (1 - phase) * 0.9 * room.voxy;
    });
    if (badge.current) {
      const target = 0.001 + room.voxy;
      badge.current.scale.setScalar(
        badge.current.scale.x +
          (target - badge.current.scale.x) * Math.min(1, delta * 4),
      );
      badge.current.position.y = DESK_TOP + 0.78 + Math.sin(t * 1.6) * 0.025;
    }
  });
  return (
    <group>
      <Model
        name="speakerSmall"
        position={[1.22, DESK_TOP, -2.08]}
        rotation={-0.25}
      />
      <Billboard position={[1.37, DESK_TOP + 0.3, -2.0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            ref={(m) => {
              rings.current[i] = m;
            }}
          >
            <ringGeometry args={[0.15, 0.158, 64]} />
            <meshStandardMaterial
              color="#7de3ff"
              emissive="#7de3ff"
              emissiveIntensity={2}
              toneMapped={false}
              transparent
            />
          </mesh>
        ))}
      </Billboard>
      <group
        position={[1.12, DESK_TOP + 0.78, -1.95]}
        ref={badge}
        scale={0.001}
      >
        <Billboard>
          <mesh>
            <circleGeometry args={[0.1, 48]} />
            <meshBasicMaterial map={maps[0]} ref={face} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <circleGeometry args={[0.112, 48]} />
            <meshBasicMaterial color="#f6f1e9" toneMapped={false} />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
}

function Character(): ReactNode {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(M("character-male-f"));
  const { actions } = useAnimations(animations, group);
  const current = useRef<string>("");
  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) mesh.castShadow = true;
    });
  }, [scene]);
  useFrame(() => {
    const next = room.wave ? "emote-yes" : "sit";
    if (next === current.current) return;
    const action = actions[next];
    if (!action) return;
    const prev = current.current ? actions[current.current] : undefined;
    action.reset().fadeIn(0.4).play();
    prev?.fadeOut(0.4);
    current.current = next;
  });
  return (
    <group
      ref={group}
      position={[-0.12, 0.47, -0.84]}
      rotation={[0, Math.PI, 0]}
      scale={1.05}
    >
      <primitive object={scene} />
    </group>
  );
}

function Room({
  mac,
  ios,
  work,
  voiceLogos,
}: Omit<RoomSceneProps, "lite">): ReactNode {
  return (
    <group>
      {/* Shell: floor and two walls, a cut-away diorama */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[5, 0.1, 5]} />
        <meshStandardMaterial color={palette.floor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, -2.55]} receiveShadow>
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial color={palette.wall} roughness={0.9} />
      </mesh>
      <mesh position={[-2.55, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3, 5.2]} />
        <meshStandardMaterial color={palette.wallSide} roughness={0.9} />
      </mesh>
      {/* Skirting */}
      <mesh position={[0, 0.05, -2.48]}>
        <boxGeometry args={[5, 0.1, 0.04]} />
        <meshStandardMaterial color={palette.trim} />
      </mesh>
      <mesh position={[-2.48, 0.05, 0]}>
        <boxGeometry args={[0.04, 0.1, 5]} />
        <meshStandardMaterial color={palette.trim} />
      </mesh>

      <NightWindow />
      <Signature />

      <Model name="rugRound" position={[-0.92, 0.003, 0.7]} />
      <Model name="desk" position={[-0.73, 0, -1.74]} />
      <Model name="computerScreen" position={[-0.39, DESK_TOP, -1.92]} />
      <MacScreen items={mac} />
      <Model name="computerKeyboard" position={[-0.28, DESK_TOP, -1.5]} />
      <Model name="computerMouse" position={[0.3, DESK_TOP, -1.5]} />
      <Model
        name="lampRoundTable"
        position={[-0.72, DESK_TOP, -1.95]}
        rotation={0.4}
      />
      <Model
        name="plantSmall2"
        position={[-0.55, DESK_TOP, -1.55]}
        scale={1.2}
      />
      <Phone items={ios} />
      <Model name="chairDesk" position={[0, 0, -0.95]} rotation={Math.PI} />
      <Character />

      <Model name="sideTable" position={[0.85, 0, -2.08]} />
      <VoiceSpeaker logos={voiceLogos} />
      <Model name="books" position={[1.62, DESK_TOP, -2.2]} rotation={-0.2} />

      <ProjectBoard items={work} />

      <Model
        name="bookcaseOpenLow"
        position={[-2.45, 0, 0.45]}
        rotation={Math.PI / 2}
      />
      <Model name="books" position={[-2.3, 0.8, 0.0]} rotation={Math.PI / 2} />
      <Model name="plantSmall1" position={[-2.2, 0.8, 0.55]} />
      <Model name="pottedPlant" position={[-2.15, 0, -2.0]} />
      <Model name="lampRoundFloor" position={[-2.1, 0, 1.6]} />
      <Model
        name="loungeChair"
        position={[-1.9, 0, 2.2]}
        rotation={Math.PI / 2 + 0.5}
      />
    </group>
  );
}

/** Compiles every material up front, then tells the loader the room is ready. */
function Ready(): ReactNode {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const frames = useRef(0);
  useEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) {
      room.progress = 100;
      room.firstFrame = true;
    }
  });
  return null;
}

function Rig(): ReactNode {
  const target = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(-0.2, 0.9, -1.2), []);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  useFrame((state, delta) => {
    const c = room.camera;
    // Portrait screens back the camera off along its view direction.
    const aspect = width / height;
    const back = aspect < 1 ? 1 + (1 - aspect) * 1.1 : 1;
    target.set(
      c.tx + (c.px - c.tx) * back + room.pointer.x * 0.12,
      c.ty + (c.py - c.ty) * back + room.pointer.y * 0.08,
      c.tz + (c.pz - c.tz) * back,
    );
    const k = room.reducedMotion ? 1 : 1 - Math.exp(-delta * 3.2);
    state.camera.position.lerp(target, k);
    look.x += (c.tx - look.x) * k;
    look.y += (c.ty - look.y) * k;
    look.z += (c.tz - look.z) * k;
    state.camera.lookAt(look);
  });
  return null;
}

export default function RoomScene({
  lite,
  ...content
}: RoomSceneProps): ReactNode {
  const maxDpr = lite ? 1.5 : 2;
  const [dpr, setDpr] = useState(maxDpr);
  return (
    <Canvas
      camera={{ position: [4.4, 3.1, 4.8], fov: 35, near: 0.05, far: 60 }}
      dpr={dpr}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      shadows={lite ? false : "soft"}
    >
      {/* Step resolution down on slow devices, back up when they recover. */}
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(maxDpr)}
      />
      <color args={["#1d2430"]} attach="background" />
      <fog args={["#1d2430", 9, 18]} attach="fog" />
      <hemisphereLight args={["#ffe2c4", "#2a2440", 1.1]} />
      <directionalLight
        castShadow
        color="#ffe9d6"
        intensity={1.6}
        position={[4, 6, 3]}
        shadow-bias={-0.0004}
        shadow-camera-bottom={-4}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        color="#ffb86b"
        decay={2}
        distance={4}
        intensity={2.4}
        position={[-0.6, DESK_TOP + 0.55, -1.85]}
      />
      <pointLight
        color="#7da8ff"
        decay={2}
        distance={5}
        intensity={1.6}
        position={[-2.0, 1.7, -0.9]}
      />
      <pointLight
        color="#9be7ff"
        decay={2}
        distance={2}
        intensity={0.8}
        position={[0, DESK_TOP + 0.4, -1.7]}
      />
      <Suspense fallback={null}>
        <Room {...content} />
        <Ready />
        <ContactShadows
          frames={1}
          opacity={0.35}
          position={[0, 0.002, 0]}
          scale={6}
          blur={2.4}
          far={2}
        />
      </Suspense>
      <Rig />
    </Canvas>
  );
}

for (const name of [
  "desk",
  "computerScreen",
  "computerKeyboard",
  "computerMouse",
  "chairDesk",
  "lampRoundTable",
  "plantSmall1",
  "plantSmall2",
  "pottedPlant",
  "bookcaseOpenLow",
  "books",
  "speakerSmall",
  "rugRound",
  "lampRoundFloor",
  "sideTable",
  "loungeChair",
  "character-male-f",
]) {
  useGLTF.preload(M(name));
}
