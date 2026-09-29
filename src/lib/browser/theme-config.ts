export const themeConfig = {
  key: 'asymptotic-freedom-theme', themes: ['light', 'dark', 'system'],
  lightColor: '#ffffff', darkColor: '#121212',
};
export type Theme = 'light' | 'dark' | 'system';
/** Self-contained so the exact same policy can run inline before the first paint. */
export function applyInitialTheme(config: typeof themeConfig) {
  let theme = 'system';
  try {
    const saved = localStorage.getItem(config.key);
    if (saved && config.themes.includes(saved)) theme = saved;
  } catch { /* The system theme remains available without storage. */ }
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[data-theme-color]')?.setAttribute('content', dark ? config.darkColor : config.lightColor);
}
