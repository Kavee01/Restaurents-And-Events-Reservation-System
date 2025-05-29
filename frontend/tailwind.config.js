/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark blue colors
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#90caff',
          400: '#5badff',
          500: '#3b8ef0',
          600: '#276fde',
          700: '#1f5abc',
          800: '#1e4a94',
          900: '#1e4075',
          950: '#162a4f',
        },
        // Gold/luxury accent colors
        gold: {
          50: '#fbf7ef',
          100: '#f6ecd6',
          200: '#eed8ab',
          300: '#e6bd76',
          400: '#dda44f',
          500: '#d48833',
          600: '#c06b27',
          700: '#a05023',
          800: '#834023',
          900: '#6c3621',
          950: '#3d1b11',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'luxe': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'luxe-lg': '0 20px 35px -10px rgba(0, 0, 0, 0.15), 0 10px 15px -7px rgba(0, 0, 0, 0.07)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxe': 'linear-gradient(to right, #1e3c72, #2a5298)',
      },
    },
  },
  plugins: [],
} 