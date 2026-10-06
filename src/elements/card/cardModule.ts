/**
 * Beso Studio V2 — Production Card Element Module (src/elements/card/cardModule.ts)
 *
 * Implements Task 3:
 * 1. Independent module under src/elements/card/
 * 2. Independent content fields: title, description, number, percentage, analysis, actionLabel, badge
 * 3. Independent icon: visible, source, value, color, size, rotate, position
 * 4. 9 Card background materials:
 *    solid | gradient | glass | metal | ivory | neon | dark | image | pattern
 * 5. Declared Material settings:
 *    materialType, primaryColor, secondaryColor, gradientDirection, opacity,
 *    glassBlur, glowIntensity, glowColor, borderColor, borderWidth,
 *    shadowIntensity, shadowColor, borderRadius, plus independent width & height.
 * 6. Mandatory guarantees:
 *    - Zero static visible text.
 *    - Zero uneditable icons.
 *    - Zero undeclared/hidden colors in CSS.
 *    - Material never alters text or icon colors.
 *    - Changing primaryColor never alters secondaryColor.
 *    - Changing width never alters height.
 *    - Scoped CSS via [data-element-scope="<scopeId>"].
 */

import { escapeHtml, renderIconMarkup } from '../../core/assets/assetTypes';
import { ControlDefinition } from '../../core/controls/controlTypes';
import { createExportBundle, ExportBundle } from '../../core/export/exportBundle';
import {
  ElementModule,
  PreviewResult,
  RegisteredElementEntry,
  RenderInput,
} from '../../core/registry/elementRegistry';
import {
  CardMaterialType,
  cloneElementState,
  DeclaredSurfaceTokens,
  EditableText,
  IndependentElementState,
} from '../../core/state/elementStateTypes';
import {
  validateGeneratedCodeOutput,
  validateIndependentElementState,
  ValidationResult,
} from '../../core/validation/validator';
import {
  resolveDimensionCssValue,
  resolveMaxDimensionCssValue,
} from '../contract-probe/contractProbeModule';

export const CARD_ELEMENT_ID = 'card';

/**
 * Self-contained SVG geometric backdrop data URI used when materialType === 'image'
 * and the user has not supplied a custom URL, guaranteeing zero broken external images.
 */
export const DEFAULT_CARD_IMAGE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230d3b2e'/%3E%3Cstop offset='100%25' stop-color='%2305140f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23g)'/%3E%3Ccircle cx='480' cy='90' r='140' fill='none' stroke='%23d4af37' stroke-opacity='0.22' stroke-width='2'/%3E%3Ccircle cx='120' cy='320' r='180' fill='none' stroke='%23d4af37' stroke-opacity='0.16' stroke-width='1.5'/%3E%3Cpath d='M0 260 Q 300 140 600 280' fill='none' stroke='%23d4af37' stroke-opacity='0.2' stroke-width='2'/%3E%3C/svg%3E";

export const CARD_MATERIAL_OPTIONS: Array<{ value: CardMaterialType; label: string }> = [
  { value: 'solid', label: 'لون مصمت (Solid)' },
  { value: 'gradient', label: 'تدرج لوني (Gradient)' },
  { value: 'glass', label: 'زجاج ضبابي (Glass)' },
  { value: 'metal', label: 'معدن مصقول (Metal)' },
  { value: 'ivory', label: 'عاجي لؤلؤي (Ivory)' },
  { value: 'neon', label: 'نيون متوهج (Neon)' },
  { value: 'dark', label: 'داكن فاخر (Dark)' },
  { value: 'image', label: 'خلفية مصورة (Image)' },
  { value: 'pattern', label: 'نقش هندسي (Pattern)' },
];

