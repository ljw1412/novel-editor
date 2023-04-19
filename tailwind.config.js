/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  important: 'body',
  content: [],
  theme: {
    spacing: {
      0: '0',
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
      none: '0',
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '36px',
      '5xl': '44px',
      '6xl': '52px',
      '7xl': '64px',
      '8xl': '76px',
      '9xl': '88px'
    },
    strokeWidth: {
      1: '1',
      2: '2',
      3: '3',
      4: '4'
    },
    extend: {
      lineHeight: {
        1: '1',
        2: '1.25',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '48px',
        8: '56px',
        9: '64px'
      },

      textColor: {
        white: '#ffffff',
        black: '#000000',
        'color-0': 'var(--color-text-0)',
        'color-1': 'var(--color-text-1)',
        'color-2': 'var(--color-text-2)',
        'color-3': 'var(--color-text-3)',
        'color-4': 'var(--color-text-4)',
        'color-theme': 'var(--app-theme)',
        'color-common': 'var(--app-color-common)'
      },
      backgroundColor: {
        white: '#ffffff',
        black: '#000000',
        'color-1': 'var(--color-bg-1)',
        'color-2': 'var(--color-bg-2)',
        'color-3': 'var(--color-bg-3)',
        'color-4': 'var(--color-bg-4)',
        'fill-1': 'var(--color-fill-1)',
        'fill-2': 'var(--color-fill-2)',
        'fill-3': 'var(--color-fill-3)',
        'fill-4': 'var(--color-fill-4)',
        'color-theme': opacityColor('var(--app-theme-rgb)'),
        'color-common': opacityColor('var(--app-color-common-rgb)'),
        'color-app': 'var(--app-color-bg)'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}

function opacityColor(rgb: string) {
  return ({ opacityVariable, opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(${rgb}, ${opacityValue})`
    }
    if (opacityVariable !== undefined) {
      return `rgba(${rgb}, var(${opacityVariable}, 1))`
    }
    return `rgb(${rgb})`
  }
}
