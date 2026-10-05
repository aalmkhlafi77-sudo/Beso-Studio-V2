/**
 * Beso Studio V2 — Core Assets & Icon Library Presets
 * Supports independent icon customization (emoji, svg, icon-library, image, none).
 */

export interface AssetReference {
  id: string;
  type: 'svg' | 'image' | 'font';
  urlOrContent: string;
  description?: string;
}

export interface IconLibraryEntry {
  id: string;
  label: string;
  svgPath: string;
}

export const BUILTIN_ICON_LIBRARY: IconLibraryEntry[] = [
  {
    id: 'diamond',
    label: 'جوهرة (Diamond)',
    svgPath: 'M12 2L22 9L12 22L2 9L12 2Z',
  },
  {
    id: 'shield',
    label: 'درع (Shield)',
    svgPath: 'M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z',
  },
  {
    id: 'pulse',
    label: 'مؤشر نبض (Pulse)',
    svgPath: 'M3 12H7L10 4L14 20L17 12H21',
  },
  {
    id: 'cube',
    label: 'مكعب معماري (Cube)',
    svgPath: 'M21 16V8L12 3L3 8V16L12 21L21 16Z',
  },
  {
    id: 'crown',
    label: 'تاج (Crown)',
    svgPath: 'M2 18L4 7L9 12L12 5L15 12L20 7L22 18H2Z',
  },
];

export function renderIconMarkup(options: {
  visible: boolean;
  source: 'none' | 'emoji' | 'svg' | 'icon-library' | 'image';
  value: string;
  color: string;
  size: number;
  rotate: number;
  scopeClass: string;
}): string {
  if (!options.visible || options.source === 'none') {
    return '';
  }

  const safeValue = escapeHtml(options.value.trim());

  if (options.source === 'emoji') {
    return `<span class="${options.scopeClass}__icon" aria-hidden="true">${safeValue || '◆'}</span>`;
  }

  if (options.source === 'icon-library') {
    const entry =
      BUILTIN_ICON_LIBRARY.find((item) => item.id === options.value) || BUILTIN_ICON_LIBRARY[0];
    return `<span class="${options.scopeClass}__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="${options.size}" height="${options.size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${entry.svgPath}" /></svg></span>`;
  }

  if (options.source === 'svg') {
    const pathData = safeValue || BUILTIN_ICON_LIBRARY[0].svgPath;
    return `<span class="${options.scopeClass}__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="${options.size}" height="${options.size}" fill="none" stroke="currentColor" stroke-width="2"><path d="${pathData}" /></svg></span>`;
  }

  if (options.source === 'image') {
    return `<span class="${options.scopeClass}__icon" aria-hidden="true"><img src="${safeValue}" alt="" width="${options.size}" height="${options.size}" referrerpolicy="no-referrer" style="object-fit:contain;display:block;" /></span>`;
  }

  return '';
}

export function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
