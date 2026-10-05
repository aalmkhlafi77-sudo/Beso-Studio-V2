/**
 * Beso Studio V2 — Typography Options & Defaults
 */

export interface FontOption {
  id: string;
  label: string;
  cssValue: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'cairo',
    label: 'Cairo (كايرو)',
    cssValue: "'Cairo', sans-serif",
  },
  {
    id: 'readex-pro',
    label: 'Readex Pro (ريدكس برو)',
    cssValue: "'Readex Pro', sans-serif",
  },
  {
    id: 'ibm-plex-mono',
    label: 'IBM Plex Mono (أرقام/كود)',
    cssValue: "'IBM Plex Mono', monospace",
  },
  {
    id: 'system-ui',
    label: 'System UI (خط النظام)',
    cssValue: 'system-ui, -apple-system, sans-serif',
  },
];

export const FONT_WEIGHT_OPTIONS: number[] = [400, 500, 600, 700];

export type TextAlignment = 'start' | 'center' | 'end';

export const TEXT_ALIGNMENT_OPTIONS: Array<{ value: TextAlignment; label: string }> = [
  { value: 'start', label: 'بداية السطر (يمين)' },
  { value: 'center', label: 'توسيط' },
  { value: 'end', label: 'نهاية السطر (يسار)' },
];
