/**
 * Beso Studio V2 — Shared Theme Tokens & Mode Definitions
 */

export type StudioThemeMode = 'emerald-luxury' | 'ivory-pearl';

export interface StudioThemeDescriptor {
  id: StudioThemeMode;
  alias: 'dark' | 'light';
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
}

export const STUDIO_THEMES: Record<StudioThemeMode, StudioThemeDescriptor> = {
  'emerald-luxury': {
    id: 'emerald-luxury',
    alias: 'dark',
    labelAr: 'زمردي فاخر (Emerald Luxury)',
    labelEn: 'Emerald Luxury',
    descriptionAr: 'أخضر زمردي داكن مع لمسات وحدود ذهبية ونصوص عالية التباين.',
  },
  'ivory-pearl': {
    id: 'ivory-pearl',
    alias: 'light',
    labelAr: 'لؤلؤي عاجي (Ivory Pearl)',
    labelEn: 'Ivory Pearl',
    descriptionAr: 'خلفية عاجية لؤلؤية فاتحة مع ذهبي هادئ وظلال ناعمة.',
  },
};

export function applyDocumentTheme(theme: StudioThemeMode): void {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
