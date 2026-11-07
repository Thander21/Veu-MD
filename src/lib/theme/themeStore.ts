import { defaultThemes } from './defaultThemes';
import type { ThemeConfig } from '../types';

let currentTheme: ThemeConfig = defaultThemes.veumd || defaultThemes.veu;
const listeners = new Set<(theme: ThemeConfig) => void>();

export function getTheme(): ThemeConfig {
  return currentTheme;
}

export function subscribeTheme(fn: (theme: ThemeConfig) => void) {
  listeners.add(fn);
  fn(currentTheme);
  return () => listeners.delete(fn);
}

export function setTheme(theme: ThemeConfig) {
  currentTheme = theme;
  applyThemeToDOM(theme);
  try {
    localStorage.setItem('veu_active_theme', JSON.stringify(theme));
  } catch (e) {
    console.error(e);
  }
  listeners.forEach((fn) => fn(currentTheme));
}

export function updateThemeTag<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
  currentTheme = {
    ...currentTheme,
    [key]: value
  };
  setTheme(currentTheme);
}

export function applyThemeToDOM(theme: ThemeConfig) {
  const root = document.documentElement;

  // Layout & Global
  root.style.setProperty('--veu-max-width', theme.editorMaxWidth);
  root.style.setProperty('--veu-font-family', theme.fontFamily);
  root.style.setProperty('--veu-font-size', theme.fontSize);
  root.style.setProperty('--veu-line-height', theme.lineHeight);

  root.style.setProperty('--veu-bg-app', theme.bgApp);
  root.style.setProperty('--veu-bg-sidebar', theme.bgSidebar);
  root.style.setProperty('--veu-bg-editor', theme.bgEditor);
  root.style.setProperty('--veu-text-color', theme.textColor);
  root.style.setProperty('--veu-border-color', theme.borderColor);
  root.style.setProperty('--veu-active-item-bg', theme.activeItemBg);

  // Headings
  root.style.setProperty('--veu-h1-color', theme.h1.color);
  root.style.setProperty('--veu-h1-size', theme.h1.fontSize || '2.1rem');
  root.style.setProperty('--veu-h1-weight', theme.h1.fontWeight || '700');
  root.style.setProperty('--veu-h1-border', theme.h1.borderBottom || 'none');

  root.style.setProperty('--veu-h2-color', theme.h2.color);
  root.style.setProperty('--veu-h2-size', theme.h2.fontSize || '1.7rem');
  root.style.setProperty('--veu-h2-weight', theme.h2.fontWeight || '600');
  root.style.setProperty('--veu-h2-border', theme.h2.borderBottom || 'none');

  root.style.setProperty('--veu-h3-color', theme.h3.color);
  root.style.setProperty('--veu-h3-size', theme.h3.fontSize || '1.4rem');
  root.style.setProperty('--veu-h3-weight', theme.h3.fontWeight || '600');

  root.style.setProperty('--veu-h4-color', theme.h4.color);
  root.style.setProperty('--veu-h4-size', theme.h4.fontSize || '1.2rem');
  root.style.setProperty('--veu-h4-weight', theme.h4.fontWeight || '600');

  root.style.setProperty('--veu-h5-color', theme.h5.color);
  root.style.setProperty('--veu-h5-size', theme.h5.fontSize || '1.05rem');
  root.style.setProperty('--veu-h5-weight', theme.h5.fontWeight || '600');

  root.style.setProperty('--veu-h6-color', theme.h6.color);
  root.style.setProperty('--veu-h6-size', theme.h6.fontSize || '0.95rem');
  root.style.setProperty('--veu-h6-weight', theme.h6.fontWeight || '600');

  // Inline formatting
  root.style.setProperty('--veu-bold-color', theme.bold.color);
  root.style.setProperty('--veu-bold-weight', theme.bold.fontWeight || '700');

  root.style.setProperty('--veu-italic-color', theme.italic.color);
  root.style.setProperty('--veu-strikethrough-color', theme.strikethrough.color);

  root.style.setProperty('--veu-highlight-color', theme.highlight.color);
  root.style.setProperty('--veu-highlight-bg', theme.highlight.backgroundColor || 'yellow');

  root.style.setProperty('--veu-code-color', theme.inlineCode.color);
  root.style.setProperty('--veu-code-bg', theme.inlineCode.backgroundColor || '#2e2e2e');

  root.style.setProperty('--veu-quote-color', theme.blockquote.color);
  root.style.setProperty('--veu-quote-bg', theme.blockquote.backgroundColor || 'transparent');
  root.style.setProperty('--veu-quote-border', theme.blockquote.borderLeft || '4px solid #38bdf8');

  root.style.setProperty('--veu-codeblock-color', theme.codeBlock.color);
  root.style.setProperty('--veu-codeblock-bg', theme.codeBlock.backgroundColor || '#111');

  root.style.setProperty('--veu-link-color', theme.link.color);
  root.style.setProperty('--veu-bullet-color', theme.listBullet.color);

  root.style.setProperty('--veu-table-border', theme.tableBorder);
  root.style.setProperty('--veu-table-header-bg', theme.tableHeaderBg);
}

export function initTheme() {
  try {
    const saved = localStorage.getItem('veu_active_theme');
    if (saved) {
      setTheme(JSON.parse(saved));
      return;
    }
  } catch (e) {
    console.error(e);
  }
  setTheme(defaultThemes.veu);
}

