module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design system colors
        'dark-bg': '#0A0A0F',
        'card-bg': '#111118',
        'sidebar-bg': '#0D0D14',
        'accent': '#4F6EF7',
        'success': '#10B981',
        'danger': '#EF4444',
        'secondary-text': '#6B7280',
        'input-bg': '#1A1A24',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
