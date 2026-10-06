/**
 * Beso Studio V2 — Production Button Element Module ('button')
 *
 * Category: 1. عناصر التحكم ('controls')
 * Family: 'controls'
 *
 * Supports:
 * - Independent button text (`content.actionLabel` / `content.title`)
 * - Independent icon (`icon`: visibility, source, value, color, size, rotation) & placement ('start' | 'end' | 'top')
 * - Button Variant Modes:
 *   1. 'primary' (زر إجراء رئيسي)
 *   2. 'text' (زر نصي)
 *   3. 'icon-only' (زر أيقونة فقط)
 * - Surface Materials:
 *   1. 'solid' (الخلفية المسطحة)
 *   2. 'gradient' (التدرج)
 *   3. 'glass' (الزجاج)
 *   4. 'neon' (النيون)
 * - Independent Interactive States:
 *   - `default` (defaultStyle)
 *   - `hover` (hoverStyle — completely independent from defaultStyle!)
 *   - `active` (activeStyle)
 *   - `disabled` (disabled flag + disabledOpacity)
 * - Independent Width and Height (`dimensions.width`, `dimensions.height`)
 */

import { ICON_LIBRARY_PRESETS } from '../../core/assets/assetTypes';
import { ControlDefinition } from '../../core/controls/controlTypes';
import { createExportBundle, ExportBundle } from '../../core/export/exportBundle';
import {
  ElementModule,
  PreviewResult,
  RegisteredElementEntry,
  RenderInput,
} from '../../core/registry/elementRegistry';
import {
  ButtonElementData,
  ButtonInteractiveStateStyle,
  cloneElementState,
  EditableIcon,
  IndependentDimensions,
  IndependentElementState,
} from '../../core/state/elementStateTypes';
import {
  validateIndependentElementState,
  ValidationResult,
} from '../../core/validation/validator';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';

export const BUTTON_ELEMENT_ID = 'button';

const DEFAULT_FONT = AVAILABLE_FONTS[0].cssValue;

export const DEFAULT_BUTTON_DATA: ButtonElementData = {
  variantMode: 'primary',
  surfaceType: 'gradient',
  iconPlacement: 'start',
  gradientDirection: '135deg',
  glassBlur: 12,
  borderRadius: 14,
  borderWidth: 1,
  paddingX: 24,
  paddingY: 14,
  gap: 10,
  disabled: false,
  disabledOpacity: 45,
  defaultStyle: {
    backgroundColor: '#d4af37',
    secondaryColor: '#b5891c',
    textColor: '#071712',
    borderColor: '#f3d46b',
    glowColor: '#d4af37',
    glowIntensity: 25,
    scale: 1,
    translateY: 0,
  },
  hoverStyle: {
    backgroundColor: '#e5c349',
    secondaryColor: '#c99b26',
    textColor: '#04110d',
    borderColor: '#ffe484',
    glowColor: '#f3d46b',
    glowIntensity: 48,
    scale: 1.02,
    translateY: -2,
  },
  activeStyle: {
    backgroundColor: '#b5891c',
    secondaryColor: '#966f12',
    textColor: '#071712',
    borderColor: '#d4af37',
    glowColor: '#d4af37',
    glowIntensity: 15,
    scale: 0.98,
    translateY: 0,
  },
};

