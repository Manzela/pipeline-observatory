/* Shared Tailwind CDN config — loaded by all three pages before page-specific scripts.
   Tokens are immutable across pages (Principle 11). Per-page motifs live in page-specific styles.
   Industrial / utilitarian register: paper + ink + 2 semantic accents.
   Mirrors the CSS custom properties in assets/chrome.css (single source of truth). */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper:     '#F8F6F1',
        paperDeep: '#F2EFE7',
        ink:       '#1A1A1A',
        inkMid:    '#4A4A4A',
        inkLow:    '#6A6A6A',   /* darkened from #8A8A8A (3.19:1) to meet WCAG AA 4.5:1 on paper / paper-deep */
        inkRule:   'rgba(26, 26, 26, 0.12)',
        detGreen:  '#2D5A2F',
        probBlue:  '#1B3A5C',
        signal:    '#B83216'
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'Cascadia Code', 'monospace']
      }
    }
  }
};
