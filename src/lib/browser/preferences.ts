import { readStorage, writeStorage } from './storage';
import { themeConfig, type Theme } from './theme-config';

const wallpaperKey = 'asymptotic-freedom-wallpaper';
const wallpapers = ['plain', 'grid', 'orbit'] as const;
type Wallpaper = typeof wallpapers[number];
const isTheme = (value: string | null | undefined): value is Theme => !!value && themeConfig.themes.includes(value);
const isWallpaper = (value: string | null): value is Wallpaper => !!value && wallpapers.includes(value as Wallpaper);
let wallpaper: Wallpaper = 'plain';
let initialized = false;

export const resolvedDark = () => document.documentElement.dataset.theme === 'dark'
  || (document.documentElement.dataset.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);

function syncControls() {
  const theme = document.documentElement.dataset.theme || 'system';
  const dark = resolvedDark();
  document.querySelector('meta[data-theme-color]')?.setAttribute('content', dark ? themeConfig.darkColor : themeConfig.lightColor);
  document.querySelectorAll<HTMLButtonElement>('[data-theme-cycle]').forEach(button => {
    button.textContent = theme === 'system' ? '随系统' : dark ? '深色' : '浅色';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
    button.title = dark ? '切换到浅色模式' : '切换到深色模式';
  });
  document.querySelectorAll<HTMLElement>('[data-study-theme]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.studyTheme === theme));
  });
  const drawer = document.querySelector<HTMLElement>('[data-study-drawer]');
  const enabled = drawer?.dataset.wallpaperEnabled === 'true';
  const active = enabled ? wallpaper : 'plain';
  if (enabled) document.body.dataset.wallpaper = active;
  else delete document.body.dataset.wallpaper;
  if (drawer) drawer.dataset.wallpaper = active;
  document.querySelectorAll<HTMLElement>('[data-study-wallpaper]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.studyWallpaper === active));
  });
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  writeStorage(themeConfig.key, theme);
  syncControls();
}

export function initializePreferences() {
  if (initialized) return;
  initialized = true;
  const saved = readStorage(wallpaperKey);
  wallpaper = isWallpaper(saved) ? saved : 'plain';
  document.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('[data-theme-cycle], [data-study-theme], [data-study-wallpaper]');
    if (!button) return;
    if (button.hasAttribute('data-theme-cycle')) setTheme(resolvedDark() ? 'light' : 'dark');
    else if (isTheme(button.dataset.studyTheme)) setTheme(button.dataset.studyTheme);
    else if (isWallpaper(button.dataset.studyWallpaper ?? null)) {
      wallpaper = button.dataset.studyWallpaper as Wallpaper;
      writeStorage(wallpaperKey, wallpaper);
      syncControls();
    }
  });
  document.addEventListener('astro:before-swap', event => {
    event.newDocument.documentElement.dataset.theme = document.documentElement.dataset.theme || 'system';
  });
  document.addEventListener('astro:after-swap', syncControls);
  document.addEventListener('astro:page-load', syncControls);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncControls);
  window.addEventListener('storage', event => {
    if (event.key === themeConfig.key) document.documentElement.dataset.theme = isTheme(event.newValue) ? event.newValue : 'system';
    if (event.key === wallpaperKey) wallpaper = isWallpaper(event.newValue) ? event.newValue : 'plain';
    syncControls();
  });
  syncControls();
}
