import type { Config } from "tailwindcss";
export default { darkMode: "class", content: ["./app/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink: "#171717", paper: "#f4f1ea", violet: "#7656e8", acid: "#d8ff63" }, boxShadow: { card: "0 20px 60px rgba(20,18,15,.08)" } } }, plugins: [] } satisfies Config;
