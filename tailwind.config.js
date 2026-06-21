/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E31212',
          dark: '#1a1a1a',
          light: '#f5f5f5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        float: 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