export const CARD_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'بطاقة الأداء المالي التنفيذية',
      visible: true,
      color: '#f3f7f5',
      fontFamily: "'Readex Pro', sans-serif",
      fontSize: 22,
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'start',
    },
    description: {
      value: 'بطاقة إنتاجية مستقلة تدعم 9 خامات خلفية مع فصل كامل بين النصوص والأيقونة والأبعاد.',
      visible: true,
      color: '#bfd1c9',
      fontFamily: "'Cairo', sans-serif",
      fontSize: 15,
      fontWeight: 400,
      lineHeight: 1.65,
      letterSpacing: 0,
      align: 'start',
    },
    number: {
      value: '48,920',
      visible: true,
      color: '#d4af37',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    percentage: {
      value: '+24.8%',
      visible: true,
      color: '#22c55e',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 17,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    analysis: {
      value: 'نمو مستقر خلال الربع الحالي مع بقاء كل حقل نصي ومالي مستقلًا بالكامل.',
      visible: true,
      color: '#9db5ab',
      fontFamily: "'Cairo', sans-serif",
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.55,
      letterSpacing: 0,
      align: 'start',
    },
    actionLabel: {
      value: 'استعراض التقرير التفصيلي',
      visible: true,
      color: '#061511',
      fontFamily: "'Readex Pro', sans-serif",
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'center',
    },
    badge: {
      value: 'بطاقة إنتاجية · v1',
      visible: true,
      color: '#d4af37',
      fontFamily: "'Readex Pro', sans-serif",
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'start',
    },
  },
  icon: {
    visible: true,
    source: 'icon-library',
    value: 'crown',
    color: '#d4af37',
    size: 28,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 440,
    height: 360,
    minWidth: 240,
    maxWidth: 960,
    minHeight: 180,
    maxHeight: 900,
    widthUnit: 'px',
    heightUnit: 'px',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'gradient',
    primaryColor: '#0c251e',
    secondaryColor: '#163f33',
    gradientDirection: '135deg',
    opacity: 95,
    glassBlur: 14,
    glowIntensity: 18,
    glowColor: 'rgba(212, 175, 55, 0.28)',
    shadowIntensity: 24,
    shadowColor: 'rgba(0, 0, 0, 0.38)',
    patternType: 'dots',
    imageSourceUrl: DEFAULT_CARD_IMAGE_DATA_URI,
    backgroundColor: '#0c251e',
    borderColor: '#d4af37',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.14)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#061511',
    iconContainerBackground: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 18,
    borderWidth: 1,
    paddingX: 26,
    paddingY: 24,
    gap: 14,
  },
};

export const CARD_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'card-content-title',
    type: 'editable-text',
    section: 'content',
    label: 'العنوان (title)',
    targetKey: 'title',
  },
  {
    id: 'card-content-description',
    type: 'editable-text',
    section: 'content',
    label: 'الوصف (description)',
    targetKey: 'description',
  },
  {
    id: 'card-content-number',
    type: 'editable-text',
    section: 'content',
    label: 'الرقم (number)',
    targetKey: 'number',
  },
  {
    id: 'card-content-percentage',
    type: 'editable-text',
    section: 'content',
    label: 'النسبة (percentage)',
    targetKey: 'percentage',
  },
  {
    id: 'card-content-analysis',
    type: 'editable-text',
    section: 'content',
    label: 'التحليل (analysis)',
    targetKey: 'analysis',
  },
  {
    id: 'card-content-actionLabel',
    type: 'editable-text',
    section: 'content',
    label: 'نص الإجراء (actionLabel)',
    targetKey: 'actionLabel',
  },
  {
    id: 'card-content-badge',
    type: 'editable-text',
    section: 'content',
    label: 'الوسم (badge)',
    targetKey: 'badge',
  },
  {
    id: 'card-icon',
    type: 'icon-config',
    section: 'icon',
    label: 'الأيقونة المستقلة',
    targetKey: 'visible',
  },
  {
    id: 'card-dimensions',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'العرض والارتفاع المستقلان',
    targetKey: 'width',
  },
  {
    id: 'card-material',
    type: 'select',
    section: 'appearance',
    label: 'خامة الخلفية (materialType)',
    targetKey: 'materialType',
    options: CARD_MATERIAL_OPTIONS,
  },
];

export function sanitizeCardState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(CARD_DEFAULT_STATE);
  }
  const candidate = raw as Partial<IndependentElementState>;
  const defaults = CARD_DEFAULT_STATE;

  return {
    content: {
      title: { ...defaults.content.title, ...(candidate.content?.title || {}) },
      description: { ...defaults.content.description, ...(candidate.content?.description || {}) },
      number: { ...defaults.content.number, ...(candidate.content?.number || {}) },
      percentage: { ...defaults.content.percentage, ...(candidate.content?.percentage || {}) },
      analysis: { ...defaults.content.analysis, ...(candidate.content?.analysis || {}) },
      actionLabel: { ...defaults.content.actionLabel, ...(candidate.content?.actionLabel || {}) },
      badge: { ...defaults.content.badge, ...(candidate.content?.badge || {}) },
    },
    icon: {
      ...defaults.icon,
      ...(candidate.icon || {}),
    },
    dimensions: {
      ...defaults.dimensions,
      ...(candidate.dimensions || {}),
    },
    surface: {
      ...defaults.surface,
      ...(candidate.surface || {}),
    },
  };
}

