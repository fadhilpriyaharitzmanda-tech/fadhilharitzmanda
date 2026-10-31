/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#af101a',
        'on-primary': '#ffffff',
        'on-primary-fixed': '#410003',
        surface: '#f9f9f9',
        'surface-container': '#eeeeee',
        'surface-container-high': '#e8e8e8',
        'surface-container-highest': '#e2e2e2',
        'surface-container-low': '#f3f3f3',
        'on-surface': '#1a1c1c',
        'on-surface-variant': '#5b403d',
        'brick-blue': '#0055a4',
        'brick-yellow': '#ffd700',
      },
      fontFamily: {
        'headline-md': ['"LEGO BRIX"', '"Plus Jakarta Sans"', 'sans-serif'],
        'display-lg': ['"Plus Jakarta Sans"', 'sans-serif'],
        'display-lg-mobile': ['"Plus Jakarta Sans"', 'sans-serif'],
        'button-text': ['"LEGO BRIX"', '"Plus Jakarta Sans"', 'sans-serif'],
        'label-caps': ['"LEGO BRIX"', '"Space Mono"', 'monospace'],
        'body-lg': ['"Work Sans"', 'sans-serif'],
        'body-md': ['"Work Sans"', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate(0%)' },
          'to': { transform: 'translate(-50%)' },
        },
        'float-badge-1': {
          '0%, 100%': { transform: 'translateY(0) rotate(2deg)' },
          '50%': { transform: 'translateY(-12px) rotate(-1.5deg)' },
        },
        'float-badge-2': {
          '0%, 100%': { transform: 'translateY(0) rotate(-2.5deg)' },
          '50%': { transform: 'translateY(12px) rotate(1.5deg)' },
        },
        'float-hero': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-10px) rotate(0.8deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%, 60%': { transform: 'translate(-4px)' },
          '40%, 80%': { transform: 'translate(4px)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'float-badge-1': 'float-badge-1 4s ease-in-out infinite',
        'float-badge-2': 'float-badge-2 4.5s ease-in-out infinite',
        'float-hero': 'float-hero 6s ease-in-out infinite',
        shake: 'shake 0.35s ease-in-out',
      },
    },
  },
  plugins: [],
}

