/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#071A3D',
          light: '#0A2248',
        },
        royal: {
          DEFAULT: '#1455D9',
          light: '#1E66E8',
          dark: '#0D40A8',
        },
        bright: {
          DEFAULT: '#2878E8',
          light: '#3D8AEE',
        },
        gold: {
          DEFAULT: '#F4C430',
          light: '#F6CE50',
          dark: '#D4A828',
        },
        cyan: {
          DEFAULT: '#22C7E8',
          light: '#48D4EC',
          dark: '#1AA8C4',
        },
        obsidian: {
          DEFAULT: '#030712',
          card: '#070E1E',
          surface: '#0B162C',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        sapphire: {
          DEFAULT: '#0E3A94',
          deep: '#06163A',
          glow: '#1E66E8',
          light: '#3B82F6',
        },
        champagne: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          hover: '#E5C266',
          dark: '#AA820A',
        },
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'premium': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'lux-gold': '0 0 25px -3px rgba(212, 175, 55, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.4)',
        'lux-sapphire': '0 0 30px -4px rgba(30, 102, 232, 0.3), 0 12px 24px -6px rgba(3, 7, 18, 0.5)',
        'lux-glass': '0 8px 32px 0 rgba(3, 7, 18, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'shimmer-gold': 'shimmerGold 3s linear infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmerGold: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}