function buildCardTextCss(selector: string, field: EditableText): string {
  const alignMap: Record<EditableText['align'], string> = {
    start: 'right',
    center: 'center',
    end: 'left',
  };

  return `${selector} {
  display: ${field.visible ? 'block' : 'none'};
  color: ${field.color};
  font-family: ${field.fontFamily};
  font-size: ${field.fontSize}px;
  font-weight: ${field.fontWeight};
  line-height: ${field.lineHeight};
  letter-spacing: ${field.letterSpacing}px;
  text-align: ${alignMap[field.align] || 'right'};
  margin: 0;
  word-break: break-word;
}`;
}

/**
 * Resolves the background, backdrop-filter, and box-shadow CSS declarations
 * for each of the 9 Card materials using ONLY declared tokens from `surface`.
 */
export function buildCardMaterialCssDeclarations(surface: DeclaredSurfaceTokens): string {
  const safeOpacity = Number.isFinite(surface.opacity)
    ? Math.min(100, Math.max(0, surface.opacity))
    : 100;
  const safeBlur = Number.isFinite(surface.glassBlur)
    ? Math.min(60, Math.max(0, surface.glassBlur))
    : 14;
  const safeGlow = Number.isFinite(surface.glowIntensity)
    ? Math.min(100, Math.max(0, surface.glowIntensity))
    : 0;
  const safeShadow = Number.isFinite(surface.shadowIntensity)
    ? Math.min(100, Math.max(0, surface.shadowIntensity))
    : 0;

  const baseShadow =
    safeShadow > 0
      ? `0 ${Math.round(safeShadow * 0.45)}px ${safeShadow}px var(--card-shadow-color)`
      : '0 0 0 transparent';
  const glowShadow =
    safeGlow > 0 ? `0 0 ${safeGlow}px var(--card-glow-color)` : '0 0 0 transparent';

  const combinedBoxShadow =
    safeShadow > 0 && safeGlow > 0
      ? `${baseShadow}, ${glowShadow}`
      : safeGlow > 0
        ? glowShadow
        : baseShadow;

  const primaryMix = `color-mix(in srgb, var(--card-primary) ${safeOpacity}%, transparent)`;
  const secondaryMix = `color-mix(in srgb, var(--card-secondary) ${safeOpacity}%, transparent)`;

  switch (surface.materialType) {
    case 'solid':
      return `  background: ${primaryMix};
  box-shadow: ${combinedBoxShadow};`;

    case 'gradient':
      return `  background: linear-gradient(var(--card-gradient-dir), ${primaryMix}, ${secondaryMix});
  box-shadow: ${combinedBoxShadow};`;

    case 'glass':
      return `  background: linear-gradient(var(--card-gradient-dir), ${primaryMix}, ${secondaryMix});
  backdrop-filter: blur(${safeBlur}px);
  -webkit-backdrop-filter: blur(${safeBlur}px);
  box-shadow: ${combinedBoxShadow};`;

    case 'metal':
      return `  background: linear-gradient(var(--card-gradient-dir), ${primaryMix} 0%, ${secondaryMix} 48%, ${primaryMix} 100%);
  box-shadow: ${combinedBoxShadow};`;

    case 'ivory':
      return `  background: linear-gradient(var(--card-gradient-dir), ${primaryMix} 0%, ${secondaryMix} 100%);
  box-shadow: ${combinedBoxShadow};`;

    case 'neon': {
      const neonGlow =
        safeGlow > 0
          ? `0 0 ${safeGlow}px var(--card-glow-color), inset 0 0 ${Math.max(4, Math.round(safeGlow * 0.45))}px var(--card-glow-color)`
          : combinedBoxShadow;
      return `  background: linear-gradient(var(--card-gradient-dir), ${primaryMix}, ${secondaryMix});
  box-shadow: ${safeShadow > 0 ? `${baseShadow}, ${neonGlow}` : neonGlow};`;
    }

    case 'dark':
      return `  background: radial-gradient(circle at top right, ${secondaryMix}, ${primaryMix} 75%);
  box-shadow: ${combinedBoxShadow};`;

    case 'image': {
      const safeUrl = (surface.imageSourceUrl || DEFAULT_CARD_IMAGE_DATA_URI).replace(/"/g, '%22');
      return `  background-color: var(--card-primary);
  background-image: linear-gradient(var(--card-gradient-dir), ${primaryMix}, ${secondaryMix}), url("${safeUrl}");
  background-size: cover;
  background-position: center;
  box-shadow: ${combinedBoxShadow};`;
    }

    case 'pattern': {
      if (surface.patternType === 'grid') {
        return `  background-color: ${primaryMix};
  background-image: linear-gradient(to right, ${secondaryMix} 1px, transparent 1px), linear-gradient(to bottom, ${secondaryMix} 1px, transparent 1px);
  background-size: 20px 20px;
  box-shadow: ${combinedBoxShadow};`;
      }
      if (surface.patternType === 'diagonal') {
        return `  background-color: ${primaryMix};
  background-image: repeating-linear-gradient(var(--card-gradient-dir), ${secondaryMix} 0px, ${secondaryMix} 2px, transparent 2px, transparent 14px);
  box-shadow: ${combinedBoxShadow};`;
      }
      if (surface.patternType === 'waves') {
        return `  background-color: ${primaryMix};
  background-image: radial-gradient(circle at 100% 50%, transparent 20%, ${secondaryMix} 21%, ${secondaryMix} 34%, transparent 35%, transparent);
  background-size: 28px 28px;
  box-shadow: ${combinedBoxShadow};`;
      }
      // Default pattern: 'dots'
      return `  background-color: ${primaryMix};
  background-image: radial-gradient(${secondaryMix} 1.5px, transparent 1.5px);
  background-size: 18px 18px;
  box-shadow: ${combinedBoxShadow};`;
    }

    default:
      return `  background: ${primaryMix};
  box-shadow: ${combinedBoxShadow};`;
  }
}

export function generateCardHtml(input: RenderInput<IndependentElementState>): string {
  const { scopeId, state } = input;
  const { content, icon, surface } = state;

  const iconHtml = renderIconMarkup({
    visible: icon.visible,
    source: icon.source,
    value: icon.value,
    color: icon.color,
    size: icon.size,
    rotate: icon.rotate,
    scopeClass: scopeId,
  });

  const badgeHtml = content.badge.visible
    ? `<div class="${scopeId}__badge-wrap"><span class="${scopeId}__badge">${escapeHtml(content.badge.value)}</span></div>`
    : '';

  const headerHtml =
    (icon.visible && icon.source !== 'none') || content.badge.visible
      ? `<header class="${scopeId}__header">${iconHtml}${badgeHtml}</header>`
      : '';

  const titleHtml = content.title.visible
    ? `<h3 class="${scopeId}__title">${escapeHtml(content.title.value)}</h3>`
    : '';

  const descriptionHtml = content.description.visible
    ? `<p class="${scopeId}__description">${escapeHtml(content.description.value)}</p>`
    : '';

  const numberHtml = content.number.visible
    ? `<div class="${scopeId}__number">${escapeHtml(content.number.value)}</div>`
    : '';

  const percentageHtml = content.percentage.visible
    ? `<div class="${scopeId}__percentage">${escapeHtml(content.percentage.value)}</div>`
    : '';

  const metricsHtml =
    content.number.visible || content.percentage.visible
      ? `<div class="${scopeId}__metrics">${numberHtml}${percentageHtml}</div>`
      : '';

  const analysisHtml = content.analysis.visible
    ? `<div class="${scopeId}__analysis">${escapeHtml(content.analysis.value)}</div>`
    : '';

  const actionHtml = content.actionLabel.visible
    ? `<div class="${scopeId}__footer"><button type="button" class="${scopeId}__action"><span class="${scopeId}__action-label">${escapeHtml(content.actionLabel.value)}</span></button></div>`
    : '';

  return `<article class="${scopeId}" data-element-scope="${scopeId}" data-card-material="${escapeHtml(surface.materialType)}" dir="rtl">
  ${headerHtml}
  <div class="${scopeId}__body">
    ${titleHtml}
    ${descriptionHtml}
    ${metricsHtml}
    ${analysisHtml}
  </div>
  ${actionHtml}
</article>`;
}

export function generateCardCss(input: RenderInput<IndependentElementState>): string {
  const { scopeId, state } = input;
  const { content, icon, dimensions, surface } = state;
  const rootSelector = `[data-element-scope="${scopeId}"].${scopeId}`;

  const widthCss = resolveDimensionCssValue(dimensions.width, dimensions.widthUnit);
  const heightCss = resolveDimensionCssValue(dimensions.height, dimensions.heightUnit);
  const maxWidthCss = resolveMaxDimensionCssValue(dimensions.maxWidth, dimensions.widthUnit);
  const maxHeightCss = resolveMaxDimensionCssValue(dimensions.maxHeight, dimensions.heightUnit);

  const iconJustifyMap: Record<typeof icon.position, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    custom: 'space-between',
  };

  const materialDeclarations = buildCardMaterialCssDeclarations(surface);

  return `/* Scoped CSS for ${scopeId} (Card Element — Material: ${surface.materialType}) */
${rootSelector} {
  --card-primary: ${surface.primaryColor};
  --card-secondary: ${surface.secondaryColor};
  --card-gradient-dir: ${surface.gradientDirection};
  --card-opacity: ${surface.opacity}%;
  --card-blur: ${surface.glassBlur}px;
  --card-glow-size: ${surface.glowIntensity}px;
  --card-glow-color: ${surface.glowColor};
  --card-shadow-size: ${surface.shadowIntensity}px;
  --card-shadow-color: ${surface.shadowColor};
  --card-border-color: ${surface.borderColor};
  --card-border-width: ${surface.borderWidth}px;
  --card-accent-color: ${surface.accentColor};
  --card-badge-bg: ${surface.badgeBackgroundColor};
  --card-action-bg: ${surface.actionBackgroundColor};
  --card-action-text: ${surface.actionTextColor};
  --card-icon-bg: ${surface.iconContainerBackground};
  --card-radius: ${surface.borderRadius}px;
  --card-pad-x: ${surface.paddingX}px;
  --card-pad-y: ${surface.paddingY}px;
  --card-gap: ${surface.gap}px;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--card-gap);
  width: ${widthCss};
  height: ${heightCss};
  min-width: ${dimensions.minWidth}px;
  max-width: ${maxWidthCss};
  min-height: ${dimensions.minHeight}px;
  max-height: ${maxHeightCss};
  padding: var(--card-pad-y) var(--card-pad-x);
  border: var(--card-border-width) solid var(--card-border-color);
  border-radius: var(--card-radius);
  direction: rtl;
  overflow: auto;
${materialDeclarations}
  transition: width 140ms ease, height 140ms ease, border-radius 140ms ease, box-shadow 140ms ease;
}

${rootSelector} .${scopeId}__header {
  display: flex;
  align-items: center;
  justify-content: ${iconJustifyMap[icon.position] || 'flex-start'};
  gap: 12px;
  flex-wrap: wrap;
}

${rootSelector} .${scopeId}__body {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);
}

${rootSelector} .${scopeId}__icon {
  display: ${icon.visible && icon.source !== 'none' ? 'inline-flex' : 'none'};
  align-items: center;
  justify-content: center;
  width: ${icon.size + 18}px;
  height: ${icon.size + 18}px;
  font-size: ${icon.size}px;
  color: ${icon.color};
  background-color: var(--card-icon-bg);
  border-radius: ${Math.max(4, Math.round(surface.borderRadius * 0.5))}px;
  transform: rotate(${icon.rotate}deg);
  flex-shrink: 0;
}

${rootSelector} .${scopeId}__badge-wrap {
  display: ${content.badge.visible ? 'inline-flex' : 'none'};
  align-items: center;
}

${buildCardTextCss(`${rootSelector} .${scopeId}__badge`, content.badge)}
${rootSelector} .${scopeId}__badge {
  background-color: var(--card-badge-bg);
  padding: 4px 10px;
  border-radius: ${Math.max(4, Math.round(surface.borderRadius * 0.35))}px;
}

${buildCardTextCss(`${rootSelector} .${scopeId}__title`, content.title)}

${buildCardTextCss(`${rootSelector} .${scopeId}__description`, content.description)}

${rootSelector} .${scopeId}__metrics {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 6px;
  padding-bottom: 6px;
  border-top: 1px solid var(--card-badge-bg);
  border-bottom: 1px solid var(--card-badge-bg);
}

${buildCardTextCss(`${rootSelector} .${scopeId}__number`, content.number)}
${rootSelector} .${scopeId}__number {
  font-variant-numeric: tabular-nums;
}

${buildCardTextCss(`${rootSelector} .${scopeId}__percentage`, content.percentage)}
${rootSelector} .${scopeId}__percentage {
  font-variant-numeric: tabular-nums;
}

${buildCardTextCss(`${rootSelector} .${scopeId}__analysis`, content.analysis)}

${rootSelector} .${scopeId}__footer {
  display: ${content.actionLabel.visible ? 'flex' : 'none'};
  width: 100%;
}

${rootSelector} .${scopeId}__action {
  display: ${content.actionLabel.visible ? 'inline-flex' : 'none'};
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 18px;
  background-color: var(--card-action-bg);
  border: var(--card-border-width) solid var(--card-accent-color);
  border-radius: ${Math.max(4, Math.round(surface.borderRadius * 0.6))}px;
  cursor: pointer;
}

${buildCardTextCss(`${rootSelector} .${scopeId}__action-label`, content.actionLabel)}`;
}

