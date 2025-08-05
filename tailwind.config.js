/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Theme-aware colors using CSS variables
      colors: {
        // Core theme colors
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',

        // Background system
        background: 'var(--background)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        'background-secondary': 'var(--background-secondary)',
        'surface-elevated': 'var(--surface-elevated)',

        // Border system
        border: 'var(--border)',
        'border-light': 'var(--border-light)',
        'border-strong': 'var(--border-strong)',

        // Text hierarchy
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-accent': 'var(--text-accent)',
        'text-inverse': 'var(--text-inverse)',

        // Status colors
        'status-success': 'var(--status-success)',
        'status-success-light': 'var(--status-success-light)',
        'status-warning': 'var(--status-warning)',
        'status-warning-light': 'var(--status-warning-light)',
        'status-error': 'var(--status-error)',
        'status-error-light': 'var(--status-error-light)',
        'status-info': 'var(--status-info)',
        'status-info-light': 'var(--status-info-light)',
        'status-pending': 'var(--status-pending)',
        'status-pending-light': 'var(--status-pending-light)',

        // Application stage colors
        'application-applied': 'var(--application-applied)',
        'application-applied-light': 'var(--application-applied-light)',
        'application-screening': 'var(--application-screening)',
        'application-screening-light': 'var(--application-screening-light)',
        'application-interview': 'var(--application-interview)',
        'application-interview-light': 'var(--application-interview-light)',
        'application-offer': 'var(--application-offer)',
        'application-offer-light': 'var(--application-offer-light)',
        'application-rejected': 'var(--application-rejected)',
        'application-rejected-light': 'var(--application-rejected-light)',

        // Interactive states
        'hover-bg': 'var(--hover-bg)',
        'active-bg': 'var(--active-bg)',
        'focus-ring': 'var(--focus-ring)',
        'disabled-bg': 'var(--disabled-bg)',
        'selected-bg': 'var(--selected-bg)',

        // Accent colors
        'accent-blue': 'var(--accent-blue)',
        'accent-purple': 'var(--accent-purple)',
        'accent-pink': 'var(--accent-pink)',
        'accent-orange': 'var(--accent-orange)',
        'accent-green': 'var(--accent-green)',
        'accent-yellow': 'var(--accent-yellow)',
        'accent-red': 'var(--accent-red)',
        'accent-blue-light': 'var(--accent-blue-light)',

        // Glass morphism
        'glass-subtle': 'var(--glass-subtle)',
        'glass-medium': 'var(--glass-medium)',
        'glass-strong': 'var(--glass-strong)',
        'glass-overlay': 'var(--glass-overlay)',

        // Glass component backgrounds
        'glass-bg': 'var(--glass-bg)',
        'glass-card-bg': 'var(--glass-card-bg)',
        'glass-sidebar-bg': 'var(--glass-sidebar-bg)',
        'glass-hover-bg': 'var(--glass-hover-bg)',
        'glass-button-bg': 'var(--glass-button-bg)',
        'glass-input-bg': 'var(--glass-input-bg)',
        'glass-selected-bg': 'var(--glass-selected-bg)',
      },      // Typography - Cohesive font system
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      // Cohesive font sizes matching CSS variables
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.4' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.1' }],
      },      // Layout and spacing - 8px base system
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '68': '17rem',    // 272px
        '84': '21rem',    // 336px
        '88': '22rem',    // 352px
        '92': '23rem',    // 368px
        '100': '25rem',   // 400px
        '120': '30rem',   // 480px
      },

      // Animations and transitions
      animation: {
        'float': 'float 20s infinite alternate',
        'float-reverse': 'float 25s infinite alternate-reverse',
        'pulse': 'pulse 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(5%, 5%) rotate(1deg)' },
          '50%': { transform: 'translate(2%, 8%) rotate(-1deg)' },
          '75%': { transform: 'translate(8%, 3%) rotate(1.5deg)' },
          '100%': { transform: 'translate(2%, 10%) rotate(-1deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '0' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },

      // Glassmorphism and backdrop effects
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': 'var(--blur-amount, 20px)',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
      },

      // Border radius
      borderRadius: {
        'xs': '0.125rem',  // 2px
        'sm': '0.25rem',   // 4px
        'md': '0.375rem',  // 6px
        'lg': '0.5rem',    // 8px
        'xl': '0.75rem',   // 12px
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
      },

      // Box shadows
      boxShadow: {
        'glass-sm': '0 2px 5px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.07)',
        'glass': '0 4px 12px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 10px 25px 0 rgba(0, 0, 0, 0.1), 0 5px 10px 0 rgba(0, 0, 0, 0.04)',
        'glass-xl': '0 20px 40px 0 rgba(0, 0, 0, 0.1), 0 10px 20px 0 rgba(0, 0, 0, 0.08)',
        'glass-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glass-dark': '0 4px 12px 0 rgba(0, 0, 0, 0.3), 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [
    // Custom plugin for additional glassmorphism utilities
    function ({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          backgroundColor: 'rgba(250, 13, 13, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)'
        },
        '.glass-dark': {
          backgroundColor: 'rgba(0, 81, 255, 1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.2)'
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(156, 163, 175, 0.3) transparent',
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(156, 163, 175, 0.3)',
            borderRadius: '20px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(156, 163, 175, 0.5)'
          }
        },
      };
      addUtilities(newUtilities, ['responsive', 'dark']);
    }
  ],
  corePlugins: {
    backdropFilter: true,
    container: false
  }
};
