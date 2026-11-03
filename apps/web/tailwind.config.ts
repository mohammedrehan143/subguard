import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        subguard: {
          dark: "#0F172A",
          lime: "#10B981", // Crisp electric green / lime accent
          sand: "#F5F3EF", // Warm beige/sand
          surface: "#FFFFFF",
          border: "#E2E8F0",
          muted: "#64748B",
        },
      },
    },
  },
  plugins: [],
};

export default config;
