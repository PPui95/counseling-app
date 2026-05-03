export const Colors = {
  primary: '#4CAF8E',       // Mint green
  primaryLight: '#E8F5F0',  // Light mint
  primaryDark: '#357A5E',   // Dark mint
  secondary: '#7BB8D4',     // Light blue
  secondaryLight: '#E3F2FD',
  accent: '#F9A825',        // Warm amber
  background: '#F7FAFA',    // Warm white
  surface: '#FFFFFF',
  surfaceAlt: '#F0F7F4',
  text: '#2C3E50',
  textSecondary: '#6B7C8C',
  textLight: '#9EADB8',
  border: '#D9E8E3',
  error: '#E57373',
  success: '#66BB6A',
  warning: '#FFA726',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',

  // Role colors
  counselor: '#4CAF8E',
  client: '#7BB8D4',

  // Assessment severity
  minimal: '#66BB6A',
  mild: '#AED581',
  moderate: '#FFA726',
  moderatelySevere: '#FF7043',
  severe: '#E53935',
} as const;

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
