/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Stitch "Precision Discovery" color tokens ──────────────────────
      colors: {
        // Surfaces
        surface:                    '#f8f9ff',
        'surface-dim':              '#d7dae2',
        'surface-bright':           '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#f0f4fc',
        'surface-container':        '#ebeef6',
        'surface-container-high':   '#e5e8f0',
        'surface-container-highest':'#dfe2ea',
        'surface-variant':          '#dfe2ea',
        'surface-tint':             '#5e5e5f',

        // On-surface
        'on-surface':         '#181c21',
        'on-surface-variant': '#444749',
        'inverse-surface':    '#2c3137',
        'inverse-on-surface': '#eef1f9',

        // Outline
        outline:         '#75777a',
        'outline-variant':'#c5c6c9',

        // Primary (deep obsidian)
        primary:                    '#000000',
        'on-primary':               '#ffffff',
        'primary-container':        '#1b1c1d',
        'on-primary-container':     '#848485',
        'inverse-primary':          '#c7c6c7',
        'primary-fixed':            '#e3e2e3',
        'primary-fixed-dim':        '#c7c6c7',
        'on-primary-fixed':         '#1b1c1d',
        'on-primary-fixed-variant': '#464748',

        // Secondary (cyan accent)
        secondary:                    '#006780',
        'on-secondary':               '#ffffff',
        'secondary-container':        '#85ddfe',
        'on-secondary-container':     '#00627a',
        'secondary-fixed':            '#b7eaff',
        'secondary-fixed-dim':        '#79d2f2',
        'on-secondary-fixed':         '#001f28',
        'on-secondary-fixed-variant': '#004d61',

        // Tertiary
        tertiary:                    '#000000',
        'on-tertiary':               '#ffffff',
        'tertiary-container':        '#1a1b1e',
        'on-tertiary-container':     '#838387',
        'tertiary-fixed':            '#e3e2e6',
        'tertiary-fixed-dim':        '#c7c6ca',
        'on-tertiary-fixed':         '#1a1b1e',
        'on-tertiary-fixed-variant': '#46474a',

        // Error
        error:              '#ba1a1a',
        'on-error':         '#ffffff',
        'error-container':  '#ffdad6',
        'on-error-container':'#93000a',

        // Backgrounds
        background:    '#f8f9ff',
        'on-background':'#181c21',

        // ── Pastel category accents ──────────────────────────────────────
        'pastel-peach':   '#FBE0CE',
        'pastel-mint':    '#D4F4E9',
        'pastel-lavender':'#E5DDF9',
        'pastel-blue':    '#DDF1FC',
        'pastel-pink':    '#F8DDF0',
        'pastel-grey':    '#E9EDF2',

        // ── Obsidian nav palette ─────────────────────────────────────────
        'nav-dark':      '#171819',
        'nav-dark-sub':  '#252629',
      },

      // ── Border radius ──────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: '0.25rem',
        sm:      '0.25rem',
        md:      '0.75rem',
        lg:      '1rem',
        xl:      '1.5rem',
        full:    '9999px',
      },

      // ── Spacing ───────────────────────────────────────────────────────
      spacing: {
        'space-xs':       '0.25rem',
        'space-sm':       '0.5rem',
        'space-md':       '1rem',
        'space-lg':       '1.5rem',
        'space-xl':       '2rem',
        gutter:           '1.25rem',
        'gutter-desktop': '1.5rem',
        margin:           '1rem',
        'margin-tablet':  '1.5rem',
        'margin-desktop': '2.5rem',
      },

      // ── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'headline-xl':  ['40px', { lineHeight: '48px', letterSpacing: '-0.02em',  fontWeight: '700' }],
        'headline-xl-m':['32px', { lineHeight: '40px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-lg':  ['30px', { lineHeight: '38px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-lg-m':['24px', { lineHeight: '32px', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'headline-md':  ['22px', { lineHeight: '28px', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'headline-sm':  ['18px', { lineHeight: '24px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-lg':      ['16px', { lineHeight: '24px', letterSpacing: '0em',      fontWeight: '400' }],
        'body-md':      ['14px', { lineHeight: '20px', letterSpacing: '0em',      fontWeight: '400' }],
        'body-sm':      ['13px', { lineHeight: '18px', letterSpacing: '0.005em',  fontWeight: '400' }],
        'label-lg':     ['14px', { lineHeight: '18px', letterSpacing: '0.01em',   fontWeight: '600' }],
        'label-md':     ['12px', { lineHeight: '16px', letterSpacing: '0.015em',  fontWeight: '500' }],
        'label-sm':     ['11px', { lineHeight: '14px', letterSpacing: '0.02em',   fontWeight: '600' }],
      },

      // ── Shadows (Stitch elevation levels) ────────────────────────────
      boxShadow: {
        'card':    '0 2px 6px rgba(23,24,25,0.04)',
        'card-hover':'0 8px 20px rgba(23,24,25,0.08)',
        'modal':   '0 16px 36px rgba(23,24,25,0.12)',
        'app':     '0 4px 24px rgba(23,24,25,0.06)',
      },

      // ── Animations ────────────────────────────────────────────────────
      animation: {
        'fade-up':   'fade-up 0.4s ease-out both',
        'slide-in':  'slide-in 0.4s ease-out both',
        'float':     'float 6s ease-in-out infinite',
        'shimmer':   'shimmer 2s linear infinite',
        'pulse-slow':'pulse-slow 3s ease-in-out infinite',
        'ping-sm':   'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-800px 0' },
          '100%': { backgroundPosition: '800px 0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};