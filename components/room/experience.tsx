"use client";

import "~/components/room/room.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useRef, useState } from "react";
import cafesignalLogo from "~/assets/products/cafesignal.webp";
import campuscueLogo from "~/assets/products/campuscue.webp";
import chatacademiaLogo from "~/assets/products/chatacademia.webp";
import lofihoodLogo from "~/assets/products/lofihood.webp";
import movehaloLogo from "~/assets/products/movehalo.webp";
import orchesteroLogo from "~/assets/products/orchestero.webp";
import pdfvectorLogo from "~/assets/products/pdfvector.webp";
import photodayCleanerLogo from "~/assets/products/photoday-cleaner.webp";
import spotterfuelLogo from "~/assets/products/spotterfuel.webp";
import wakearcLogo from "~/assets/products/wakearc.webp";
import { Loader } from "~/components/room/loader";
import type { ScreenItem } from "~/components/room/room-scene";
import { type CameraKey, cameraKeys, room } from "~/components/room/room-state";
import { appLinks, developerProjects, discordBot } from "~/lib/profile";

const RoomScene = dynamic(() => import("~/components/room/room-scene"), {
  ssr: false,
});

const appLogos: Record<(typeof appLinks)[number]["label"], string> = {
  LofiHood: lofihoodLogo.src,
  SpotterFuel: spotterfuelLogo.src,
  CampusCue: campuscueLogo.src,
  WakeArc: wakearcLogo.src,
  CafeSignal: cafesignalLogo.src,
  "PhotoDay Cleaner": photodayCleanerLogo.src,
  MoveHalo: movehaloLogo.src,
};

const projectLogos: Record<
  (typeof developerProjects)[number]["label"],
  string
> = {
  ChatAcademia: chatacademiaLogo.src,
  "PDF Vector": pdfvectorLogo.src,
  Orchestero: orchesteroLogo.src,
};

const macApps = appLinks.filter((app) => app.platform === "macOS");
const iosApps = appLinks.filter((app) => app.platform !== "macOS");

const toScreen = (app: (typeof appLinks)[number]): ScreenItem => ({
  label: app.label,
  description: app.description,
  host: new URL(app.href).hostname,
  logo: appLogos[app.label],
});
const macScreens = macApps.map(toScreen);
const iosScreens = iosApps.map(toScreen);
const workScreens: ScreenItem[] = developerProjects.map((project) => ({
  label: project.label,
  description: project.description,
  host: project.domain,
  logo: projectLogos[project.label],
}));

const socials = [
  ["GitHub", "https://github.com/khanhduyvt0101"],
  ["LinkedIn", "https://www.linkedin.com/in/buitrongkhanhduy/"],
  ["X", "https://x.com/khanhduyvt"],
  ["Threads", "https://www.threads.net/@_khanhduy"],
  ["Instagram", "https://www.instagram.com/_khanhduy/"],
  ["Facebook", "https://www.facebook.com/khanhduyvt0101"],
  ["Strava", "https://strava.app.link/cPWy22txK5b"],
  ["Hevy", "https://hevy.com/user/khanhduyvt0101"],
] as const;

interface ListItem {
  label: string;
  description: string;
  href: string;
  host: string;
  tag?: string;
  cta: string;
}

