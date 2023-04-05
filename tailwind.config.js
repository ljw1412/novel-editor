/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    spacing: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '24px',
      6: '32px',
      7: '48px',
      8: '56px',
      9: '64px'
    },
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px'
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px'
    },
    strokeWidth: {
      1: '1',
      2: '2',
      3: '3',
      4: '4'
    },
    extend: {
      textColor: {
        'color-0': 'var(--color-text-0)',
        'color-1': 'var(--color-text-1)',
        'color-2': 'var(--color-text-2)',
        'color-3': 'var(--color-text-3)',
        'color-4': 'var(--color-text-4)',
        'color-common': 'var(--app-color-common)'
      },
      backgroundColor: {
        'color-1': 'var(--color-bg-1)',
        'color-2': 'var(--color-bg-2)',
        'color-3': 'var(--color-bg-3)',
        'color-4': 'var(--color-bg-4)',
        app: 'var(--app-color-bg)'
      }
    }
  },
  plugins: []
}
