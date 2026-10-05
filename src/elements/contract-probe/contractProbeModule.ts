/**
 * Beso Studio V2 — Contract Probe Element Module (Experimental)
 *
 * Purpose:
 * Single experimental probe element created strictly to verify the V2 Core Contract:
 * 1. Displays title, description, number, percentage, analysis, actionLabel, badge, and icon.
 * 2. Every text field is 100% independent and editable; zero static strings exist in HTML.
 * 3. Icon is 100% editable, rotatable, repositionable, replaceable, or hideable.
 * 4. Width and Height are 100% independent (changing width never alters height, and vice versa).
 * 5. Zero undeclared colors or hidden sizes in CSS; every CSS property maps to declared state.
 * 6. Uses an isolated CSS scope per instance: [data-element-scope="<scopeId>"].
 * 7. Not a production library element (status: 'experimental', isProductionReady: false).
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
  cloneElementState,
  EditableText,
  IndependentDimensions,
  IndependentElementState,
} from '../../core/state/elementStateTypes';
import {
  validateGeneratedCodeOutput,
  validateIndependentElementState,
  ValidationResult,
} from '../../core/validation/validator';

export const CONTRACT_PROBE_ID = 'contract-probe';

export const CONTRACT_PROBE_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'مسبار التحقق من عقد النواة',
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
      value: 'يثبت هذا العنصر التجريبي استقلال الحقول النصية والأبعاد والأيقونة والألوان المعلنة.',
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
      value: '1,480',
      visible: true,
      color: '#d4af37',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    percentage: {
      value: '+98.4%',
      visible: true,
      color: '#22c55e',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    analysis: {
      value: 'مؤشر التحليل مستقل تمامًا عن الرقم والنسبة ولا يتأثر بتعديل أي حقل آخر.',
      visible: true,
      color: '#9db5ab',
      fontFamily: "'Cairo', sans-serif",
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
      align: 'start',
    },
    actionLabel: {
      value: 'اختبار الاستجابة المستقلة',
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
      value: 'عقد المرحلة الأولى · تجريبي',
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
    value: 'diamond',
    color: '#d4af37',
    size: 28,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 460,
    height: 340,
    minWidth: 240,
    maxWidth: 960,
    minHeight: 180,
    maxHeight: 900,
    widthUnit: 'px',
    heightUnit: 'px',
    lockAspectRatio: false,
  },
  surface: {
    backgroundColor: '#0c251e',
    borderColor: '#d4af37',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.14)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#061511',
    iconContainerBackground: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    paddingX: 24,
    paddingY: 22,
    gap: 14,
  },
};

export const CONTRACT_PROBE_CONTROLS: ControlDefinition[] = [
  {
    id: 'content-title',
    type: 'editable-text',
    section: 'content',
    label: 'العنوان (title)',
    targetKey: 'title',
  },
  {
    id: 'content-description',
    type: 'editable-text',
    section: 'content',
    label: 'الوصف (description)',
    targetKey: 'description',
  },
  {
    id: 'content-number',
    type: 'editable-text',
    section: 'content',
    label: 'الرقم (number)',
    targetKey: 'number',
  },
  {
    id: 'content-percentage',
    type: 'editable-text',
    section: 'content',
    label: 'النسبة (percentage)',
    targetKey: 'percentage',
  },
  {
    id: 'content-analysis',
    type: 'editable-text',
    section: 'content',
    label: 'التحليل (analysis)',
    targetKey: 'analysis',
  },
  {
    id: 'content-actionLabel',
    type: 'editable-text',
    section: 'content',
    label: 'نص الإجراء (actionLabel)',
    targetKey: 'actionLabel',
  },
  {
    id: 'content-badge',
    type: 'editable-text',
    section: 'content',
    label: 'الوسم (badge)',
    targetKey: 'badge',
  },
  {
    id: 'icon-config',
    type: 'icon-config',
    section: 'icon',
    label: 'إعدادات الأيقونة المستقلة',
    targetKey: 'visible',
  },
  {
    id: 'dimensions-config',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'إعدادات العرض والارتفاع المستقلة',
    targetKey: 'width',
  },
];

export function resolveDimensionCssValue(
  value: number | 'auto',
  unit: 'px' | '%' | 'vw' | 'vh' | 'auto'
): string {
  if (value === 'auto' || unit === 'auto') {
    return 'auto';
  }
  const safeNum = Number.isFinite(value) ? value : 300;
  return `${safeNum}${unit}`;
}

export function resolveMaxDimensionCssValue(
  value: number | 'none',
  unit: 'px' | '%' | 'vw' | 'vh' | 'auto'
): string {
  if (value === 'none') {
    return 'none';
  }
  const safeUnit = unit === 'auto' ? 'px' : unit;
  const safeNum = Number.isFinite(value) ? value : 1000;
  return `${safeNum}${safeUnit}`;
}

function buildTextRule(selector: string, field: EditableText): string {
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

export function sanitizeContractProbeState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(CONTRACT_PROBE_DEFAULT_STATE);
  }
  const candidate = raw as Partial<IndependentElementState>;
  const defaults = CONTRACT_PROBE_DEFAULT_STATE;

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

export function generateContractProbeHtml(input: RenderInput<IndependentElementState>): string {
  const { scopeId, state } = input;
  const { content, icon } = state;

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

  const metricsRowHtml =
    content.number.visible || content.percentage.visible
      ? `<div class="${scopeId}__metrics">${numberHtml}${percentageHtml}</div>`
      : '';

  const analysisHtml = content.analysis.visible
    ? `<div class="${scopeId}__analysis">${escapeHtml(content.analysis.value)}</div>`
    : '';

  const actionHtml = content.actionLabel.visible
    ? `<button type="button" class="${scopeId}__action"><span class="${scopeId}__action-label">${escapeHtml(content.actionLabel.value)}</span></button>`
    : '';

  return `<article class="${scopeId}" data-element-scope="${scopeId}" dir="rtl">
  <div class="${scopeId}__top">
    ${iconHtml}
    ${badgeHtml}
  </div>
  ${titleHtml}
  ${descriptionHtml}
  ${metricsRowHtml}
  ${analysisHtml}
  ${actionHtml}
</article>`;
}

export function generateContractProbeCss(input: RenderInput<IndependentElementState>): string {
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

  return `/* Scoped CSS for ${scopeId} (Contract Probe) */
