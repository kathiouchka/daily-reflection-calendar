module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          sage: {
            50: '#f4f7f4',
            100: '#e6ede6',
            200: '#d0dbd0',
            300: '#b3c4b3',
            400: '#8fa68f',
            500: '#6d8a6d',
            600: '#556e55',
            700: '#455845',
            800: '#3a483a',
            900: '#313c31',
          },
          pastel: {
            pink: '#FFD6E0',
            yellow: '#FFEFA1',
            green: '#C1E8E0',
            blue: '#C3D7F4',
            purple: '#D6CBFF',
            peach: '#FFCCA7',
          },
          journal: {
            paper: '#FAF7F2',
            ink: '#2C3E50',
            accent: '#54BAB9',
          },
          'brand-primary': '#6d7bff',
          'brand-surface': '#1e2138',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'scale-in': 'scaleIn 0.3s ease-out',
          'float': 'float 4s ease-in-out infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          scaleIn: {
            '0%': { transform: 'scale(0.95)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          serif: ['Lora', 'Georgia', 'serif']
        },
        backdropBlur: {
          xs: '2px',
        },
        boxShadow: {
          'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
          'soft-lg': '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      }
    },
    darkMode: "class",
    plugins: [
      require('@tailwindcss/typography'),
    ]
  };
  