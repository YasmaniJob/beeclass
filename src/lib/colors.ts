
export const defaultColor = "#59AB45"; // The default green color in hex

/**
 * Converts a HEX color value to HSL. Conversion formula adapted from
 * http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * @param hex The hex color value.
 * @returns The HSL representation "h s% l%".
 */
export function hexToHsl(hex: string): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = (cmax + cmin) / 2;

  if (delta !== 0) {
    if (cmax === r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    if (h < 0) {
      h += 360;
    }

    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  }

  s = Number((s * 100).toFixed(1));
  l = Number((l * 100).toFixed(1));

  return `${h} ${s}% ${l}%`;
}

/**
 * Converts a HEX color values to RGB components.
 *
 * @param hex The hex color value (with or without leading #).
 * @returns An object with numeric r, g, b components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const sanitized = (hex ?? "").trim();
  const source = sanitized.length > 0 ? sanitized : defaultColor;
  const normalized = source.startsWith("#") ? source.slice(1) : source;

  let r = 0;
  let g = 0;
  let b = 0;

  if (normalized.length === 3) {
    r = parseInt(normalized[0] + normalized[0], 16);
    g = parseInt(normalized[1] + normalized[1], 16);
    b = parseInt(normalized[2] + normalized[2], 16);
  } else if (normalized.length === 6) {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  } else {
    return hexToRgb(defaultColor);
  }

  return { r, g, b };
}
