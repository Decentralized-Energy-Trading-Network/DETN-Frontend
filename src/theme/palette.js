import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// SETUP COLORS - Solar Energy Trading Network Theme

export const grey = {
  0: '#FFFFFF',
  100: '#F8FAF7',
  200: '#EEF2EC',
  300: '#DCE4D9',
  400: '#C3CFC0',
  500: '#99A895',
  600: '#6B7868',
  700: '#4E5A4C',
  800: '#323D30',
  900: '#1A211A',
};

export const primary = {
  lighter: '#E6F5DF',
  light: '#9DD98A',
  main: '#4CAF50',  // Green representing sustainability
  dark: '#2E7D32',
  darker: '#1B4D20',
  contrastText: '#FFFFFF',
};

export const secondary = {
  lighter: '#E1F5FE',
  light: '#81D4FA',
  main: '#29B6F6',  // Blue representing solar/sky
  dark: '#0288D1',
  darker: '#01579B',
  contrastText: '#FFFFFF',
};

export const info = {
  lighter: '#E0F7FA',
  light: '#80DEEA',
  main: '#26C6DA',  // Teal representing technology
  dark: '#0097A7',
  darker: '#006064',
  contrastText: '#FFFFFF',
};

export const success = {
  lighter: '#E8F5E9',
  light: '#A5D6A7',
  main: '#66BB6A',  // Green representing growth
  dark: '#388E3C',
  darker: '#1B5E20',
  contrastText: '#FFFFFF',
};

export const warning = {
  lighter: '#FFF8E1',
  light: '#FFE082',
  main: '#FFC107',  // Amber representing sun/solar energy
  dark: '#FFA000',
  darker: '#FF6F00',
  contrastText: grey[800],
};

export const error = {
  lighter: '#FFEBEE',
  light: '#EF9A9A',
  main: '#F44336',  // Red - keeping for system alerts
  dark: '#D32F2F',
  darker: '#B71C1C',
  contrastText: '#FFFFFF',
};

export const common = {
  black: '#000000',
  white: '#FFFFFF',
};

export const action = {
  hover: alpha(grey[500], 0.08),
  selected: alpha(grey[500], 0.16),
  disabled: alpha(grey[500], 0.8),
  disabledBackground: alpha(grey[500], 0.24),
  focus: alpha(grey[500], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

const base = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  grey,
  common,
  divider: alpha(grey[500], 0.2),
  action,
};

// ----------------------------------------------------------------------

export function palette() {
  return {
    ...base,
    mode: 'light',
    text: {
      primary: grey[800],
      secondary: grey[600],
      disabled: grey[500],
    },
    background: {
      paper: '#FFFFFF',
      default: grey[100],
      neutral: grey[200],
    },
    action: {
      ...base.action,
      active: grey[600],
    },
  };
}