export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 45px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        surface: '#111827',
        panel: '#1f2937',
        accent: '#2563eb',
      },
    },
  },
  plugins: [],
};