export const BUTTON_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'ابدأ مشروعك الآن',
      visible: true,
      color: '#071712',
      fontFamily: DEFAULT_FONT,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'center',
    },
    description: {
      value: 'زر تفاعلي قابل للتخصيص الكامل',
      visible: false,
      color: '#b7ccc4',
      fontFamily: DEFAULT_FONT,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'center',
    },
    number: {
      value: '01',
      visible: false,
      color: '#d4af37',
      fontFamily: DEFAULT_FONT,
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
    percentage: {
      value: '100%',
      visible: false,
      color: '#34d399',
      fontFamily: DEFAULT_FONT,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
    analysis: {
      value: 'استجابة فورية',
      visible: false,
      color: '#9ec5b8',
      fontFamily: DEFAULT_FONT,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'center',
    },
    actionLabel: {
      value: 'ابدأ مشروعك الآن',
      visible: true,
      color: '#071712',
      fontFamily: DEFAULT_FONT,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'center',
    },
    badge: {
      value: 'جديد',
      visible: false,
      color: '#071712',
      fontFamily: DEFAULT_FONT,
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
  },
  icon: {
    visible: true,
    source: 'icon-library',
    value: 'sparkles',
    color: '#071712',
    size: 20,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 240,
    height: 54,
    minWidth: 48,
    maxWidth: 900,
    minHeight: 36,
    maxHeight: 'none',
    widthUnit: 'px',
    heightUnit: 'px',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'gradient',
    primaryColor: '#d4af37',
    secondaryColor: '#b5891c',
    gradientDirection: '135deg',
    opacity: 100,
    glassBlur: 12,
    glowIntensity: 25,
    glowColor: '#d4af37',
    shadowIntensity: 30,
    shadowColor: '#000000',
    patternType: 'dots',
    imageSourceUrl: '',
    backgroundColor: '#d4af37',
    borderColor: '#f3d46b',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(7, 23, 18, 0.16)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#071712',
    iconContainerBackground: 'transparent',
    borderRadius: 14,
    borderWidth: 1,
    paddingX: 24,
    paddingY: 14,
    gap: 10,
  },
  button: {
    ...DEFAULT_BUTTON_DATA,
    defaultStyle: { ...DEFAULT_BUTTON_DATA.defaultStyle },
    hoverStyle: { ...DEFAULT_BUTTON_DATA.hoverStyle },
    activeStyle: { ...DEFAULT_BUTTON_DATA.activeStyle },
  },
};

export const BUTTON_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'button.text',
    type: 'editable-text',
    section: 'content',
    label: 'نص الزر المستقل',
    targetKey: 'actionLabel',
  },
  {
    id: 'button.icon',
    type: 'icon-config',
    section: 'icon',
    label: 'أيقونة الزر وموضعها',
    targetKey: 'value',
  },
  {
    id: 'button.dimensions',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'أبعاد الزر المستقلة (العرض والارتفاع)',
    targetKey: 'width',
  },
  {
    id: 'button.appearance',
    type: 'color',
    section: 'appearance',
    label: 'خامة الزر وحالاته (Default / Hover / Active / Disabled)',
    targetKey: 'primaryColor',
  },
];

export function ensureButtonData(state: IndependentElementState): ButtonElementData {
  if (state.button) {
    return state.button;
  }
  return {
    ...DEFAULT_BUTTON_DATA,
    defaultStyle: { ...DEFAULT_BUTTON_DATA.defaultStyle },
    hoverStyle: { ...DEFAULT_BUTTON_DATA.hoverStyle },
    activeStyle: { ...DEFAULT_BUTTON_DATA.activeStyle },
  };
}

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderButtonIconMarkup(icon: EditableIcon, isIconOnly: boolean): string {
  if ((!icon.visible && !isIconOnly) || icon.source === 'none') {
    return '';
  }

  let inner = '';
  if (icon.source === 'icon-library') {
    inner = ICON_LIBRARY_PRESETS[icon.value] || ICON_LIBRARY_PRESETS.sparkles;
  } else if (icon.source === 'emoji') {
    inner = `<span class="beso-btn__emoji">${escapeHtml(icon.value || '✦')}</span>`;
  } else if (icon.source === 'svg') {
    inner = icon.value.trim().startsWith('<svg')
      ? icon.value
      : ICON_LIBRARY_PRESETS.shield;
  } else if (icon.source === 'image') {
    inner = `<img class="beso-btn__icon-img" src="${escapeHtml(icon.value)}" alt="" />`;
  }

  return `<span class="beso-btn__icon" aria-hidden="true">${inner}</span>`;
}

function resolveDimensionCss(dims: IndependentDimensions): {
  widthCss: string;
  heightCss: string;
} {
  const widthCss =
    dims.width === 'auto' || dims.widthUnit === 'auto'
      ? 'auto'
      : `${dims.width}${dims.widthUnit}`;
  const heightCss =
    dims.height === 'auto' || dims.heightUnit === 'auto'
      ? 'auto'
      : `${dims.height}${dims.heightUnit}`;
  return { widthCss, heightCss };
}

