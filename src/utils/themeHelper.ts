/**
 * Salon Color Theme Configuration & Helper
 * Allows manager to choose between 3 premium theme palettes:
 * 1. 'gold' (Altın & Kehribar - Default Classic Luxury)
 * 2. 'emerald' (Zümrüt & Yeşim - Modern Mint Fresh)
 * 3. 'sapphire' (Safir & Gece Mavisi - Royal VIP Executive)
 */

export type ThemeId = 'gold' | 'emerald' | 'sapphire';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  badge: string;
  primaryHex: string;
  accentHex: string;
  cardBorder: string;
  previewClass: string;
}

export const SALON_THEMES: Record<ThemeId, ThemeConfig> = {
  gold: {
    id: 'gold',
    name: 'Altın & Kehribar',
    subtitle: 'Sıcak kehribar ışıltısı, klasik lüks salon konsepti',
    badge: '👑 Lüks Klasik',
    primaryHex: '#f59e0b',
    accentHex: '#fbbf24',
    cardBorder: 'border-amber-500/40',
    previewClass: 'bg-amber-500 border-amber-400 text-amber-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Zümrüt & Yeşim',
    subtitle: 'Taze zümrüt yeşili tonları, ferah ve modern stil',
    badge: '🌿 Taze & Ferah',
    primaryHex: '#10b981',
    accentHex: '#34d399',
    cardBorder: 'border-emerald-500/40',
    previewClass: 'bg-emerald-500 border-emerald-400 text-emerald-400',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Safir & Gece Mavisi',
    subtitle: 'Asil krallık safir mavisi, teknolojik VIP konsept',
    badge: '💎 Prestij VIP',
    primaryHex: '#6366f1',
    accentHex: '#818cf8',
    cardBorder: 'border-indigo-500/40',
    previewClass: 'bg-indigo-500 border-indigo-400 text-indigo-400',
  },
};

export function applyThemeToDOM(themeId: ThemeId = 'gold') {
  if (typeof document === 'undefined') return;
  const validTheme: ThemeId = SALON_THEMES[themeId] ? themeId : 'gold';
  document.documentElement.setAttribute('data-theme', validTheme);
}
