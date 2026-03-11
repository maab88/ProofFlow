const foundation = require('./src/theme/foundation.json');

const colors = {
  background: foundation.palette.ink,
  surface: foundation.palette.midnight,
  'surface-raised': foundation.palette.slateRaised,
  'surface-elevated': foundation.palette.slateRaised,
  border: foundation.palette.line,
  'border-strong': foundation.palette.lineStrong,
  'text-primary': foundation.palette.white,
  'text-secondary': foundation.palette.cloud,
  'text-muted': foundation.palette.fog,
  primary: foundation.palette.blue,
  success: foundation.palette.green,
  warning: foundation.palette.amber,
  danger: foundation.palette.red,
  'badge-neutral-bg': foundation.palette.slate,
  'badge-neutral-text': foundation.palette.cloud,
  'badge-info-bg': foundation.palette.blueSoft,
  'badge-info-text': foundation.palette.blue,
  'badge-success-bg': foundation.palette.greenSoft,
  'badge-success-text': foundation.palette.green,
  'badge-warning-bg': foundation.palette.amberSoft,
  'badge-warning-text': foundation.palette.amber,
  'badge-danger-bg': foundation.palette.redSoft,
  'badge-danger-text': foundation.palette.red,
  text: foundation.palette.white,
  muted: foundation.palette.fog,
  accent: foundation.palette.blue
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './index.js'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      borderRadius: {
        sm: `${foundation.radius.sm}px`,
        md: `${foundation.radius.md}px`,
        lg: `${foundation.radius.lg}px`,
        xl: `${foundation.radius.xl}px`,
        card: `${foundation.radius.card}px`,
        button: `${foundation.radius.lg}px`
      },
      boxShadow: {
        raised: foundation.elevation.raisedShadow,
        glow: foundation.elevation.focusGlow
      },
      spacing: {
        18: `${foundation.spacing['18']}px`
      },
      minHeight: {
        touch: `${foundation.sizing.touchMin}px`,
        control: `${foundation.sizing.controlHeight}px`
      },
      minWidth: {
        touch: `${foundation.sizing.touchMin}px`
      },
      width: {
        photo: `${foundation.sizing.photoTile}px`
      },
      height: {
        photo: `${foundation.sizing.photoTile}px`
      }
    }
  },
  plugins: []
};
