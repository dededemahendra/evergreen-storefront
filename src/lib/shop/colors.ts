/** Maps catalog color names to swatch hex values. Falls back to neutral grey. */
const COLOR_HEX: Record<string, string> = {
  forest: "#2f5d4f",
  pine: "#1f3d34",
  moss: "#6b7d5a",
  slate: "#64748b",
  clay: "#b4654a",
  rust: "#a3522f",
  sand: "#d8c8a8",
  oat: "#e7dcc6",
  tan: "#c2a878",
  brown: "#6b4a2f",
  heather: "#9aa0a6",
  charcoal: "#36383a",
  black: "#1a1a1a",
  white: "#f4f4f5",
  grey: "#9ca3af",
  gray: "#9ca3af",
}

export function isColorOption(name: string): boolean {
  return name.trim().toLowerCase() === "color"
}

export function colorFor(value: string): string {
  return COLOR_HEX[value.trim().toLowerCase()] ?? "#cbd5e1"
}
