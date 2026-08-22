// ---------------------------------------------------------------
// AyurTrust — design tokens
// One source of truth for colour, type, motion and spacing.
// ---------------------------------------------------------------

// If the Fraunces font ever fails to load, set this to false and the
// whole app falls back to the system face. Nothing else changes.
export const USE_DISPLAY_FONT = true;

export const fonts = {
  display: USE_DISPLAY_FONT ? "Fraunces_600SemiBold" : undefined,
  displayBold: USE_DISPLAY_FONT ? "Fraunces_700Bold" : undefined,
};

export const colors = {
  // Surfaces — warm paper, never grey. Readable in direct sunlight.
  paper: "#FBF8F1",
  paperDeep: "#F4EEE0",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F1E6",
  line: "#E7DFCC",
  lineSoft: "#F1EADA",

  // Text
  ink: "#15271B",
  inkMuted: "#5C6A5E",
  inkFaint: "#8B9689",

  // Brand
  leaf: "#2E6B43",
  leafDark: "#1E4A2C",
  leafSoft: "#E6F0E6",
  turmeric: "#BE8A16",
  turmericSoft: "#FAF0D8",

  // States
  danger: "#AB4826",
  dangerSoft: "#F9E6DE",

  // Camera screen only
  night: "#0E1811",
};

// Soft ambient washes used behind every screen.
export const gradients = {
  page: ["#FCFAF4", "#F7F3E9", "#F0F1E5"],
  leafWash: ["#35784C", "#245536"],
  passportHead: ["#EBF3EB", "#DFECE1"],
};

export const type = {
  // Serif for display, system sans for anything read at speed.
  display: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    fontWeight: fonts.displayBold ? undefined : "700",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: fonts.display ? undefined : "700",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  body: { fontSize: 17, color: colors.inkMuted, lineHeight: 25.5 },
  bodyStrong: { fontSize: 17, fontWeight: "600", color: colors.ink },
  label: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.turmeric,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  mono: { fontFamily: "monospace", fontSize: 15, color: colors.inkMuted },
  caption: { fontSize: 14, color: colors.inkFaint },
};

export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 34 };

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

// Paper resting on paper — low and warm, never floating glass.
export const shadow = {
  shadowColor: "#4A3F22",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 5 },
  elevation: 2,
};

export const shadowLift = {
  shadowColor: "#1E4A2C",
  shadowOpacity: 0.2,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 7 },
  elevation: 5,
};

// Motion: slow enough to read, fast enough never to wait on.
export const motion = { enter: 500, press: 110, settle: 320 };