export function validateCardState(state: IndependentElementState): ValidationResult {
  return validateIndependentElementState(state);
}

export function renderCardPreview(input: RenderInput<IndependentElementState>): PreviewResult {
  const sanitized = sanitizeCardState(input.state);
  const safeInput: RenderInput<IndependentElementState> = {
    ...input,
    state: sanitized,
  };

  const html = generateCardHtml(safeInput);
  const css = generateCardCss(safeInput);

  return {
    instanceId: input.instanceId,
    scopeId: input.scopeId,
    html,
    css,
    dimensionsSummary: {
      widthCss: resolveDimensionCssValue(
        sanitized.dimensions.width,
        sanitized.dimensions.widthUnit
      ),
      heightCss: resolveDimensionCssValue(
        sanitized.dimensions.height,
        sanitized.dimensions.heightUnit
      ),
    },
  };
}

export function generateCardExportBundle(
  input: RenderInput<IndependentElementState>
): ExportBundle {
  const sanitized = sanitizeCardState(input.state);
  const validation = validateCardState(sanitized);
  const safeInput: RenderInput<IndependentElementState> = {
    ...input,
    state: sanitized,
  };

  const html = generateCardHtml(safeInput);
  const css = generateCardCss(safeInput);
  const outputErrors = validateGeneratedCodeOutput(html, css, input.scopeId);

  return createExportBundle({
    elementId: CARD_ELEMENT_ID,
    elementType: CARD_ELEMENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: [...validation.errors, ...outputErrors],
    warnings: validation.warnings.map((w) => ({ code: w.code, message: w.message })),
  });
}

