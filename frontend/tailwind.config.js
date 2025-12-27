/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  mode: "jit",
  theme: {
    fontFamily: {
      Roboto: ["Roboto", "sans-serif"],
      Poppins: ["Poppins", "sans-serif"],
      Inter: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        // Mall of Cayman Color Palette - Cayman Islands Theme (Blue, White, Red)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#003DA5', // Cayman Blue (Main Brand Color)
          600: '#002d7a',
          700: '#002466',
          800: '#001a4d',
          900: '#001033',
        },
        secondary: {
          50: '#fefefe',
          100: '#ffffff', // White
          200: '#f8f9fa',
          300: '#e9ecef',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#C8102E', // Cayman Red (Accent Color)
          600: '#b30d26',
          700: '#9a0b21',
          800: '#7f091b',
          900: '#650716',
        },
        // Additional Cayman themed colors
        cayman: {
          blue: '#003DA5',
          darkBlue: '#002d7a',
          red: '#C8102E',
          darkRed: '#9a0b21',
          white: '#FFFFFF',
          lightBlue: '#e6f0ff',
          lightRed: '#ffe6ea',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        text: {
          primary: '#0f172a',
          secondary: '#334155',
          muted: '#64748b',
          light: '#94a3b8',
        }
      },
      screens: {
        "xs": "375px",
        "400px": "400px",
        "800px": "800px",
        "1000px": "1050px",
        "1100px": "1110px",
        "1300px": "1300px",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'unacademy': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'unacademy-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'unacademy-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'unacademy-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Mall of Cayman Shadows - Blue themed
        'moc': '0 1px 3px 0 rgba(0, 61, 165, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'moc-md': '0 4px 6px -1px rgba(0, 61, 165, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'moc-lg': '0 10px 15px -3px rgba(0, 61, 165, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'moc-xl': '0 20px 25px -5px rgba(0, 61, 165, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Mall of Cayman Shadows - Red themed
        'moc-red': '0 1px 3px 0 rgba(200, 16, 46, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'moc-red-md': '0 4px 6px -1px rgba(200, 16, 46, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'moc-red-lg': '0 10px 15px -3px rgba(200, 16, 46, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'fadeOut': 'fadeOut 0.25s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'slideOut': 'slideOut 0.25s ease-in',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'slideOutRight': 'slideOutRight 0.25s ease-in',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'slideOutLeft': 'slideOutLeft 0.25s ease-in',
        'slideInUp': 'slideInUp 0.3s ease-out',
        'slideInDown': 'slideInDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'scaleOut': 'scaleOut 0.15s ease-in',
        'modalSlideIn': 'modalSlideIn 0.2s ease-out',
        'modalSlideOut': 'modalSlideOut 0.2s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-20px)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-100%)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        modalSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        modalSlideOut: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
};
