/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Ensure prose utilities are never purged, even if not explicitly matched
    { pattern: /^prose/ },
    { pattern: /^prose-(p|h[234]|ul|ol|li|img|blockquote|code|hr|table|th|td|strong|a)(:.*)?/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        serif: ['var(--font-merriweather)', 'ui-serif', 'Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch', // Increased readability for wide screens
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}