function resolveStateSurfaceCss(
  btn: ButtonElementData,
  st: ButtonInteractiveStateStyle
): string {
  if (btn.variantMode === 'text') {
    return [
      `  background: transparent;`,
      `  color: ${st.textColor};`,
      `  border-color: transparent;`,
      `  box-shadow: none;`,
    ].join('\n');
  }

  const lines: string[] = [];
  if (btn.surfaceType === 'solid') {
    lines.push(`  background: ${st.backgroundColor};`);
  } else if (btn.surfaceType === 'gradient') {
    lines.push(
      `  background: linear-gradient(${btn.gradientDirection}, ${st.backgroundColor} 0%, ${st.secondaryColor} 100%);`
    );
  } else if (btn.surfaceType === 'glass') {
    lines.push(
      `  background: linear-gradient(${btn.gradientDirection}, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.05) 100%), ${st.backgroundColor};`
    );
    lines.push(`  backdrop-filter: blur(${btn.glassBlur}px);`);
    lines.push(`  -webkit-backdrop-filter: blur(${btn.glassBlur}px);`);
  } else if (btn.surfaceType === 'neon') {
    lines.push(`  background: ${st.backgroundColor};`);
  }

  lines.push(`  color: ${st.textColor};`);
  lines.push(`  border: ${btn.borderWidth}px solid ${st.borderColor};`);

  if (st.glowIntensity > 0) {
    const spread = Math.round(st.glowIntensity * 0.45);
    const blur = Math.round(st.glowIntensity * 0.9);
    lines.push(`  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 0 ${blur}px ${spread * 0.2}px ${st.glowColor};`);
  } else {
    lines.push(`  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);`);
  }

  lines.push(`  transform: translateY(${st.translateY}px) scale(${st.scale});`);
  return lines.join('\n');
}

function generateButtonHtml(input: RenderInput): string {
  const { scopeId, state } = input;
  const btn = ensureButtonData(state);
  const labelField = state.content.actionLabel;
  const badgeField = state.content.badge;
  const isIconOnly = btn.variantMode === 'icon-only';
  const iconHtml = renderButtonIconMarkup(state.icon, isIconOnly);

  const disabledAttrs = btn.disabled
    ? ' disabled="disabled" aria-disabled="true"'
    : '';
  const ariaLabelAttr = isIconOnly
    ? ` aria-label="${escapeHtml(labelField.value || state.content.title.value || 'زر أيقونة')}"`
    : '';

  const textHtml =
    !isIconOnly && labelField.visible
      ? `<span class="beso-btn__label">${escapeHtml(labelField.value)}</span>`
      : '';
  const badgeHtml =
    !isIconOnly && badgeField.visible && badgeField.value
      ? `<span class="beso-btn__badge">${escapeHtml(badgeField.value)}</span>`
      : '';

  const orderedChildren =
    btn.iconPlacement === 'end'
      ? [textHtml, badgeHtml, iconHtml].filter(Boolean).join('\n    ')
      : [iconHtml, textHtml, badgeHtml].filter(Boolean).join('\n    ');

  return [
    `<div class="beso-button-host" data-element-scope="${scopeId}" data-button-variant="${btn.variantMode}" data-button-surface="${btn.surfaceType}">`,
    `  <button type="button" class="beso-btn" data-icon-placement="${btn.iconPlacement}"${disabledAttrs}${ariaLabelAttr}>`,
    `    ${orderedChildren}`,
    `  </button>`,
    `</div>`,
  ].join('\n');
}

