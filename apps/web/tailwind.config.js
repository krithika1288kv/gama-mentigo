/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ust-dark-teal": "#006E74",
        "ust-light-teal": "#0097AC",
        "ust-teal-deep": "#004851",
        "ust-black": "#231F20",
        "ust-white": "#FFFFFF",
        "ust-off": "#EEF6F7",
        "ust-green": "#0a9b72",
        "ust-coral": "#e0604a",
        "ust-warm": "#c75b45",
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "14px",
        control: "8px",
      },
    },
  },
  plugins: [],
};
