/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEEFE8",
        surface: "#FAFAF6",
        ink: "#1C2321",
        pine: {
          DEFAULT: "#1E4844",
          dark: "#153531",
          light: "#2C5F59",
        },
        ochre: {
          DEFAULT: "#C4832A",
          dark: "#9C6620",
          light: "#E0A552",
        },
        sage: "#8B9A8C",
        brick: "#AE3D33",
        moss: "#3F7D58",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