export const cardModule: ElementModule<IndependentElementState> = {
  id: CARD_ELEMENT_ID,
  type: CARD_ELEMENT_ID,
  version: 1,
  family: 'content',
  label: 'Card (البطاقة الإنتاجية)',
  description:
    'بطاقة محتوى ومؤشرات إنتاجية مستقلة تدعم 9 خامات خلفية (Solid, Gradient, Glass, Metal, Ivory, Neon, Dark, Image, Pattern) مع فصل كامل للنصوص والأيقونة والأبعاد.',
  metadata: {
    label: 'Card (البطاقة الإنتاجية)',
    description:
      'عنصر البطاقة الإنتاجية المستقل مع دعم كامل للخامات التسع واستقلال الحقول والأبعاد.',
    family: 'content',
    categories: ['content', 'cards', 'metrics'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: true,
    usesJavaScript: false,
    supportsSlots: true,
  },
  defaultState: CARD_DEFAULT_STATE,
  controlSchema: CARD_CONTROL_SCHEMA,
  sanitizeState: sanitizeCardState,
  validate: validateCardState,
  generateHtml: generateCardHtml,
  generateCss: generateCardCss,
  renderPreview: renderCardPreview,
  generateCode: generateCardExportBundle,
};

export const cardRegistration: RegisteredElementEntry<IndependentElementState> = {
  id: CARD_ELEMENT_ID,
  family: 'content',
  categories: ['content', 'cards', 'metrics'],
  status: 'stable',
  module: cardModule,
};
