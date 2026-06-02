import typography from '@tailwindcss/typography';

/**
 * Shared Lens Journal Tailwind preset — design tokens (colors, fonts,
 * animations) and the typography plugin. Apps extend this in their
 * `tailwind.config`:
 *
 *   import lensPreset from '@lens-journal/theme/tailwind-preset';
 *   export default { presets: [lensPreset], content: [...] };
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#16161a', soft: '#3a3a44', muted: '#6b6b76' },
        paper: { DEFAULT: '#fbfbf9', soft: '#f3f2ee' },
        night: { DEFAULT: '#0d0d10', soft: '#16161c', panel: '#1d1d24' },
        accent: { DEFAULT: '#c2410c', soft: '#ea580c' },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      letterSpacing: { tightest: '-0.04em' },
      maxWidth: { prose: '68ch', content: '1200px' },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.9s ease both',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink.soft'),
            '--tw-prose-headings': theme('colors.ink.DEFAULT'),
            '--tw-prose-links': theme('colors.accent.DEFAULT'),
            '--tw-prose-quotes': theme('colors.ink.soft'),
            '--tw-prose-invert-body': theme('colors.paper.soft'),
            '--tw-prose-invert-headings': '#ffffff',
            '--tw-prose-invert-links': theme('colors.accent.soft'),
            maxWidth: '68ch',
            fontFamily: theme('fontFamily.serif').join(', '),
          },
        },
      }),
    },
  },
  plugins: [typography],
};
