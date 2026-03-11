import foundation from '@/theme/foundation.json';

const palette = foundation.palette;

export const theme = {
  palette,
  colors: {
    background: palette.ink,
    surface: palette.midnight,
    surfaceRaised: palette.slateRaised,
    border: palette.line,
    borderStrong: palette.lineStrong,
    textPrimary: palette.white,
    textSecondary: palette.cloud,
    textMuted: palette.fog,
    primary: palette.blue,
    primaryPressed: palette.blueStrong,
    success: palette.green,
    warning: palette.amber,
    danger: palette.red,
    text: palette.white,
    muted: palette.fog,
    accent: palette.blue,
    surfaceElevated: palette.slateRaised,
    badge: {
      neutral: {
        background: palette.slate,
        text: palette.cloud,
      },
      info: {
        background: palette.blueSoft,
        text: palette.blue,
      },
      success: {
        background: palette.greenSoft,
        text: palette.green,
      },
      warning: {
        background: palette.amberSoft,
        text: palette.amber,
      },
      danger: {
        background: palette.redSoft,
        text: palette.red,
      },
    },
  },
  spacing: {
    ...foundation.spacing,
    screenX: foundation.spacing['5'],
    section: foundation.spacing['6'],
    cardX: foundation.spacing['5'],
    cardY: foundation.spacing['5'],
  },
  radius: foundation.radius,
  typography: foundation.typography,
  sizing: foundation.sizing,
  elevation: foundation.elevation,
  touch: {
    minimum: foundation.sizing.touchMin,
    comfortable: foundation.sizing.controlHeight,
  },
  guidance: {
    touchTarget: 'Use 48px minimum tap areas and 56px for primary controls.',
    buttonHeight: 'Primary controls should use 56px height for one-thumb use.',
    bottomBar: 'Reserve fixed bottom actions for the single obvious primary task.',
    contrast: 'Favor layered surfaces over stark black and white contrast to stay calm on job sites.',
  },
} as const;

export type BadgeTone = keyof typeof theme.colors.badge;
