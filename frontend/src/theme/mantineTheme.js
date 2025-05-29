import { colors } from './colors';

const mantineTheme = {
  // Set color scheme
  colorScheme: 'light',
  
  // Apply our custom palette to Mantine's colors
  colors: {
    // Primary (teal) as "teal"
    teal: [
      '#E5F0F4', // 0 - lightest shade
      '#C2DBE3', 
      '#9FC6D2', 
      '#7CB1C1', 
      '#5A9BB0', 
      '#387A9F', 
      colors.primary.main, // 6 - our main color
      '#144858', 
      '#0E3642', 
      '#08242D'  // 9 - darkest shade
    ],
    
    // Secondary (charcoal) as "dark"
    dark: [
      '#EAEAED', // 0 - lightest shade
      '#C5C7CE',
      '#A1A4AF',
      '#7C8090',
      '#575D71',
      '#3F4558',
      colors.secondary.main, // 6 - our main color
      '#232735',
      '#1A1D29', 
      '#10121C'  // 9 - darkest shade
    ],
    
    // Accent coral as "red"
    red: [
      '#FFEEEE', // 0 - lightest shade
      '#FFDADA',
      '#FFC5C5',
      '#FFB1B1',
      '#FF9C9C',
      '#FF8787',
      colors.accent.coral, // 6 - our main color
      '#E55757',
      '#CC4444', 
      '#B23131'  // 9 - darkest shade
    ],
    
    // Accent green as "green"
    green: [
      '#EFF5F1', // 0 - lightest shade
      '#D7E6DD',
      '#BED7C9',
      '#A6C8B5',
      '#8DB9A1',
      '#75AB8D',
      colors.accent.green, // 6 - our main color
      '#548367',
      '#42664D', 
      '#304A38'  // 9 - darkest shade
    ],
    
    // Accent gold as "yellow"
    yellow: [
      '#FCF8E9', // 0 - lightest shade
      '#F8F0D0',
      '#F4E8B6',
      '#F0E09D',
      '#ECD883',
      '#E8D06A',
      colors.accent.gold, // 6 - our main color
      '#CCAB55',
      '#AF9141', 
      '#92782D'  // 9 - darkest shade
    ],
  },
  
  // Set primary color
  primaryColor: 'teal',
  
  // Set Mantine component defaults
  components: {
    Button: {
      defaultProps: {
        color: 'teal',
        radius: 'md',
      },
    },
    Card: {
      styles: (theme) => ({
        root: {
          border: `1px solid ${theme.colors.gray[2]}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows.md,
          },
        },
      }),
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: colors.background.paper,
        },
      },
    },
  },

  // Set global styles
  globalStyles: (theme) => ({
    body: {
      backgroundColor: colors.background.default,
      color: colors.text.primary,
    },
    a: {
      color: theme.colors.teal[6],
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  }),
  
  // Update font settings
  fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 600,
  },
  
  // Adjust border radius for all components
  defaultRadius: 'md',
  
  // Shadows
  shadows: {
    xs: '0 1px 2px rgba(26, 27, 65, 0.05)',
    sm: '0 1px 3px rgba(26, 27, 65, 0.1)',
    md: '0 4px 6px rgba(26, 27, 65, 0.1)',
    lg: '0 10px 15px rgba(26, 27, 65, 0.1)',
    xl: '0 20px 25px rgba(26, 27, 65, 0.1)',
  },
};

export default mantineTheme; 