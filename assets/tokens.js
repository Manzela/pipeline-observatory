/* Shared Tailwind CDN config — loaded by all three pages before page-specific scripts.
   Tokens are immutable across pages (Principle 11). Per-page motifs live in page-specific styles. */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        appleBg:      '#000000',
        appleSurface: '#1d1d1f',
        appleDarker:  '#151516',
        appleBorder:  '#424245',
        appleLight:   '#f5f5f7',
        appleGray:    '#86868b',
        appleBlue:    '#2997ff',
        appleGreen:   '#34d399',
        appleRed:     '#f87171',
        appleAmber:   '#fbbf24'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    }
  }
};
