/**
 * Beso Studio V2 — Production Social Dock Element Module ('social-dock')
 *
 * Category: 7. الهوية والتواصل ('identity-social')
 * Family: 'controls'
 *
 * Supports:
 * - Dynamic list of social links (`items: SocialDockLinkItem[]`) extensible without modifying component code.
 * - Each item independently supports:
 *   name, url, icon, color, backgroundColor, size, order, visible, ariaLabel, openInNewTab.
 * - Orientation: 'horizontal' (أفقي) | 'vertical' (رأسي).
 * - Dock Position: 'inline' | 'bottom-center' | 'start-side' | 'end-side'.
 * - Independent Width and Height.
 * - Validation for URLs and Accessibility (`aria-label`).
 */

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
  IndependentDimensions,
  IndependentElementState,
  SocialDockElementData,
  SocialDockLinkItem,
} from '../../core/state/elementStateTypes';
import {
  validateIndependentElementState,
  ValidationIssue,
  ValidationResult,
} from '../../core/validation/validator';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';

export const SOCIAL_DOCK_ELEMENT_ID = 'social-dock';

const DEFAULT_FONT = AVAILABLE_FONTS[0].cssValue;

export const DEFAULT_SOCIAL_DOCK_ITEMS: SocialDockLinkItem[] = [
  {
    id: 'social-x',
    name: 'منصة X',
    url: 'https://x.com/besostudio',
    icon: '𝕏',
    color: '#f8fafc',
    backgroundColor: '#0e2820',
    size: 46,
    order: 1,
    visible: true,
    ariaLabel: 'تابعنا على منصة X',
    openInNewTab: true,
  },
  {
    id: 'social-github',
    name: 'GitHub',
    url: 'https://github.com/besostudio',
    icon: '⌘',
    color: '#d4af37',
    backgroundColor: '#0e2820',
    size: 46,
    order: 2,
    visible: true,
    ariaLabel: 'مستودعاتنا على GitHub',
    openInNewTab: true,
  },
  {
    id: 'social-linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/besostudio',
    icon: 'in',
    color: '#38bdf8',
    backgroundColor: '#0e2820',
    size: 46,
    order: 3,
    visible: true,
    ariaLabel: 'صفحتنا الرسمية على LinkedIn',
    openInNewTab: true,
  },
  {
    id: 'social-youtube',
    name: 'YouTube',
    url: 'https://youtube.com/@besostudio',
    icon: '▶',
    color: '#f87171',
    backgroundColor: '#0e2820',
    size: 46,
    order: 4,
    visible: true,
    ariaLabel: 'قناتنا التعليمية على YouTube',
    openInNewTab: true,
  },
];

export const DEFAULT_SOCIAL_DOCK_DATA: SocialDockElementData = {
  items: DEFAULT_SOCIAL_DOCK_ITEMS.map((item) => ({ ...item })),
  orientation: 'horizontal',
  dockPosition: 'inline',
};

export const SOCIAL_DOCK_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'تواصل معنا عبر المنصات الرقمية',
      visible: true,
      color: '#f4f7f5',
      fontFamily: DEFAULT_FONT,
      fontSize: 15,
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'center',
    },
    description: {
      value: 'شريط تواصل اجتماعي قابل للتخصيص والترتيب',
      visible: false,
      color: '#b7ccc4',
      fontFamily: DEFAULT_FONT,
      fontSize: 13,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      align: 'center',
    },
    number: {
      value: '04',
      visible: false,
      color: '#d4af37',
      fontFamily: DEFAULT_FONT,
      fontSize: 16,
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
      value: 'روابط موثقة ومتوافقة مع معايير الوصول',
      visible: false,
      color: '#9ec5b8',
      fontFamily: DEFAULT_FONT,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'center',
    },
    actionLabel: {
      value: 'تواصل',
      visible: false,
      color: '#071712',
      fontFamily: DEFAULT_FONT,
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
    badge: {
      value: 'Social Dock',
      visible: false,
      color: '#d4af37',
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
    source: 'emoji',
    value: '🌐',
    color: '#d4af37',
    size: 20,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 'auto',
    height: 'auto',
    minWidth: 120,
    maxWidth: 1000,
    minHeight: 56,
    maxHeight: 'none',
    widthUnit: 'auto',
    heightUnit: 'auto',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'glass',
    primaryColor: '#0b221b',
    secondaryColor: '#06130f',
    gradientDirection: '135deg',
    opacity: 95,
    glassBlur: 14,
    glowIntensity: 20,
    glowColor: '#d4af37',
    shadowIntensity: 35,
    shadowColor: '#000000',
    patternType: 'dots',
    imageSourceUrl: '',
    backgroundColor: '#0b221b',
    borderColor: 'rgba(212, 175, 55, 0.38)',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.14)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#071712',
    iconContainerBackground: 'rgba(212, 175, 55, 0.14)',
    borderRadius: 22,
    borderWidth: 1,
    paddingX: 18,
    paddingY: 14,
    gap: 12,
  },
  socialDock: {
    ...DEFAULT_SOCIAL_DOCK_DATA,
    items: DEFAULT_SOCIAL_DOCK_ITEMS.map((item) => ({ ...item })),
  },
};

