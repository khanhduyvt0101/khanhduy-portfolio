/**
 * Media query breakpoints
 */
export const media = {
  desktop: 2080,
  laptop: 1680,
  tablet: 1040,
  mobile: 696,
  mobileS: 400,
};

/**
 * Convert a px string to a number
 */
export const pxToNum = (px: string): number => Number(px.replace("px", ""));

/**
 * Convert a number to a px string
 */
export const numToPx = (num: number): string => `${num}px`;

/**
 * Convert pixel values to rem for a11y
 */
export const pxToRem = (px: number): string => `${px / 16}rem`;

/**
 * Convert ms token values to a raw numbers for ReactTransitionGroup
 * Transition delay props
 */
export const msToNum = (msString: string): number =>
  Number(msString.replace("ms", ""));

/**
 * Convert a number to an ms string
 */
export const numToMs = (num: number): string => `${num}ms`;

/**
 * Convert an rgb theme property (e.g. rgbBlack: '0 0 0')
 * to values that can be spread into a ThreeJS Color class
 */
export const rgbToThreeColor = (rgb: string | undefined): number[] =>
  rgb?.split(" ").map((value) => Number(value) / 255) || [];

/**
 * Convert a JS object into `--` prefixed CSS custom properties.
 * Optionally pass a second param for normal styles
 */
export function cssProps(
  props: Record<string, number | string>,
  style: Record<string, string> = {}
): Record<string, string> {
  let result: Record<string, string> = {};

  const keys = Object.keys(props);

  for (const key of keys) {
    let value = props[key];

    if (typeof value === "number" && key === "delay") {
      value = numToMs(value);
    }

    if (typeof value === "number" && key !== "opacity") {
      value = numToPx(value);
    }

    result[`--${key}`] = String(value);
  }

  return { ...result, ...style };
}

/**
 * Concatenate classNames together
 */
export function classes(
  ...classNames: (string | undefined | null | false)[]
): string {
  return classNames.filter(Boolean).join(" ");
}
