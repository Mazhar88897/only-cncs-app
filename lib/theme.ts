import { createTheme } from '@shopify/restyle';

const palette = {
  purpleLight: '#8B5CF6',
  purpleMain: '#7C3AED',
  purpleDark: '#6D28D9',
  greenLight: '#34D399',
  greenMain: '#10B981',
  greenDark: '#059669',
  redLight: '#F87171',
  redMain: '#EF4444',
  redDark: '#DC2626',
  black: '#000000',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

const theme = createTheme({
  colors: {
    ...palette,
    primary: palette.purpleMain,
    primaryLight: palette.purpleLight,
    primaryDark: palette.purpleDark,
    secondary: palette.greenMain,
    secondaryLight: palette.greenLight,
    secondaryDark: palette.greenDark,
    danger: palette.redMain,
    dangerLight: palette.redLight,
    dangerDark: palette.redDark,
    background: palette.white,
    foreground: palette.black,
    card: palette.white,
    cardForeground: palette.black,
    popover: palette.white,
    popoverForeground: palette.black,
    muted: palette.gray200,
    mutedForeground: palette.gray600,
    accent: palette.gray100,
    accentForeground: palette.gray900,
    border: palette.gray200,
    input: palette.gray200,
    ring: palette.purpleMain,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadii: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
  },
  textVariants: {
    header: {
      fontSize: 34,
      fontWeight: 'bold',
    },
    subheader: {
      fontSize: 28,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
    },
    defaults: {
      fontSize: 16,
    },
  },
});

export type Theme = typeof theme;
export default theme; 