export const SOCIAL_DOCK_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'socialDock.items',
    type: 'editable-text',
    section: 'content',
    label: 'قائمة الروابط الاجتماعية القابلة للإضافة',
    targetKey: 'title',
  },
  {
    id: 'socialDock.dimensions',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'العرض والارتفاع المستقلان',
    targetKey: 'width',
  },
  {
    id: 'socialDock.appearance',
    type: 'select',
    section: 'appearance',
    label: 'اتجاه الشريط وموضعه',
    targetKey: 'materialType',
  },
];

export function ensureSocialDockData(state: IndependentElementState): SocialDockElementData {
  if (state.socialDock && Array.isArray(state.socialDock.items)) {
    return state.socialDock;
  }
  return {
    ...DEFAULT_SOCIAL_DOCK_DATA,
    items: DEFAULT_SOCIAL_DOCK_ITEMS.map((item) => ({ ...item })),
  };
}

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

export function isValidSocialDockUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  const trimmed = url.trim();
  return /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(trimmed);
}

function validateSocialDockState(state: IndependentElementState): ValidationResult {
  const base = validateIndependentElementState(state);
  const extraErrors: ValidationIssue[] = [];
  const extraWarnings: ValidationIssue[] = [];

  const dock = ensureSocialDockData(state);
  for (const item of dock.items) {
    if (!item.visible) continue;

    if (!isValidSocialDockUrl(item.url)) {
      extraErrors.push({
        code: 'INVALID_SOCIAL_URL',
        field: `socialDock.items.${item.id}.url`,
        message: `الرابط في العنصر "${item.name || item.id}" غير صالح (${item.url}). يجب أن يبدأ بـ https:// أو http:// أو mailto: أو #.`,
        severity: 'error',
      });
    }

    if (!item.ariaLabel || !item.ariaLabel.trim()) {
      extraErrors.push({
        code: 'MISSING_SOCIAL_ARIA_LABEL',
        field: `socialDock.items.${item.id}.ariaLabel`,
        message: `النص البديل لإمكانية الوصول (ariaLabel) مطلوب للرابط "${item.name || item.id}".`,
        severity: 'error',
      });
    }
  }

  return {
    valid: base.errors.length === 0 && extraErrors.length === 0,
    errors: [...base.errors, ...extraErrors],
    warnings: [...base.warnings, ...extraWarnings],
  };
}

function generateSocialDockHtml(input: RenderInput): string {
  const { scopeId, state } = input;
  const dock = ensureSocialDockData(state);
  const sortedVisibleItems = [...dock.items]
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  const titleHtml = state.content.title.visible
    ? `<span class="beso-social-dock__heading">${escapeHtml(state.content.title.value)}</span>`
    : '';

  const linksMarkup = sortedVisibleItems
    .map((item) => {
      const targetAttrs = item.openInNewTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      return [
        `    <a`,
        `      class="beso-social-dock__link"`,
        `      data-social-id="${escapeHtml(item.id)}"`,
        `      href="${escapeHtml(item.url)}"`,
        `      aria-label="${escapeHtml(item.ariaLabel || item.name)}"`,
        `      title="${escapeHtml(item.name)}"${targetAttrs}`,
        `    >`,
        `      <span class="beso-social-dock__icon" aria-hidden="true">${escapeHtml(item.icon)}</span>`,
        `      <span class="beso-social-dock__name">${escapeHtml(item.name)}</span>`,
        `    </a>`,
      ].join('\n');
    })
    .join('\n');

  return [
    `<nav class="beso-social-dock" data-element-scope="${scopeId}" data-dock-orientation="${dock.orientation}" data-dock-position="${dock.dockPosition}" aria-label="${escapeHtml(state.content.title.value || 'روابط التواصل الاجتماعي')}">`,
    titleHtml ? `  ${titleHtml}` : '',
    `  <div class="beso-social-dock__list">`,
    linksMarkup,
    `  </div>`,
    `</nav>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function generateSocialDockCss(input: RenderInput): string {
  const { scopeId, state } = input;
  const dock = ensureSocialDockData(state);
  const { surface, dimensions, content } = state;
  const { widthCss, heightCss } = resolveDimensionCss(dimensions);
  const S = `[data-element-scope="${scopeId}"]`;

  const itemStyles = dock.items
    .map(
      (item) => `${S} .beso-social-dock__link[data-social-id="${item.id}"] {
  width: ${item.size}px;
  height: ${item.size}px;
  color: ${item.color};
  background: ${item.backgroundColor};
}`
    )
    .join('\n\n');

  const positionCss =
    dock.dockPosition === 'bottom-center'
      ? `margin-inline: auto; align-self: center;`
      : dock.dockPosition === 'start-side'
        ? `align-self: flex-start;`
        : dock.dockPosition === 'end-side'
          ? `align-self: flex-end;`
          : '';

  return `${S}.beso-social-dock {
  width: ${widthCss};
  height: ${heightCss};
  max-width: 100%;
  padding: ${surface.paddingY}px ${surface.paddingX}px;
  border-radius: ${surface.borderRadius}px;
  border: ${surface.borderWidth}px solid ${surface.borderColor};
  background: linear-gradient(${surface.gradientDirection}, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%), ${surface.primaryColor};
  backdrop-filter: blur(${surface.glassBlur}px);
  -webkit-backdrop-filter: blur(${surface.glassBlur}px);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.3);
  ${positionCss}
}

${S} .beso-social-dock__heading {
  color: ${content.title.color};
  font-family: ${content.title.fontFamily};
  font-size: ${content.title.fontSize}px;
  font-weight: ${content.title.fontWeight};
}

${S} .beso-social-dock__list {
  display: flex;
  flex-direction: ${dock.orientation === 'vertical' ? 'column' : 'row'};
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${surface.gap}px;
}

${S} .beso-social-dock__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid ${surface.borderColor};
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

${S} .beso-social-dock__link:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
}

