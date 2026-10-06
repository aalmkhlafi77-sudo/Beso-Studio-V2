/**
 * Beso Studio V2 — Production Brand Identity Element Module ('brand-identity')
 *
 * Category: 7. الهوية والتواصل ('identity-social')
 * Family: 'content'
 *
 * Supports:
 * - Text Logo (`logoText`, `showLogoText`)
 * - Image Logo (`logoImageUrl`, `logoImageAlt`, `showLogoImage`)
 * - Independent Symbol (`symbolIcon`, `showSymbol`, `symbolColor`, `symbolBackgroundColor`)
 * - Independent Title (`content.title`) & Description (`content.description`)
 * - Color Palette Swatches (`primaryBrandColor`, `secondaryBrandColor`, `accentBrandColor`)
 * - Typography (`brandFontFamily`, `logoFontSize`, `logoFontWeight`) & Spacing (`paddingX`, `paddingY`, `gap`)
 * - Materials: 'glass' | 'metal' | 'ivory' | 'dark' | 'gradient'
 * - Glow (`glowIntensity`, `glowColor`)
 * - Independent Width & Height
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
  BrandIdentityElementData,
  cloneElementState,
  IndependentDimensions,
  IndependentElementState,
} from '../../core/state/elementStateTypes';
import {
  validateIndependentElementState,
  ValidationResult,
} from '../../core/validation/validator';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';

export const BRAND_IDENTITY_ELEMENT_ID = 'brand-identity';

const DEFAULT_FONT = AVAILABLE_FONTS[1].cssValue;

const DEFAULT_BRAND_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='48' viewBox='0 0 120 48'><rect width='120' height='48' rx='10' fill='%230b241d' stroke='%23d4af37' stroke-opacity='0.5'/><circle cx='26' cy='24' r='12' fill='%23d4af37'/><path d='M48 18 H100 M48 30 H82' stroke='%23f4f7f5' stroke-width='4' stroke-linecap='round'/></svg>`;

export const DEFAULT_BRAND_IDENTITY_DATA: BrandIdentityElementData = {
  logoText: 'BESO LUXURY',
  showLogoText: true,
  logoImageUrl: DEFAULT_BRAND_LOGO_SVG,
  logoImageAlt: 'شعار الهوية البصرية',
  showLogoImage: true,
  symbolIcon: '❖',
  showSymbol: true,
  symbolColor: '#d4af37',
  symbolBackgroundColor: 'rgba(212, 175, 55, 0.16)',
  primaryBrandColor: '#0d2b22',
  primaryColorLabel: 'اللون الرئيسي (Emerald)',
  secondaryBrandColor: '#d4af37',
  secondaryColorLabel: 'اللون الثانوي (Gold)',
  accentBrandColor: '#34d399',
  accentColorLabel: 'اللون المساعد (Mint)',
  showPalette: true,
  brandFontFamily: DEFAULT_FONT,
  logoFontSize: 24,
  logoFontWeight: 700,
  material: 'glass',
  glowColor: '#d4af37',
  glowIntensity: 28,
};

export const BRAND_IDENTITY_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'نظام الهوية البصرية المعتمد',
      visible: true,
      color: '#ffffff',
      fontFamily: DEFAULT_FONT,
      fontSize: 21,
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'start',
    },
    description: {
      value:
        'بطاقة تعريفية للهوية البصرية تجمع الشعار النصي والصوري والرمز المستقل ولوحة الألوان الرسمية.',
      visible: true,
      color: '#c2d8d0',
      fontFamily: AVAILABLE_FONTS[0].cssValue,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.65,
      letterSpacing: 0,
      align: 'start',
    },
    number: {
      value: 'V2.0',
      visible: true,
      color: '#d4af37',
      fontFamily: AVAILABLE_FONTS[2].cssValue,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    percentage: {
      value: 'AA+',
      visible: true,
      color: '#34d399',
      fontFamily: AVAILABLE_FONTS[2].cssValue,
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    analysis: {
      value: 'تباين لوني قياسي متوافق مع الوضعين الزمردي والعاجي',
      visible: true,
      color: '#9ec5b8',
      fontFamily: AVAILABLE_FONTS[0].cssValue,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
      align: 'start',
    },
    actionLabel: {
      value: 'تحميل دليل الهوية',
      visible: true,
      color: '#071712',
      fontFamily: AVAILABLE_FONTS[0].cssValue,
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
    badge: {
      value: 'Brand Kit',
      visible: true,
      color: '#d4af37',
      fontFamily: AVAILABLE_FONTS[0].cssValue,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
  },
  icon: {
    visible: true,
    source: 'emoji',
    value: '❖',
    color: '#d4af37',
    size: 24,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 540,
    height: 'auto',
    minWidth: 260,
    maxWidth: 1200,
    minHeight: 220,
    maxHeight: 'none',
    widthUnit: 'px',
    heightUnit: 'auto',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'glass',
    primaryColor: '#0e2921',
    secondaryColor: '#061510',
    gradientDirection: '135deg',
    opacity: 100,
    glassBlur: 16,
    glowIntensity: 28,
    glowColor: '#d4af37',
    shadowIntensity: 38,
    shadowColor: '#000000',
    patternType: 'dots',
    imageSourceUrl: '',
    backgroundColor: '#0e2921',
    borderColor: 'rgba(212, 175, 55, 0.42)',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.14)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#071712',
    iconContainerBackground: 'rgba(212, 175, 55, 0.16)',
    borderRadius: 22,
    borderWidth: 1,
    paddingX: 26,
    paddingY: 26,
    gap: 18,
  },
  brandIdentity: {
    ...DEFAULT_BRAND_IDENTITY_DATA,
  },
};

export const BRAND_IDENTITY_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'brandIdentity.logo',
    type: 'editable-text',
    section: 'content',
    label: 'الشعار النصي والصوري والرمز المستقل',
    targetKey: 'title',
  },
  {
    id: 'brandIdentity.dimensions',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'العرض والارتفاع والمسافات',
    targetKey: 'width',
  },
  {
    id: 'brandIdentity.palette',
    type: 'color',
    section: 'appearance',
    label: 'لوحة الألوان والخامات والتوهج',
    targetKey: 'primaryColor',
  },
];

export function ensureBrandIdentityData(
  state: IndependentElementState
): BrandIdentityElementData {
  if (state.brandIdentity) {
    return state.brandIdentity;
  }
  return { ...DEFAULT_BRAND_IDENTITY_DATA };
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

function resolveBrandMaterialCss(
  brand: BrandIdentityElementData,
  state: IndependentElementState
): string {
  const { surface } = state;
  if (brand.material === 'glass') {
    return `background: linear-gradient(${surface.gradientDirection}, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%), ${surface.primaryColor};
  backdrop-filter: blur(${surface.glassBlur}px);
  -webkit-backdrop-filter: blur(${surface.glassBlur}px);`;
  }
  if (brand.material === 'metal') {
    return `background: linear-gradient(135deg, #1d2b27 0%, #2c3e38 45%, #121d1a 100%);`;
  }
  if (brand.material === 'ivory') {
    return `background: linear-gradient(135deg, #fbf9f3 0%, #efe9da 100%);`;
  }
  if (brand.material === 'dark') {
    return `background: linear-gradient(145deg, #07120e 0%, #030907 100%);`;
  }
  return `background: linear-gradient(${surface.gradientDirection}, ${surface.primaryColor} 0%, ${surface.secondaryColor} 100%);`;
}

function generateBrandIdentityHtml(input: RenderInput): string {
  const { scopeId, state } = input;
  const brand = ensureBrandIdentityData(state);
  const { content } = state;

  const symbolHtml = brand.showSymbol
    ? `<span class="beso-brand__symbol" aria-hidden="true">${escapeHtml(brand.symbolIcon)}</span>`
    : '';
  const logoTextHtml = brand.showLogoText
    ? `<span class="beso-brand__logo-text">${escapeHtml(brand.logoText)}</span>`
    : '';
  const logoImgHtml =
    brand.showLogoImage && brand.logoImageUrl
      ? `<img class="beso-brand__logo-img" src="${escapeHtml(brand.logoImageUrl)}" alt="${escapeHtml(brand.logoImageAlt)}" />`
      : '';

  const paletteHtml = brand.showPalette
    ? [
        `  <div class="beso-brand__palette" role="list" aria-label="لوحة ألوان الهوية">`,
        `    <div class="beso-brand__swatch" role="listitem">`,
        `      <span class="beso-brand__color-box beso-brand__color-box--primary"></span>`,
        `      <div class="beso-brand__swatch-meta"><strong>${escapeHtml(brand.primaryColorLabel)}</strong><code>${escapeHtml(brand.primaryBrandColor)}</code></div>`,
        `    </div>`,
        `    <div class="beso-brand__swatch" role="listitem">`,
        `      <span class="beso-brand__color-box beso-brand__color-box--secondary"></span>`,
        `      <div class="beso-brand__swatch-meta"><strong>${escapeHtml(brand.secondaryColorLabel)}</strong><code>${escapeHtml(brand.secondaryBrandColor)}</code></div>`,
        `    </div>`,
        `    <div class="beso-brand__swatch" role="listitem">`,
        `      <span class="beso-brand__color-box beso-brand__color-box--accent"></span>`,
        `      <div class="beso-brand__swatch-meta"><strong>${escapeHtml(brand.accentColorLabel)}</strong><code>${escapeHtml(brand.accentBrandColor)}</code></div>`,
        `    </div>`,
        `  </div>`,
      ].join('\n')
    : '';

  return [
    `<section class="beso-brand" data-element-scope="${scopeId}" data-brand-material="${brand.material}">`,
    `  <div class="beso-brand__header">`,
    `    <div class="beso-brand__mark">`,
    symbolHtml ? `      ${symbolHtml}` : '',
    logoTextHtml ? `      ${logoTextHtml}` : '',
    `    </div>`,
    logoImgHtml ? `    ${logoImgHtml}` : '',
    `  </div>`,
    content.title.visible
      ? `  <h2 class="beso-brand__title">${escapeHtml(content.title.value)}</h2>`
      : '',
    content.description.visible
      ? `  <p class="beso-brand__desc">${escapeHtml(content.description.value)}</p>`
      : '',
    paletteHtml,
    `</section>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function generateBrandIdentityCss(input: RenderInput): string {
  const { scopeId, state } = input;
  const brand = ensureBrandIdentityData(state);
  const { content, surface, dimensions } = state;
  const { widthCss, heightCss } = resolveDimensionCss(dimensions);
  const S = `[data-element-scope="${scopeId}"]`;

  const glowShadow =
    brand.glowIntensity > 0
      ? `, 0 0 ${Math.round(brand.glowIntensity)}px ${brand.glowColor}55`
      : '';

  return `${S}.beso-brand {
  width: ${widthCss};
  height: ${heightCss};
  max-width: 100%;
  padding: ${surface.paddingY}px ${surface.paddingX}px;
  border-radius: ${surface.borderRadius}px;
  border: ${surface.borderWidth}px solid ${surface.borderColor};
  display: flex;
  flex-direction: column;
  gap: ${surface.gap}px;
  box-sizing: border-box;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.3)${glowShadow};
  ${resolveBrandMaterialCss(brand, state)}
}

${S} .beso-brand__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

${S} .beso-brand__mark {
  display: flex;
  align-items: center;
  gap: 12px;
}

${S} .beso-brand__symbol {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${brand.symbolBackgroundColor};
  color: ${brand.symbolColor};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

${S} .beso-brand__logo-text {
  font-family: ${brand.brandFontFamily};
  font-size: ${brand.logoFontSize}px;
  font-weight: ${brand.logoFontWeight};
  color: ${brand.secondaryBrandColor};
  letter-spacing: 0.04em;
}

${S} .beso-brand__logo-img {
  height: 42px;
  width: auto;
  border-radius: 8px;
  object-fit: contain;
}

${S} .beso-brand__title {
  margin: 0;
  color: ${content.title.color};
  font-family: ${content.title.fontFamily};
  font-size: ${content.title.fontSize}px;
  font-weight: ${content.title.fontWeight};
  line-height: ${content.title.lineHeight};
}

${S} .beso-brand__desc {
  margin: 0;
  color: ${content.description.color};
  font-family: ${content.description.fontFamily};
  font-size: ${content.description.fontSize}px;
  line-height: ${content.description.lineHeight};
}

${S} .beso-brand__palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 10px;
}

${S} .beso-brand__swatch {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

${S} .beso-brand__color-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

${S} .beso-brand__color-box--primary {
  background: ${brand.primaryBrandColor};
}

${S} .beso-brand__color-box--secondary {
  background: ${brand.secondaryBrandColor};
}

${S} .beso-brand__color-box--accent {
  background: ${brand.accentBrandColor};
}

${S} .beso-brand__swatch-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: ${content.description.color};
}

${S} .beso-brand__swatch-meta strong {
  color: ${content.title.color};
  font-size: 12px;
}`;
}

function sanitizeBrandIdentityState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(BRAND_IDENTITY_DEFAULT_STATE);
  }
  return cloneElementState({
    ...BRAND_IDENTITY_DEFAULT_STATE,
    ...(raw as Partial<IndependentElementState>),
  });
}

function validateBrandIdentityState(state: IndependentElementState): ValidationResult {
  return validateIndependentElementState(state);
}

function renderBrandIdentityPreview(input: RenderInput): PreviewResult {
  const html = generateBrandIdentityHtml(input);
  const css = generateBrandIdentityCss(input);
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

function generateBrandIdentityExportBundle(input: RenderInput): ExportBundle {
  const html = generateBrandIdentityHtml(input);
  const css = generateBrandIdentityCss(input);
  const validation = validateBrandIdentityState(input.state);

  return createExportBundle({
    elementId: BRAND_IDENTITY_ELEMENT_ID,
    elementType: BRAND_IDENTITY_ELEMENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: validation.errors,
  });
}

export const brandIdentityModule: ElementModule = {
  id: BRAND_IDENTITY_ELEMENT_ID,
  type: BRAND_IDENTITY_ELEMENT_ID,
  version: 1,
  family: 'content',
  label: 'بطاقة الهوية البصرية (Brand Identity)',
  description:
    'عنصر هوية بصرية مستقل يدعم الشعار النصي والصوري والرمز المستقل ولوحة الألوان الثلاثية وخامات (Glass / Metal / Ivory / Dark / Gradient).',
  metadata: {
    label: 'بطاقة الهوية البصرية (Brand Identity)',
    description:
      'عنصر هوية بصرية مستقل يدعم الشعار النصي والصوري والرمز المستقل ولوحة الألوان الثلاثية وخامات (Glass / Metal / Ivory / Dark / Gradient).',
    family: 'content',
    category: 'identity-social',
    tags: ['brand-identity', 'logo', 'palette', 'typography', 'هوية بصرية', 'شعار'],
    originGroup: 'native',
    sortOrder: 10,
    categories: ['identity-social', 'branding'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: true,
    usesJavaScript: false,
    supportsSlots: false,
  },
  defaultState: BRAND_IDENTITY_DEFAULT_STATE,
  controlSchema: BRAND_IDENTITY_CONTROL_SCHEMA,
  sanitizeState: sanitizeBrandIdentityState,
  validate: validateBrandIdentityState,
  generateHtml: generateBrandIdentityHtml,
  generateCss: generateBrandIdentityCss,
  renderPreview: renderBrandIdentityPreview,
  generateCode: generateBrandIdentityExportBundle,
};

export const brandIdentityRegistration: RegisteredElementEntry = {
  id: BRAND_IDENTITY_ELEMENT_ID,
  family: 'content',
  category: 'identity-social',
  tags: ['brand-identity', 'logo', 'palette', 'typography', 'هوية بصرية', 'شعار'],
  originGroup: 'native',
  sortOrder: 10,
  categories: ['identity-social', 'branding'],
  status: 'stable',
  module: brandIdentityModule,
};
