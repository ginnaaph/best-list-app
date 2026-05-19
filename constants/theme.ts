export const colors = {
  white: "#FFFFFF",
  surface: "#F8F8F7",
  border: "#E8E6E0",
  secondaryText: "#888888",
  primaryText: "#1A1A1A",
  accentGreen: "#2D6A4F",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
} as const;

export const fonts = {
  display: "Georgia",
  body: "System",
  mono: "Menlo",
} as const;

export const typography = {
  brand: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
  },
  screenTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
  },
  score: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
} as const;

export const theme = {
  colors,
  radii,
  spacing,
  fonts,
  typography,
} as const;

export type BestListTheme = typeof theme;