function Nav(): ReactNode {
  return (
    <header className="room-nav">
      <a className="room-nav-name" href="#hero">
        Khanh Duy
      </a>
      <nav aria-label="Sections" className="room-nav-links">
        <a href="#macos-apps">Mac</a>
        <a href="#ios-apps">iPhone</a>
        <a href="#owner-products">Voxy</a>
        <a href="#developer-products">Work</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

/** A tall section whose copy panel sticks while the camera works the room. */
function Stage({
  id,
  kicker,
  title,
  items,
  stage,
}: {
  id: string;
  kicker: string;
  title: string;
  items: ListItem[];
  stage: "mac" | "ios" | "work";
}): ReactNode {
  return (
    <section
      className="room-stage"
      data-stage={stage}
      id={id}
      style={{ height: `${(items.length + 1) * 90}svh` }}
    >
      <div className="room-sticky">
        <div className="room-panel">
          <p className="room-kicker">{kicker}</p>
          <h2 className="room-h2">{title}</h2>
          <ol className="room-list">
            {items.map((item, i) => (
              <li className="room-item" data-index={i} key={item.href}>
                <a
                  data-analytics-cta={item.cta}
                  href={item.href}
                  rel="noopener"
                  target="_blank"
                >
                  <div className="room-item-head">
                    <h3 className="room-item-name">{item.label}</h3>
                    {item.tag ? (
                      <span className="room-item-tag">{item.tag}</span>
                    ) : null}
                  </div>
                  <span className="room-item-desc">{item.description}</span>
                  <span className="room-item-host">
                    {item.host}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** True when WebGL runs on the CPU (no GPU), e.g. SwiftShader or llvmpipe. */
function softwareWebgl(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(
      renderer,
    );
  } catch {
    return true;
  }
}

const lerpKey = (a: CameraKey, b: CameraKey, t: number): CameraKey => ({
  px: a.px + (b.px - a.px) * t,
  py: a.py + (b.py - a.py) * t,
  pz: a.pz + (b.pz - a.pz) * t,
  tx: a.tx + (b.tx - a.tx) * t,
  ty: a.ty + (b.ty - a.ty) * t,
  tz: a.tz + (b.tz - a.tz) * t,
});

export function RoomExperience(): ReactNode {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Ready once the WebGL bundle has loaded its assets and drawn a compiled
    // frame, so the reveal never stutters.
    const id = window.setInterval(() => {
      if (room.firstFrame) {
        setReady(true);
        window.clearInterval(id);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, []);
  const [lite, setLite] = useState(false);
  const [software, setSoftware] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLite(
      window.matchMedia("(max-width: 767px), (pointer: coarse)").matches ||
        (navigator.hardwareConcurrency ?? 8) <= 4,
    );
    const cpuOnly = softwareWebgl();
    if (cpuOnly) {
      // No GPU: show a still of the room instead of rendering it on the CPU.
      room.progress = 100;
      room.firstFrame = true;
    }
    setSoftware(cpuOnly);
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    room.reducedMotion = reduce;
    if (!reduce && window.scrollY < 10) {
      // Start far out; the loader's reveal dollies the camera in.
      const hero = cameraKeys.hero as CameraKey;
      room.camera = {
        ...hero,
        px: hero.tx + (hero.px - hero.tx) * 1.9,
        py: hero.ty + (hero.py - hero.ty) * 1.6 + 1.2,
        pz: hero.tz + (hero.pz - hero.tz) * 1.9,
      };
    }
    gsap.registerPlugin(ScrollTrigger);
    const cleanups: (() => void)[] = [];

    let lenis: Lenis | null = null;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.1 });
      const l = lenis;
      l.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => l.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => {
        gsap.ticker.remove(raf);
        l.destroy();
      });
      const onAnchor = (event: MouseEvent) => {
        const link = (
          event.target as Element | null
        )?.closest<HTMLAnchorElement>('a[href^="#"]');
        const target = link
          ? document.querySelector<HTMLElement>(link.getAttribute("href") ?? "")
          : null;
        if (!target) return;
        event.preventDefault();
        l.scrollTo(target, { duration: 1.8 });
      };
      el.addEventListener("click", onAnchor);
      cleanups.push(() => el.removeEventListener("click", onAnchor));
    }

    const ctx = gsap.context(() => {
      // Camera: glide to each beat's key while its section rises into view.
      const beats: [string, keyof typeof cameraKeys][] = [
        ["#macos-apps", "mac"],
        ["#ios-apps", "ios"],
        ["#owner-products", "voxy"],
        ["#developer-products", "work"],
        ["#contact", "contact"],
      ];
      let previous: CameraKey = cameraKeys.hero as CameraKey;
      for (const [selector, key] of beats) {
        const from = previous;
        const to = cameraKeys[key] as CameraKey;
        ScrollTrigger.create({
          trigger: selector,
          start: "top bottom",
          end: "top top",
          onUpdate: (self) => {
            room.camera = lerpKey(
              from,
              to,
              gsap.parseEase("power2.inOut")(self.progress),
            );
          },
          onLeaveBack: () => {
            room.camera = from;
          },
          onLeave: () => {
            room.camera = to;
          },
        });
        previous = to;
      }

      // Active item per stage.
      for (const section of gsap.utils.toArray<HTMLElement>("[data-stage]")) {
        const stage = section.dataset.stage as "mac" | "ios" | "work";
        const items = Array.from(
          section.querySelectorAll<HTMLElement>(".room-item"),
        );
        const set = (p: number) => {
          const index = Math.min(
            items.length - 1,
            Math.floor(p * items.length),
          );
          room[stage] = index;
          for (const [i, item] of items.entries())
            item.classList.toggle("is-active", i === index);
        };
        set(0);
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => set(self.progress),
        });
      }

      const toggle = (selector: string, on: (active: boolean) => void) =>
        ScrollTrigger.create({
          trigger: selector,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => on(self.isActive),
        });
      toggle("#ios-apps", (a) => {
        room.phoneLift = a ? 1 : 0;
      });
      toggle("#owner-products", (a) => {
        room.voxy = a ? 1 : 0;
      });
      toggle("#contact", (a) => {
        room.wave = a;
      });

      if (!reduce) {
        for (const panel of gsap.utils.toArray<HTMLElement>(".room-reveal")) {
          gsap.from(panel, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: panel, start: "top 85%" },
          });
        }
      }
    }, el);
    cleanups.push(() => ctx.revert());

    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      room.pointer.x += (x - room.pointer.x) * 0.5;
      room.pointer.y += (y - room.pointer.y) * 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    cleanups.push(() => window.removeEventListener("pointermove", onMove));

    return () => {
      for (const cleanup of cleanups.reverse()) cleanup();
    };
  }, []);

  useEffect(() => {
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  const macItems: ListItem[] = macApps.map((app) => ({
    label: app.label,
    description: app.description,
    href: app.href,
    host: new URL(app.href).hostname,
    cta: `owner_showcase:${app.label}`,
  }));
  const iosItems: ListItem[] = iosApps.map((app) => ({
    label: app.label,
    description: app.description,
    href: app.href,
    host: new URL(app.href).hostname,
    tag: app.platform === "iPhone" ? undefined : app.platform,
    cta: `owner_showcase:${app.label}`,
  }));
  const workItems: ListItem[] = developerProjects.map((project) => ({
    label: project.label,
    description: project.description,
    href: project.href,
    host: project.domain,
    cta: `developer_showcase:${project.label}`,
  }));

  return (
    <div className="room" ref={root}>
      <noscript>
        <style>
          {
            ".room-loader{display:none}.room-hero-copy>*{transform:none}.room-item a{opacity:1}"
          }
        </style>
      </noscript>
      <Loader
        onReveal={() => {
          // Dolly in from the street to the desk, unless the visitor already scrolled.
          if (window.scrollY < 10)
            room.camera = { ...(cameraKeys.hero as CameraKey) };
          root.current?.classList.add("is-revealed");
        }}
        ready={ready}
      />
      <div aria-hidden="true" className="room-canvas">
        {mounted && software ? (
          // biome-ignore lint/performance/noImgElement: a plain still for devices without a GPU; next/image adds nothing in a static export.
          <img
            alt=""
            className="room-still"
            decoding="async"
            height={630}
            src="/room-still.webp"
            width={1200}
          />
        ) : null}
        {mounted && !software ? (
          <RoomScene
            ios={iosScreens}
            lite={lite}
            mac={macScreens}
            voxyLogo="/voxy-brand.webp"
            work={workScreens}
          />
        ) : null}
      </div>
      <Nav />

      <section className="room-hero" id="hero">
        <div className="room-hero-copy">
          <h1 className="room-hero-title">Khanh Duy</h1>
          <p className="room-hero-lede">
            I build small, calm apps for Mac, iPhone and Discord from my desk in
            Ho Chi Minh City.
          </p>
          <a className="room-hero-cue" href="#macos-apps">
            Come in and look around
          </a>
        </div>
      </section>

      <Stage
        id="macos-apps"
        items={macItems}
        kicker="On the Mac"
        stage="mac"
        title="Two menu bar apps"
      />
      <Stage
        id="ios-apps"
        items={iosItems}
        kicker="On iPhone and Apple Watch"
        stage="ios"
        title="Five pocket apps"
      />

      <section className="room-stage room-voxy" id="owner-products">
        <div className="room-sticky">
          <div className="room-panel room-reveal">
            <p className="room-kicker">On Discord</p>
            <h2 className="room-h2">{discordBot.label}</h2>
            <p className="room-lede">
              {discordBot.description} Type in a voice channel&apos;s chat and
              everyone in the room hears it, read in a natural Vietnamese voice.
            </p>
            <a
              className="room-button"
              data-analytics-cta="owner_showcase:Voxy"
              href={discordBot.href}
              rel="noopener"
              target="_blank"
            >
              Visit {new URL(discordBot.href).hostname}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <Stage
        id="developer-products"
        items={workItems}
        kicker="As a developer"
        stage="work"
        title="I help build"
      />

      <section className="room-contact" id="contact">
        <div className="room-panel room-reveal">
          <p className="room-kicker">Say hello</p>
          <h2 className="room-h2">Let&apos;s talk</h2>
          <a
            className="room-button"
            data-analytics-cta="contact:Email"
            href="mailto:khanhduyvt0101@gmail.com"
          >
            khanhduyvt0101@gmail.com
          </a>
          <nav aria-label="Profiles" className="room-links">
            {socials.map(([label, href]) => (
              <a
                data-analytics-cta={
                  label === "LinkedIn" ? "contact:LinkedIn" : undefined
                }
                href={href}
                key={label}
                rel="me noopener"
                target="_blank"
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="room-foot">
            Khanh Duy, Ho Chi Minh City. 3D models by Kenney (CC0).
          </p>
        </div>
      </section>
    </div>
  );
}
