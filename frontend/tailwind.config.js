/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          yellow: '#FFDE59',
          'yellow-light': '#FFE17D',
          mint: '#98D8AA',
          'mint-light': '#A8E6CF',
          pink: '#FF8080',
          'pink-light': '#FF8B8B',
          cyan: '#54BAB9',
          'cyan-light': '#A0E7E5',
          lilac: '#D8B4F8',
          offwhite: '#F8F9FA',
          cream: '#FFFDF0',
          dark: '#121212',
          'dark-bg': '#0B0F19',
          'dark-card': '#151D2F',
          'dark-surface': '#1A2234',
          'dark-border': '#334155',
        },
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-md': '6px 6px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
        'neo-xl': '12px 12px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
