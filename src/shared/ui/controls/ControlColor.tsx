/**
 * Beso Studio V2 — Shared ControlColor Component (Requirement 3)
 *
 * Includes:
 * - Clear color swatch box (`.ui-color-swatch-preview`)
 * - `<input type="color" />` native picker
 * - Direct HEX / RGBA input field
 * - Human-readable color name (`colorName`)
 * - Independent reset button (`ControlResetButton`)
 *
 * Used consistently across background, secondary, text, title, description,
 * number, percentage, analysis, icon, border, glow, and button colors.
 */

import React, { useId } from 'react';
import { ControlField } from './ControlField';

const KNOWN_COLOR_NAMES: Record<string, string> = {
  '#d4af37': 'ذهبي ملكي (Royal Gold)',
  '#e5c351': 'ذهبي مشرق (Bright Gold)',
  '#b5891c': 'ذهبي داكن (Deep Gold)',
  '#a67c1e': 'ذهبي دافئ (Warm Gold)',
  '#061511': 'زمردي ليلي (Midnight Emerald)',
  '#0c251e': 'زمردي عميق (Deep Emerald)',
  '#0e3328': 'زمردي غني (Rich Emerald)',
  '#0d3b2e': 'أخضر ملكي (Imperial Green)',
  '#113229': 'زمردي مرتفع (Elevated Emerald)',
  '#22c55e': 'أخضر زمردي (Emerald Green)',
  '#10b981': 'أخضر نعناعي (Mint Emerald)',
  '#34d399': 'أخضر مضيء (Soft Mint)',
  '#f3f7f5': 'أبيض لؤلؤي (Pearl White)',
  '#faf7f0': 'عاجي دافئ (Ivory Pearl)',
  '#ffffff': 'أبيض نقي (Pure White)',
  '#bfd1c9': 'فضي ضبابي (Mist Silver)',
  '#9db5ab': 'رمادي زمردي (Sage Slate)',
  '#38bdf8': 'سماوي نيون (Sky Cyan)',
  '#ef4444': 'أحمر مرجاني (Coral Red)',
  '#f59e0b': 'كهرماني دافئ (Warm Amber)',
  '#000000': 'أسود فحمي (Jet Black)',
};

export function resolveHumanColorName(rawColor: string, customColorName?: string): string {
  if (customColorName) {
    return customColorName;
  }
  const normalized = (rawColor || '').trim().toLowerCase();
  if (KNOWN_COLOR_NAMES[normalized]) {
    return KNOWN_COLOR_NAMES[normalized];
  }
  if (normalized.startsWith('rgba(') || normalized.startsWith('rgb(')) {
    return 'لون شفاف مخصص (RGBA)';
  }
  if (/^#[0-9a-f]{6}$/i.test(normalized)) {
    return `لون مخصص (${normalized.toUpperCase()})`;
  }
  return 'لون مخصص';
}

export function normalizeHexForColorInput(rawColor: string, fallback = '#d4af37'): string {
  const trimmed = (rawColor || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

export interface ControlColorProps {
  label: string;
  value: string;
  onChange: (nextColor: string) => void;
  onReset?: () => void;
  colorName?: string;
  description?: string;
  fallbackHex?: string;
  disabled?: boolean;
  isModified?: boolean;
  fullWidth?: boolean;
  testId?: string;
  colorInputTestId?: string;
  hexInputTestId?: string;
}

export const ControlColor: React.FC<ControlColorProps> = ({
  label,
  value,
  onChange,
  onReset,
  colorName,
  description,
  fallbackHex = '#d4af37',
  disabled = false,
  isModified = false,
  fullWidth = false,
  testId,
  colorInputTestId,
  hexInputTestId,
}) => {
  const generatedId = useId();
  const safeHex = normalizeHexForColorInput(value, fallbackHex);
  const displayColorName = resolveHumanColorName(value, colorName);

  return (
    <ControlField
      id={generatedId}
      label={label}
      description={description}
      currentValue={displayColorName}
      onReset={onReset}
      disabled={disabled}
      isModified={isModified}
      fullWidth={fullWidth}
      testId={testId}
    >
      <div className="ui-control-color-row">
        {/* Clear Visual Swatch + Native Color Input */}
        <label className="ui-control-color-swatch-wrap" title={`اختيار ${label}`}>
          <span
            className="ui-control-color-swatch-box"
            style={{ backgroundColor: value || safeHex }}
            aria-hidden="true"
          />
          <input
            type="color"
            className="ui-control-color-native"
            aria-label={`منتقي لون ${label}`}
            value={safeHex}
            disabled={disabled}
            data-testid={colorInputTestId}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>

        {/* HEX / CSS Color Input */}
        <div className="ui-control-color-hex-wrap">
          <span className="ui-control-color-hex-prefix" dir="ltr">
            HEX
          </span>
          <input
            id={generatedId}
            type="text"
            className="ui-control-input ui-control-color-hex-input"
            dir="ltr"
            value={value}
            disabled={disabled}
            placeholder="#d4af37"
            data-testid={hexInputTestId}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>

      <div className="ui-control-color-meta">
        <span className="ui-control-color-name">{displayColorName}</span>
        <span className="ui-control-color-code" dir="ltr">
          {value}
        </span>
      </div>
    </ControlField>
  );
};