${S} .beso-social-dock__icon {
  font-size: 18px;
  line-height: 1;
}

${S} .beso-social-dock__name {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

${itemStyles}`;
}

function sanitizeSocialDockState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(SOCIAL_DOCK_DEFAULT_STATE);
  }
  return cloneElementState({
    ...SOCIAL_DOCK_DEFAULT_STATE,
    ...(raw as Partial<IndependentElementState>),
  });
}

function renderSocialDockPreview(input: RenderInput): PreviewResult {
  const html = generateSocialDockHtml(input);
  const css = generateSocialDockCss(input);
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

function generateSocialDockExportBundle(input: RenderInput): ExportBundle {
  const html = generateSocialDockHtml(input);
  const css = generateSocialDockCss(input);
  const validation = validateSocialDockState(input.state);

  return createExportBundle({
    elementId: SOCIAL_DOCK_ELEMENT_ID,
    elementType: SOCIAL_DOCK_ELEMENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: validation.errors,
  });
}

export const socialDockModule: ElementModule = {
  id: SOCIAL_DOCK_ELEMENT_ID,
  type: SOCIAL_DOCK_ELEMENT_ID,
  version: 1,
  family: 'controls',
  label: 'شريط الروابط الاجتماعية (Social Dock)',
  description:
    'شريط تواصل اجتماعي مستقل يدعم قائمة روابط قابلة للإضافة والترتيب، الألوان والأحجام الفردية، التوجيه الأفقي/الرأسي، والتحقق من الوصول.',
  metadata: {
    label: 'شريط الروابط الاجتماعية (Social Dock)',
    description:
      'شريط تواصل اجتماعي مستقل يدعم قائمة روابط قابلة للإضافة والترتيب، الألوان والأحجام الفردية، التوجيه الأفقي/الرأسي، والتحقق من الوصول.',
    family: 'controls',
    category: 'identity-social',
    tags: ['social-dock', 'social-buttons', 'links', 'تواصل اجتماعي', 'هوية'],
    originGroup: 'native',
    sortOrder: 20,
    categories: ['identity-social', 'social'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: false,
    usesJavaScript: false,
    supportsSlots: false,
  },
  defaultState: SOCIAL_DOCK_DEFAULT_STATE,
  controlSchema: SOCIAL_DOCK_CONTROL_SCHEMA,
  sanitizeState: sanitizeSocialDockState,
  validate: validateSocialDockState,
  generateHtml: generateSocialDockHtml,
  generateCss: generateSocialDockCss,
  renderPreview: renderSocialDockPreview,
  generateCode: generateSocialDockExportBundle,
};

export const socialDockRegistration: RegisteredElementEntry = {
  id: SOCIAL_DOCK_ELEMENT_ID,
  family: 'controls',
  category: 'identity-social',
  tags: ['social-dock', 'social-buttons', 'links', 'تواصل اجتماعي', 'هوية'],
  originGroup: 'native',
  sortOrder: 20,
  categories: ['identity-social', 'social'],
  status: 'stable',
  module: socialDockModule,
};
