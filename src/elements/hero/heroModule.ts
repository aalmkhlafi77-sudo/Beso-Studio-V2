/**
 * Beso Studio V2 — Production Hero Section Element Module ('hero')
 *
 * Category: 4. الأقسام ('sections')
 * Family: 'sections'
 *
 * Supports:
 * - 6 Hero Variants:
 *   1. 'single-image' (Hero بصورة واحدة)
 *   2. 'split' (Hero مقسم)
 *   3. 'background-image' (Hero بخلفية صورة)
 *   4. 'gradient' (Hero بخلفية تدرج)
 *   5. 'glass' (Hero زجاجي)
 *   6. 'neon' (Hero نيون)
 * - Independent Content Fields: Title, Description, Analysis, Badge, Number, Percentage
 * - 1 or 2 Independent Action Buttons (`primaryAction`, `secondaryAction`)
 * - Independent Logo / Icon (`icon`)
 * - Overlay Layer (`overlayEnabled`, `overlayColor`, `overlayOpacity`)
 * - Opacity (`opacity`), Glass Blur (`glassBlur`), Object Fit (`objectFit`), Aspect Ratio (`aspectRatio`)
 * - Independent Width & Height
 * - Fully Responsive across Mobile, Tablet, and Desktop
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
  cloneElementState,
  HeroElementData,
  IndependentDimensions,
  IndependentElementState,
} from '../../core/state/elementStateTypes';
import {
  validateIndependentElementState,
  ValidationResult,
} from '../../core/validation/validator';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';

export const HERO_ELEMENT_ID = 'hero';

const DEFAULT_FONT = AVAILABLE_FONTS[0].cssValue;
const MONO_FONT = AVAILABLE_FONTS[2].cssValue;

const DEFAULT_HERO_SVG_URI = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='760' height='420' viewBox='0 0 760 420'><defs><linearGradient id='hg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%230c2b22'/><stop offset='100%' stop-color='%2305120e'/></linearGradient></defs><rect width='760' height='420' rx='22' fill='url(%23hg)'/><circle cx='580' cy='140' r='115' fill='%23d4af37' fill-opacity='0.18'/><rect x='70' y='80' width='290' height='190' rx='16' fill='%2312382c' stroke='%23d4af37' stroke-opacity='0.45'/><path d='M100 220 L165 155 L225 195 L315 120' stroke='%23d4af37' stroke-width='5' fill='none' stroke-linecap='round'/></svg>`;

export const DEFAULT_HERO_DATA: HeroElementData = {
  variant: 'split',
  imageUrl: DEFAULT_HERO_SVG_URI,
  imageAlt: 'معاينة قسم Hero الرئيسي',
  objectFit: 'cover',
  aspectRatio: '16/9',
  overlayEnabled: true,
  overlayColor: '#04120e',
  overlayOpacity: 45,
  opacity: 100,
  glassBlur: 16,
  glowColor: '#d4af37',
  glowIntensity: 32,
  primaryAction: {
    visible: true,
    label: {
      value: 'ابدأ التصميم الفوري',
      visible: true,
      color: '#071712',
      fontFamily: DEFAULT_FONT,
      fontSize: 15,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'center',
    },
    backgroundColor: '#d4af37',
    textColor: '#071712',
    borderColor: '#f3d46b',
    borderRadius: 12,
  },
  secondaryAction: {
    visible: true,
    label: {
      value: 'استعراض الوثائق المعمارية',
      visible: true,
      color: '#f5f8f6',
      fontFamily: DEFAULT_FONT,
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'center',
    },
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    textColor: '#f5f8f6',
    borderColor: 'rgba(212, 175, 55, 0.45)',
    borderRadius: 12,
  },
};

export const HERO_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'منصة بناء واجهات عربية متجاوبة بمعايير معمارية صارمة',
      visible: true,
      color: '#ffffff',
      fontFamily: DEFAULT_FONT,
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.35,
      letterSpacing: 0,
      align: 'start',
    },
    description: {
      value:
        'صمم وخصص أقسام Hero المتكاملة بستة أنماط بصرية مستقلة مع تحكم كامل في الطبقة الشفافة والأزرار والوسائط.',
      visible: true,
      color: '#c4dad2',
      fontFamily: DEFAULT_FONT,
      fontSize: 15,
      fontWeight: 400,
      lineHeight: 1.65,
      letterSpacing: 0,
      align: 'start',
    },
    number: {
      value: '99.9%',
      visible: true,
      color: '#d4af37',
      fontFamily: MONO_FONT,
      fontSize: 26,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    percentage: {
      value: '+42%',
      visible: true,
      color: '#34d399',
      fontFamily: MONO_FONT,
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    analysis: {
      value: 'عزل تام للنطاق البصري واستجابة تلقائية على الهاتف واللوحي وسطح المكتب',
      visible: true,
      color: '#9ec5b8',
      fontFamily: DEFAULT_FONT,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
      align: 'start',
    },
    actionLabel: {
      value: 'ابدأ التصميم الفوري',
      visible: true,
      color: '#071712',
      fontFamily: DEFAULT_FONT,
      fontSize: 15,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'center',
    },
    badge: {
      value: 'قسم واجهة رئيسي (Hero Section)',
      visible: true,
      color: '#d4af37',
      fontFamily: DEFAULT_FONT,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
  },
  icon: {
    visible: true,
    source: 'icon-library',
    value: 'crown',
    color: '#d4af37',
    size: 26,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 760,
    height: 'auto',
    minWidth: 280,
    maxWidth: 1600,
    minHeight: 280,
    maxHeight: 'none',
    widthUnit: 'px',
    heightUnit: 'auto',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'gradient',
    primaryColor: '#0d2820',
    secondaryColor: '#06130f',
    gradientDirection: '135deg',
    opacity: 100,
    glassBlur: 16,
    glowIntensity: 32,
    glowColor: '#d4af37',
    shadowIntensity: 45,
    shadowColor: '#000000',
    patternType: 'dots',
    imageSourceUrl: '',
    backgroundColor: '#0d2820',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.14)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#071712',
    iconContainerBackground: 'rgba(212, 175, 55, 0.14)',
    borderRadius: 24,
    borderWidth: 1,
    paddingX: 32,
    paddingY: 32,
    gap: 24,
  },
  hero: {
    ...DEFAULT_HERO_DATA,
    primaryAction: {
      ...DEFAULT_HERO_DATA.primaryAction,
      label: { ...DEFAULT_HERO_DATA.primaryAction.label },
    },
    secondaryAction: {
      ...DEFAULT_HERO_DATA.secondaryAction,
      label: { ...DEFAULT_HERO_DATA.secondaryAction.label },
    },
  },
};

export const HERO_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'hero.content',
    type: 'editable-text',
    section: 'content',
    label: 'نصوص وأزرار قسم Hero',
    targetKey: 'title',
  },
  {
    id: 'hero.dimensions',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'أبعاد قسم Hero المستقلة',
    targetKey: 'width',
  },
  {
    id: 'hero.appearance',
    type: 'select',
    section: 'appearance',
    label: 'نمط Hero والخلفية والـ Overlay',
    targetKey: 'materialType',
  },
];

export function ensureHeroData(state: IndependentElementState): HeroElementData {
  if (state.hero) {
    return state.hero;
  }
  return {
    ...DEFAULT_HERO_DATA,
    primaryAction: {
      ...DEFAULT_HERO_DATA.primaryAction,
      label: { ...DEFAULT_HERO_DATA.primaryAction.label },
    },
    secondaryAction: {
      ...DEFAULT_HERO_DATA.secondaryAction,
      label: { ...DEFAULT_HERO_DATA.secondaryAction.label },
    },
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

function renderHeroIcon(state: IndependentElementState): string {
  const { icon } = state;
  if (!icon.visible || icon.source === 'none') {
    return '';
  }
  const inner =
    icon.source === 'icon-library'
      ? ICON_LIBRARY_PRESETS[icon.value] || ICON_LIBRARY_PRESETS.crown
      : icon.source === 'svg' && icon.value.trim().startsWith('<svg')
        ? icon.value
        : `<span>${escapeHtml(icon.value || '✦')}</span>`;

  return `<div class="beso-hero__logo-icon" aria-hidden="true">${inner}</div>`;
}

function generateHeroHtml(input: RenderInput): string {
  const { scopeId, state } = input;
  const hero = ensureHeroData(state);
  const { content } = state;

  const iconHtml = renderHeroIcon(state);
  const badgeHtml = content.badge.visible
    ? `<span class="beso-hero__badge" data-field="badge">${escapeHtml(content.badge.value)}</span>`
    : '';
  const titleHtml = content.title.visible
    ? `<h1 class="beso-hero__title" data-field="title">${escapeHtml(content.title.value)}</h1>`
    : '';
  const descHtml = content.description.visible
    ? `<p class="beso-hero__description" data-field="description">${escapeHtml(content.description.value)}</p>`
    : '';
  const analysisHtml = content.analysis.visible
    ? `<p class="beso-hero__analysis" data-field="analysis">${escapeHtml(content.analysis.value)}</p>`
    : '';

  const metricsHtml =
    content.number.visible || content.percentage.visible
      ? `<div class="beso-hero__metrics">
      ${content.number.visible ? `<strong class="beso-hero__number">${escapeHtml(content.number.value)}</strong>` : ''}
      ${content.percentage.visible ? `<span class="beso-hero__percentage">${escapeHtml(content.percentage.value)}</span>` : ''}
    </div>`
      : '';

  const primaryBtnHtml =
    hero.primaryAction.visible && hero.primaryAction.label.visible
      ? `<button type="button" class="beso-hero__btn beso-hero__btn--primary" data-hero-action="primary">${escapeHtml(hero.primaryAction.label.value)}</button>`
      : '';
  const secondaryBtnHtml =
    hero.secondaryAction.visible && hero.secondaryAction.label.visible
      ? `<button type="button" class="beso-hero__btn beso-hero__btn--secondary" data-hero-action="secondary">${escapeHtml(hero.secondaryAction.label.value)}</button>`
      : '';

  const showForegroundMedia =
    hero.variant === 'single-image' ||
    hero.variant === 'split' ||
    hero.variant === 'glass' ||
    hero.variant === 'neon';

  const mediaHtml = showForegroundMedia
    ? `<div class="beso-hero__media">
      <img class="beso-hero__img" src="${escapeHtml(hero.imageUrl)}" alt="${escapeHtml(hero.imageAlt)}" />
    </div>`
    : '';

  const overlayHtml = hero.overlayEnabled
    ? `<div class="beso-hero__overlay" aria-hidden="true"></div>`
    : '';

  return [
    `<section class="beso-hero" data-element-scope="${scopeId}" data-hero-variant="${hero.variant}">`,
    overlayHtml ? `  ${overlayHtml}` : '',
    `  <div class="beso-hero__inner">`,
    `    <div class="beso-hero__content">`,
    iconHtml || badgeHtml
      ? `      <div class="beso-hero__header-row">${iconHtml}${badgeHtml}</div>`
      : '',
    titleHtml ? `      ${titleHtml}` : '',
    descHtml ? `      ${descHtml}` : '',
    metricsHtml ? `      ${metricsHtml}` : '',
    analysisHtml ? `      ${analysisHtml}` : '',
    primaryBtnHtml || secondaryBtnHtml
      ? `      <div class="beso-hero__actions">${primaryBtnHtml}${secondaryBtnHtml}</div>`
      : '',
    `    </div>`,
    mediaHtml ? `    ${mediaHtml}` : '',
    `  </div>`,
    `</section>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function generateHeroCss(input: RenderInput): string {
  const { scopeId, state } = input;
  const hero = ensureHeroData(state);
  const { content, surface, icon, dimensions } = state;
  const { widthCss, heightCss } = resolveDimensionCss(dimensions);
  const S = `[data-element-scope="${scopeId}"]`;

  let surfaceBgCss = `background: linear-gradient(${surface.gradientDirection}, ${surface.primaryColor} 0%, ${surface.secondaryColor} 100%);`;
  if (hero.variant === 'background-image') {
    surfaceBgCss = `background-image: url("${hero.imageUrl.replace(/"/g, '\\"')}");
  background-size: ${hero.objectFit === 'contain' ? 'contain' : 'cover'};
  background-position: center;`;
  } else if (hero.variant === 'glass') {
    surfaceBgCss = `background: linear-gradient(${surface.gradientDirection}, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%), ${surface.primaryColor};
  backdrop-filter: blur(${hero.glassBlur}px);
  -webkit-backdrop-filter: blur(${hero.glassBlur}px);`;
  } else if (hero.variant === 'neon') {
    surfaceBgCss = `background: radial-gradient(circle at top right, ${hero.glowColor}28 0%, ${surface.primaryColor} 65%, ${surface.secondaryColor} 100%);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45), 0 0 ${Math.max(12, hero.glowIntensity)}px ${hero.glowColor}66;`;
  }

  const innerLayoutCss =
    hero.variant === 'split'
      ? `display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: center;
  gap: ${surface.gap}px;`
      : `display: flex;
  flex-direction: column;
  gap: ${surface.gap}px;`;

  return `${S}.beso-hero {
  width: ${widthCss};
  height: ${heightCss};
  max-width: 100%;
  padding: ${surface.paddingY}px ${surface.paddingX}px;
  border-radius: ${surface.borderRadius}px;
  border: ${surface.borderWidth}px solid ${surface.borderColor};
  opacity: ${(hero.opacity / 100).toFixed(2)};
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  ${surfaceBgCss}
}

${S} .beso-hero__overlay {
  position: absolute;
  inset: 0;
  background: ${hero.overlayColor};
  opacity: ${(hero.overlayOpacity / 100).toFixed(2)};
  pointer-events: none;
  z-index: 1;
}

${S} .beso-hero__inner {
  position: relative;
  z-index: 2;
  ${innerLayoutCss}
}

${S} .beso-hero__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

${S} .beso-hero__header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

${S} .beso-hero__logo-icon {
  width: ${icon.size + 16}px;
  height: ${icon.size + 16}px;
  border-radius: 12px;
  background: ${surface.iconContainerBackground};
  color: ${icon.color};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${icon.rotate}deg);
}

${S} .beso-hero__logo-icon svg {
  width: ${icon.size}px;
  height: ${icon.size}px;
}

${S} .beso-hero__badge {
  color: ${content.badge.color};
  font-family: ${content.badge.fontFamily};
  font-size: ${content.badge.fontSize}px;
  font-weight: ${content.badge.fontWeight};
  background: ${surface.badgeBackgroundColor};
  padding: 5px 12px;
  border-radius: 999px;
}

${S} .beso-hero__title {
  margin: 0;
  color: ${content.title.color};
  font-family: ${content.title.fontFamily};
  font-size: ${content.title.fontSize}px;
  font-weight: ${content.title.fontWeight};
  line-height: ${content.title.lineHeight};
  text-align: ${content.title.align};
}

${S} .beso-hero__description {
  margin: 0;
  color: ${content.description.color};
  font-family: ${content.description.fontFamily};
  font-size: ${content.description.fontSize}px;
  font-weight: ${content.description.fontWeight};
  line-height: ${content.description.lineHeight};
  text-align: ${content.description.align};
}

${S} .beso-hero__metrics {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

${S} .beso-hero__number {
  color: ${content.number.color};
  font-family: ${content.number.fontFamily};
  font-size: ${content.number.fontSize}px;
  font-weight: ${content.number.fontWeight};
}

${S} .beso-hero__percentage {
  color: ${content.percentage.color};
  font-family: ${content.percentage.fontFamily};
  font-size: ${content.percentage.fontSize}px;
  font-weight: ${content.percentage.fontWeight};
}

${S} .beso-hero__analysis {
  margin: 0;
  color: ${content.analysis.color};
  font-family: ${content.analysis.fontFamily};
  font-size: ${content.analysis.fontSize}px;
  line-height: ${content.analysis.lineHeight};
}

${S} .beso-hero__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

${S} .beso-hero__btn {
  padding: 11px 22px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

${S} .beso-hero__btn--primary {
  background: ${hero.primaryAction.backgroundColor};
  color: ${hero.primaryAction.textColor};
  border-color: ${hero.primaryAction.borderColor};
  border-radius: ${hero.primaryAction.borderRadius}px;
  font-family: ${hero.primaryAction.label.fontFamily};
  font-size: ${hero.primaryAction.label.fontSize}px;
  font-weight: ${hero.primaryAction.label.fontWeight};
}

${S} .beso-hero__btn--secondary {
  background: ${hero.secondaryAction.backgroundColor};
  color: ${hero.secondaryAction.textColor};
  border-color: ${hero.secondaryAction.borderColor};
  border-radius: ${hero.secondaryAction.borderRadius}px;
  font-family: ${hero.secondaryAction.label.fontFamily};
  font-size: ${hero.secondaryAction.label.fontSize}px;
  font-weight: ${hero.secondaryAction.label.fontWeight};
}

${S} .beso-hero__media {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  ${hero.aspectRatio !== 'auto' ? `aspect-ratio: ${hero.aspectRatio};` : ''}
}

${S} .beso-hero__img {
  width: 100%;
  height: 100%;
  object-fit: ${hero.objectFit};
  display: block;
}

@media (max-width: 768px) {
  ${S}.beso-hero {
    padding: 20px;
  }
  ${S} .beso-hero__inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  ${S}.beso-hero {
    padding: 16px;
  }
  ${S} .beso-hero__actions {
    flex-direction: column;
    align-items: stretch;
  }
}`;
}

function sanitizeHeroState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(HERO_DEFAULT_STATE);
  }
  return cloneElementState({
    ...HERO_DEFAULT_STATE,
    ...(raw as Partial<IndependentElementState>),
  });
}

function validateHeroState(state: IndependentElementState): ValidationResult {
  return validateIndependentElementState(state);
}

function renderHeroPreview(input: RenderInput): PreviewResult {
  const html = generateHeroHtml(input);
  const css = generateHeroCss(input);
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

function generateHeroExportBundle(input: RenderInput): ExportBundle {
  const html = generateHeroHtml(input);
  const css = generateHeroCss(input);
  const validation = validateHeroState(input.state);

  return createExportBundle({
    elementId: HERO_ELEMENT_ID,
    elementType: HERO_ELEMENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: validation.errors,
  });
}

export const heroModule: ElementModule = {
  id: HERO_ELEMENT_ID,
  type: HERO_ELEMENT_ID,
  version: 1,
  family: 'sections',
  label: 'قسم الواجهة الرئيسي (Hero Section)',
  description:
    'قسم Hero إنتاجي متجاوب يدعم 6 أنماط (صورة واحدة، مقسم، خلفية صورة، تدرج، زجاجي، نيون)، زرين مستقلين، طبقة Overlay، وObject Fit.',
  metadata: {
    label: 'قسم الواجهة الرئيسي (Hero Section)',
    description:
      'قسم Hero إنتاجي متجاوب يدعم 6 أنماط (صورة واحدة، مقسم، خلفية صورة، تدرج، زجاجي، نيون)، زرين مستقلين، طبقة Overlay، وObject Fit.',
    family: 'sections',
    category: 'sections',
    tags: ['hero', 'promo-section', 'stats-section', 'content-section', 'أقسام', 'واجهة رئيسية'],
    originGroup: 'native',
    sortOrder: 10,
    categories: ['sections', 'hero'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: true,
    usesJavaScript: false,
    supportsSlots: false,
  },
  defaultState: HERO_DEFAULT_STATE,
  controlSchema: HERO_CONTROL_SCHEMA,
  sanitizeState: sanitizeHeroState,
  validate: validateHeroState,
  generateHtml: generateHeroHtml,
  generateCss: generateHeroCss,
  renderPreview: renderHeroPreview,
  generateCode: generateHeroExportBundle,
};

export const heroRegistration: RegisteredElementEntry = {
  id: HERO_ELEMENT_ID,
  family: 'sections',
  category: 'sections',
  tags: ['hero', 'promo-section', 'stats-section', 'content-section', 'أقسام', 'واجهة رئيسية'],
  originGroup: 'native',
  sortOrder: 10,
  categories: ['sections', 'hero'],
  status: 'stable',
  module: heroModule,
};
