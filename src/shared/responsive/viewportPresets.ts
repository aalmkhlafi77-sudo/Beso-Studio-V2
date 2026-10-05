/**
 * Beso Studio V2 — Responsive Viewport Verification Presets
 * Matches the architectural reference breakpoints:
 * 360px / 390px / 768px / 1024px / 1280px / 1440px + Fluid 100%
 */

export interface ViewportPreset {
  id: string;
  label: string;
  widthPx: number | 'fluid';
  category: 'mobile' | 'tablet' | 'desktop' | 'fluid';
}

export const VIEWPORT_PRESETS: ViewportPreset[] = [
  { id: 'fluid', label: 'مرن (100%)', widthPx: 'fluid', category: 'fluid' },
  { id: '1440', label: 'سطح مكتب عريض · 1440px', widthPx: 1440, category: 'desktop' },
  { id: '1280', label: 'سطح مكتب · 1280px', widthPx: 1280, category: 'desktop' },
  { id: '1024', label: 'لابتوب · 1024px', widthPx: 1024, category: 'desktop' },
  { id: '768', label: 'جهاز لوحي · 768px', widthPx: 768, category: 'tablet' },
  { id: '390', label: 'هاتف حديث · 390px', widthPx: 390, category: 'mobile' },
  { id: '360', label: 'هاتف مدمج · 360px', widthPx: 360, category: 'mobile' },
];
