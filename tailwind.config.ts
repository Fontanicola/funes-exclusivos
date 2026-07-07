import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shell: {
          background: "#FAFAFA",
          border: "#E5E7EB",
          foreground: "#111827",
          muted: "#6B7280",
          hover: "#F3F4F6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
