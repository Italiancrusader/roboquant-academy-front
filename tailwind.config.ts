import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1180px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#0F1117',
        foreground: '#F8F9FA',
        'blue-primary': '#0080FF',
        'teal-primary': '#00E5FF',
        'section-dark': '#1A1F2C',
        primary: {
          DEFAULT: '#0080FF',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#1A1F2C',
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: '#1A1F2C',
          foreground: '#94A3B8'
        },
        accent: {
          DEFAULT: '#1E293B',
          foreground: '#FFFFFF'
        },
        popover: {
          DEFAULT: '#0F1117',
          foreground: '#F8F9FA'
        },
        card: {
          DEFAULT: '#1A1F2C',
          foreground: '#F8F9FA'
        }
      },
      fontFamily: {
        'segoe': ['"Segoe UI"', 'system-ui', 'sans-serif'],
        'neulis': ['neulis-sans', 'sans-serif']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        'section-desktop': '6rem',
        'section-mobile': '3rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'hover-lift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-5px)' },
        },
        'tilt': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(4deg)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'hover-lift': 'hover-lift 0.3s ease-out forwards',
        'tilt': 'tilt 0.3s ease-out forwards',
        'gradient-shift': 'gradient-shift 3s ease infinite alternate',
        'spin-slow': 'spin-slow 3s linear infinite'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #0080FF, #00E5FF)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
