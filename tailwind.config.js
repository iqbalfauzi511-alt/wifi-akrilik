/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Google Blue
        brand: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4', // Core
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
          950: '#103975',
        },
        blue: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4', // Core
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
          950: '#103975',
        },
        indigo: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4', // Core
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
          950: '#103975',
        },
        // Google Yellow
        amber: {
          50: '#fff9e6',
          100: '#ffefc2',
          200: '#ffe08a',
          300: '#ffcd4c',
          400: '#fbbc05', // Core
          500: '#e5a800',
          600: '#c28b00',
          700: '#996a00',
          800: '#755000',
          900: '#5c3e00',
          950: '#332100',
        },
        // Google Green
        emerald: {
          50: '#e7f7ec',
          100: '#c3ebce',
          200: '#91d9a6',
          300: '#5ac27b',
          400: '#34a853', // Core
          500: '#269143',
          600: '#1d7334',
          700: '#175928',
          800: '#12451f',
          900: '#0e3619',
          950: '#071d0c',
        },
        // Google Red
        red: {
          50: '#fce8e6',
          100: '#f8c2be',
          200: '#f39891',
          300: '#ee6b60',
          400: '#ea4335', // Core
          500: '#d52c1e',
          600: '#ad2217',
          700: '#871a11',
          800: '#66140d',
          900: '#52100a',
          950: '#2e0704',
        },
        google: {
          blue: '#4285f4',
          red: '#ea4335',
          yellow: '#fbbc05',
          green: '#34a853',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
