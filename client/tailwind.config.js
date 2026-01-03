export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {
      colors: {
        // Background gradients
        'bg-start': '#F4F5F7',
        'bg-end': '#FFF2CC',
        
        // Primary accent (soft yellow/amber)
        primary: {
          50: '#FFFCF2',
          100: '#FFF8E1',
          200: '#FFECB5',
          300: '#FFE082',
          400: '#FFD966', // Main accent
          500: '#FFC107',
          600: '#FFB300',
          700: '#FF8F00',
          800: '#FF6F00',
          900: '#E65100',
        },
        
        // Neutral grays
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#1F1F1F',
        },
        
        // Status colors
        success: '#22C55E',
        error: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -4px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 0 3px rgba(255, 217, 102, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        'auth': '12px',
        'glass': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