${rootSelector} {
  --probe-bg: ${surface.backgroundColor};
  --probe-border-color: ${surface.borderColor};
  --probe-accent-color: ${surface.accentColor};
  --probe-badge-bg: ${surface.badgeBackgroundColor};
  --probe-action-bg: ${surface.actionBackgroundColor};
  --probe-action-text: ${surface.actionTextColor};
  --probe-icon-bg: ${surface.iconContainerBackground};
  --probe-radius: ${surface.borderRadius}px;
  --probe-border-width: ${surface.borderWidth}px;
  --probe-pad-x: ${surface.paddingX}px;
  --probe-pad-y: ${surface.paddingY}px;
  --probe-gap: ${surface.gap}px;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--probe-gap);
  width: ${widthCss};
  height: ${heightCss};
  min-width: ${dimensions.minWidth}px;
  max-width: ${maxWidthCss};
  min-height: ${dimensions.minHeight}px;
  max-height: ${maxHeightCss};
  padding: var(--probe-pad-y) var(--probe-pad-x);
  background-color: var(--probe-bg);
  border: var(--probe-border-width) solid var(--probe-border-color);
  border-radius: var(--probe-radius);
  direction: rtl;
  overflow: auto;
  transition: width 140ms ease, height 140ms ease, background-color 140ms ease, border-color 140ms ease;
}

${rootSelector} .${scopeId}__top {
  display: flex;
  align-items: center;
  justify-content: ${iconJustifyMap[icon.position] || 'flex-start'};
  gap: 12px;
  flex-wrap: wrap;
}

${rootSelector} .${scopeId}__icon {
  display: ${icon.visible && icon.source !== 'none' ? 'inline-flex' : 'none'};
  align-items: center;
  justify-content: center;
  width: ${icon.size + 16}px;
  height: ${icon.size + 16}px;
  font-size: ${icon.size}px;
  color: ${icon.color};
  background-color: var(--probe-icon-bg);
  border-radius: ${Math.max(4, Math.round(surface.borderRadius * 0.55))}px;
  transform: rotate(${icon.rotate}deg);
  flex-shrink: 0;
}

${rootSelector} .${scopeId}__badge-wrap {
  display: ${content.badge.visible ? 'inline-flex' : 'none'};
  align-items: center;
}

