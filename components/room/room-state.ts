/**
 * Shared, mutable state between the DOM (GSAP ScrollTrigger, pointer) and the
 * WebGL room. Plain objects keep React out of the per-frame path.
 */
export interface CameraKey {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
}

export const room = {
  /** Where the camera should be; the scene eases toward it every frame. */
  camera: {
    px: 4.4,
    py: 3.1,
    pz: 4.8,
    tx: -0.2,
    ty: 0.9,
    tz: -1.2,
  } as CameraKey,
  /** Smoothed pointer, -1..1. */
  pointer: { x: 0, y: 0 },
  /** Active item per stage (index into its list). */
  mac: 0,
  ios: 0,
  work: 0,
  /** 0..1: how far the phone has lifted off the desk. */
  phoneLift: 0,
  /** 0..1: Voxy speaker activity. */
  voxy: 0,
  /** True near the end of the page: the character waves. */
  wave: false,
  /** Asset loading progress 0..100, reported by the WebGL bundle. */
  progress: 0,
  /** Set once the WebGL scene has drawn a frame with everything compiled. */
  firstFrame: false,
  reducedMotion: false,
};

/** Camera keyframes per story beat, tuned for a 16:10 desktop viewport. */
export const cameraKeys: Record<string, CameraKey> = {
  hero: { px: 4.4, py: 3.1, pz: 4.8, tx: -0.2, ty: 0.9, tz: -1.2 },
  mac: { px: 0.55, py: 1.3, pz: -0.35, tx: -0.05, ty: 1.12, tz: -2.0 },
  ios: { px: 1.15, py: 1.45, pz: -0.75, tx: 0.62, ty: 1.0, tz: -1.75 },
  voxy: { px: 2.2, py: 1.45, pz: -0.35, tx: 1.3, ty: 1.15, tz: -2.1 },
  work: { px: 0.2, py: 1.7, pz: 0.45, tx: 0.85, ty: 1.7, tz: -2.5 },
  contact: { px: 3.2, py: 2.2, pz: 3.0, tx: -1.2, ty: 1.2, tz: -1.4 },
};