function generateButtonCss(input: RenderInput): string {
  const { scopeId, state } = input;
  const btn = ensureButtonData(state);
  const labelField = state.content.actionLabel;
  const { widthCss, heightCss } = resolveDimensionCss(state.dimensions);
  const S = `[data-element-scope="${scopeId}"]`;

  const flexDirection = btn.iconPlacement === 'top' ? 'column' : 'row';

  return `${S}.beso-button-host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  max-width: 100%;
}

${S} .beso-btn {
  width: ${widthCss};
  height: ${heightCss};
  min-width: ${state.dimensions.minWidth}px;
  min-height: ${state.dimensions.minHeight}px;
  padding: ${btn.paddingY}px ${btn.paddingX}px;
  gap: ${btn.gap}px;
  border-radius: ${btn.borderRadius}px;
  display: inline-flex;
  flex-direction: ${flexDirection};
  align-items: center;
  justify-content: center;
  font-family: ${labelField.fontFamily};
  font-size: ${labelField.fontSize}px;
  font-weight: ${labelField.fontWeight};
  line-height: ${labelField.lineHeight};
  letter-spacing: ${labelField.letterSpacing}px;
  cursor: ${btn.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${btn.disabled ? (btn.disabledOpacity / 100).toFixed(2) : '1'};
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
  text-decoration: none;
${resolveStateSurfaceCss(btn, btn.defaultStyle)}
}

${S} .beso-btn:hover:not([disabled]) {
${resolveStateSurfaceCss(btn, btn.hoverStyle)}
}

${S} .beso-btn:active:not([disabled]) {
${resolveStateSurfaceCss(btn, btn.activeStyle)}
}

${S} .beso-btn[disabled],
${S} .beso-btn[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: ${(btn.disabledOpacity / 100).toFixed(2)};
  pointer-events: none;
}

${S} .beso-btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${state.icon.size}px;
  height: ${state.icon.size}px;
  color: ${state.icon.color};
  transform: rotate(${state.icon.rotate}deg);
  flex-shrink: 0;
}

${S} .beso-btn__icon svg {
  width: 100%;
  height: 100%;
}

${S} .beso-btn__label {
  color: inherit;
  text-align: ${labelField.align};
}

${S} .beso-btn__badge {
  font-size: ${state.content.badge.fontSize}px;
  font-weight: ${state.content.badge.fontWeight};
  color: ${state.content.badge.color};
  background: ${state.surface.badgeBackgroundColor};
  padding: 2px 8px;
  border-radius: 999px;
}`;
}

function sanitizeButtonState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(BUTTON_DEFAULT_STATE);
  }
  return cloneElementState({
    ...BUTTON_DEFAULT_STATE,
    ...(raw as Partial<IndependentElementState>),
  });
}

function validateButtonState(state: IndependentElementState): ValidationResult {
  return validateIndependentElementState(state);
}

function renderButtonPreview(input: RenderInput): PreviewResult {
  const html = generateButtonHtml(input);
  const css = generateButtonCss(input);
  const { widthCss, heightCss } = resolveDimensionCss(input.state.dimensions);

  return {
    instanceId: input.instanceId,
    scopeId: input.scopeId,
    html,
    css,
    dimensionsSummary: {
      widthCss,
      heightCss,
    },
  };
}

function generateButtonExportBundle(input: RenderInput): ExportBundle {
  const html = generateButtonHtml(input);
  const css = generateButtonCss(input);
  const validation = validateButtonState(input.state);

  return createExportBundle({
    elementId: BUTTON_ELEMENT_ID,
    elementType: BUTTON_ELEMENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: validation.errors,
  });
}

export const buttonModule: ElementModule = {
  id: BUTTON_ELEMENT_ID,
  type: BUTTON_ELEMENT_ID,
  version: 1,
  family: 'controls',
  label: 'عنصر الزر التفاعلي (Button)',
  description:
    'زر إنتاجي مستقل يدعم النص، الأيقونة، أنماط (Primary / Text / Icon-only)، خامات (Solid / Gradient / Glass / Neon)، وحالات (Default / Hover / Active / Disabled).',
  metadata: {
    label: 'عنصر الزر التفاعلي (Button)',
    description:
      'زر إنتاجي مستقل يدعم النص، الأيقونة، أنماط (Primary / Text / Icon-only)، خامات (Solid / Gradient / Glass / Neon)، وحالات (Default / Hover / Active / Disabled).',
    family: 'controls',
    category: 'controls',
    tags: ['button', 'cta', 'action', 'icon-button', 'toggle', 'زر', 'عناصر التحكم'],
    originGroup: 'native',
    sortOrder: 10,
    categories: ['controls', 'interactive'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: false,
    usesJavaScript: false,
    supportsSlots: false,
  },
  defaultState: BUTTON_DEFAULT_STATE,
  controlSchema: BUTTON_CONTROL_SCHEMA,
  sanitizeState: sanitizeButtonState,
  validate: validateButtonState,
  generateHtml: generateButtonHtml,
  generateCss: generateButtonCss,
  renderPreview: renderButtonPreview,
  generateCode: generateButtonExportBundle,
};

export const buttonRegistration: RegisteredElementEntry = {
  id: BUTTON_ELEMENT_ID,
  family: 'controls',
  category: 'controls',
  tags: ['button', 'cta', 'action', 'icon-button', 'toggle', 'زر', 'عناصر التحكم'],
  originGroup: 'native',
  sortOrder: 10,
  categories: ['controls', 'interactive'],
  status: 'stable',
  module: buttonModule,
};