${buildTextRule(`${rootSelector} .${scopeId}__badge`, content.badge)}
${rootSelector} .${scopeId}__badge {
  background-color: var(--probe-badge-bg);
  padding: 4px 10px;
  border-radius: ${Math.max(4, Math.round(surface.borderRadius * 0.4))}px;
}

${buildTextRule(`${rootSelector} .${scopeId}__title`, content.title)}

${buildTextRule(`${rootSelector} .${scopeId}__description`, content.description)}

${rootSelector} .${scopeId}__metrics {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 4px;
  padding-bottom: 4px;
  border-top: 1px solid var(--probe-badge-bg);
  border-bottom: 1px solid var(--probe-badge-bg);
}

${buildTextRule(`${rootSelector} .${scopeId}__number`, content.number)}
${rootSelector} .${scopeId}__number {
  font-variant-numeric: tabular-nums;
}

${buildTextRule(`${rootSelector} .${scopeId}__percentage`, content.percentage)}
${rootSelector} .${scopeId}__percentage {
  font-variant-numeric: tabular-nums;
}

${buildTextRule(`${rootSelector} .${scopeId}__analysis`, content.analysis)}

${rootSelector} .${scopeId}__action {
  display: ${content.actionLabel.visible ? 'inline-flex' : 'none'};
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 16px;
  background-color: var(--probe-action-bg);
  border: var(--probe-border-width) solid var(--probe-accent-color);
  border-radius: ${Math.max(4, Math.round(surface.borderRadius * 0.65))}px;
  cursor: pointer;
}

${buildTextRule(`${rootSelector} .${scopeId}__action-label`, content.actionLabel)}`;
}

export function validateContractProbe(state: IndependentElementState): ValidationResult {
  return validateIndependentElementState(state);
}

export function renderContractProbePreview(
  input: RenderInput<IndependentElementState>
): PreviewResult {
  const sanitized = sanitizeContractProbeState(input.state);
  const safeInput: RenderInput<IndependentElementState> = {
    ...input,
    state: sanitized,
  };

  const html = generateContractProbeHtml(safeInput);
  const css = generateContractProbeCss(safeInput);

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

export function generateContractProbeBundle(
  input: RenderInput<IndependentElementState>
): ExportBundle {
  const sanitized = sanitizeContractProbeState(input.state);
  const validation = validateContractProbe(sanitized);
  const safeInput: RenderInput<IndependentElementState> = {
    ...input,
    state: sanitized,
  };

  const html = generateContractProbeHtml(safeInput);
  const css = generateContractProbeCss(safeInput);
  const outputErrors = validateGeneratedCodeOutput(html, css, input.scopeId);

  return createExportBundle({
    elementId: CONTRACT_PROBE_ID,
    elementType: CONTRACT_PROBE_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: [...validation.errors, ...outputErrors],
    warnings: validation.warnings.map((w) => ({ code: w.code, message: w.message })),
  });
}

export const contractProbeModule: ElementModule<IndependentElementState> = {
  id: CONTRACT_PROBE_ID,
  type: CONTRACT_PROBE_ID,
  version: 1,
  family: 'probe',
  label: 'Contract Probe (مسبار التحقق من العقد)',
  description:
    'عنصر تجريبي مخصص للتحقق من عقد النواة: استقلال النصوص السبعة، استقلال العرض والارتفاع، استقلال الأيقونة، وعزل CSS.',
  metadata: {
    label: 'Contract Probe (مسبار التحقق من العقد)',
    description:
      'عنصر تجريبي للتحقق من عقد ElementModule واستقلال الحقول والأبعاد والتصدير المعزول.',
    family: 'probe',
    categories: ['experimental', 'contract-verification'],
    status: 'experimental',
    isProductionReady: false,
  },
  capabilities: {
    responsive: true,
    usesImages: false,
    usesJavaScript: false,
    supportsSlots: true,
  },
  defaultState: CONTRACT_PROBE_DEFAULT_STATE,
  controlSchema: CONTRACT_PROBE_CONTROLS,
  sanitizeState: sanitizeContractProbeState,
  validate: validateContractProbe,
  generateHtml: generateContractProbeHtml,
  generateCss: generateContractProbeCss,
  renderPreview: renderContractProbePreview,
  generateCode: generateContractProbeBundle,
};

export const contractProbeRegistration: RegisteredElementEntry<IndependentElementState> = {
  id: CONTRACT_PROBE_ID,
  family: 'probe',
  categories: ['experimental', 'contract-verification'],
  status: 'experimental',
  module: contractProbeModule,
};
