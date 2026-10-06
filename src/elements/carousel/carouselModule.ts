/**
 * Beso Studio V2 — Production Carousel Element Module ('carousel')
 *
 * Category: 3. الصور والعروض ('media-showcase')
 * Family: 'media'
 *
 * Supports:
 * - Independent slides list (`slides: CarouselSlideItem[]`).
 * - Each slide independently owns:
 *   image (`imageUrl`, `imageAlt`), `title`, `description`, `number`, `percentage`,
 *   `analysis`, `actionLabel`, `badge`, `actionBackgroundColor`, `actionTextColor`.
 * - Modifying one slide NEVER modifies any other slide; modifying one text field in a slide
 *   NEVER modifies any other text field in that slide.
 * - Independent layout modes: 'single' (صورة واحدة) | 'two-columns' (عمودين) | 'cards-3d' (ثلاثي الأبعاد).
 * - Arrows (`showArrows`), Dots (`showDots`), AutoPlay (`autoPlay`), Interval (`intervalMs`),
 *   Direction (`rtl` | `ltr`), Pause on Hover (`pauseOnHover`).
 * - Independent Width and Height.
 * - ExportBundle includes scoped vanilla JavaScript ONLY when needed (when multi-slide navigation
 *   or autoplay is active).
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
  CarouselElementData,
  CarouselSlideItem,
  cloneElementState,
  EditableText,
  IndependentDimensions,
  IndependentElementState,
} from '../../core/state/elementStateTypes';
import {
  validateIndependentElementState,
  ValidationResult,
} from '../../core/validation/validator';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';

export const CAROUSEL_ELEMENT_ID = 'carousel';

const DEFAULT_FONT = AVAILABLE_FONTS[0].cssValue;
const MONO_FONT = AVAILABLE_FONTS[2].cssValue;

function createText(
  value: string,
  fontSize: number,
  fontWeight: number,
  color: string,
  fontFamily = DEFAULT_FONT
): EditableText {
  return {
    value,
    visible: true,
    color,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight: 1.45,
    letterSpacing: 0,
    align: 'start',
  };
}

export function createCarouselSlide(
  id: string,
  titleText: string,
  descText: string,
  numText: string,
  pctText: string,
  analysisText: string,
  actionText: string,
  badgeText: string,
  svgAccentHex: string
): CarouselSlideItem {
  const encodedAccent = encodeURIComponent(svgAccentHex);
  const svgDataUri = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%230b241d'/><stop offset='100%' stop-color='%2305110e'/></linearGradient></defs><rect width='640' height='360' rx='18' fill='url(%23g)'/><circle cx='500' cy='120' r='90' fill='${encodedAccent}' fill-opacity='0.18'/><circle cx='160' cy='250' r='65' fill='${encodedAccent}' fill-opacity='0.12'/><path d='M90 260 Q 240 120 390 210 T 560 110' stroke='${encodedAccent}' stroke-width='4' fill='none'/></svg>`;

  return {
    id,
    imageUrl: svgDataUri,
    imageAlt: titleText,
    title: createText(titleText, 22, 700, '#f7faf8'),
    description: createText(descText, 14, 400, '#c0d6ce'),
    number: createText(numText, 28, 700, svgAccentHex, MONO_FONT),
    percentage: createText(pctText, 13, 700, '#34d399', MONO_FONT),
    analysis: createText(analysisText, 13, 500, '#9ec5b8'),
    actionLabel: createText(actionText, 14, 700, '#071712'),
    badge: createText(badgeText, 12, 700, svgAccentHex),
    actionBackgroundColor: svgAccentHex,
    actionTextColor: '#071712',
  };
}

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlideItem[] = [
  createCarouselSlide(
    'slide-1',
    'الشريحة الأولى: استوديو التصميم المعماري',
    'تحكم مستقل تمامًا في صورة وعنوان ووصف ورقم ونسبة وتحليل كل شريحة على حدة.',
    '98.4%',
    '+24.5%',
    'معدل ثبات الأداء البصري في الشريحة الأولى',
    'استعراض الشريحة الأولى',
    'شريحة 01',
    '#d4af37'
  ),
  createCarouselSlide(
    'slide-2',
    'الشريحة الثانية: عزل كامل بين الشرائح',
    'تعديل نصوص أو ألوان أو صورة هذه الشريحة لا يغير الشريحة الأولى أو الثالثة نهائيًا.',
    '14,820',
    '+19.2%',
    'تحليل مستقل خاص بالشريحة الثانية فقط',
    'اكتشف الشريحة الثانية',
    'شريحة 02',
    '#34d399'
  ),
  createCarouselSlide(
    'slide-3',
    'الشريحة الثالثة: تخطيطات متعددة ومتجاوبة',
    'يدعم التبديل الفوري بين تخطيط الصورة الواحدة أو العمودين أو البطاقات ثلاثية الأبعاد.',
    '3.8x',
    '+31.0%',
    'سرعة التخصيص والتصدير المباشر',
    'انتقل للشريحة الثالثة',
    'شريحة 03',
    '#38bdf8'
  ),
];

export const DEFAULT_CAROUSEL_DATA: CarouselElementData = {
  slides: DEFAULT_CAROUSEL_SLIDES.map((s) => ({
    ...s,
    title: { ...s.title },
    description: { ...s.description },
    number: { ...s.number },
    percentage: { ...s.percentage },
    analysis: { ...s.analysis },
    actionLabel: { ...s.actionLabel },
    badge: { ...s.badge },
  })),
  activeSlideIndex: 0,
  layoutMode: 'two-columns',
  showArrows: true,
  showDots: true,
  autoPlay: false,
  intervalMs: 4000,
  direction: 'rtl',
  pauseOnHover: true,
  arrowColor: '#d4af37',
  arrowBackgroundColor: 'rgba(10, 31, 25, 0.85)',
  dotColor: 'rgba(212, 175, 55, 0.3)',
  activeDotColor: '#d4af37',
};

export const CAROUSEL_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: { ...DEFAULT_CAROUSEL_SLIDES[0].title },
    description: { ...DEFAULT_CAROUSEL_SLIDES[0].description },
    number: { ...DEFAULT_CAROUSEL_SLIDES[0].number },
    percentage: { ...DEFAULT_CAROUSEL_SLIDES[0].percentage },
    analysis: { ...DEFAULT_CAROUSEL_SLIDES[0].analysis },
    actionLabel: { ...DEFAULT_CAROUSEL_SLIDES[0].actionLabel },
    badge: { ...DEFAULT_CAROUSEL_SLIDES[0].badge },
  },
  icon: {
    visible: true,
    source: 'emoji',
    value: '◈',
    color: '#d4af37',
    size: 22,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 680,
    height: 'auto',
    minWidth: 280,
    maxWidth: 1400,
    minHeight: 240,
    maxHeight: 'none',
    widthUnit: 'px',
    heightUnit: 'auto',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'gradient',
    primaryColor: '#0e2921',
    secondaryColor: '#071712',
    gradientDirection: '135deg',
    opacity: 100,
    glassBlur: 14,
    glowIntensity: 20,
    glowColor: '#d4af37',
    shadowIntensity: 40,
    shadowColor: '#000000',
    patternType: 'dots',
    imageSourceUrl: '',
    backgroundColor: '#0e2921',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.14)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#071712',
    iconContainerBackground: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 20,
    borderWidth: 1,
    paddingX: 24,
    paddingY: 24,
    gap: 18,
  },
  carousel: {
    ...DEFAULT_CAROUSEL_DATA,
    slides: DEFAULT_CAROUSEL_DATA.slides.map((s) => ({
      ...s,
      title: { ...s.title },
      description: { ...s.description },
      number: { ...s.number },
      percentage: { ...s.percentage },
      analysis: { ...s.analysis },
      actionLabel: { ...s.actionLabel },
      badge: { ...s.badge },
    })),
  },
};

export const CAROUSEL_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'carousel.slides',
    type: 'editable-text',
    section: 'content',
    label: 'إدارة الشرائح المستقلة (Slides)',
    targetKey: 'title',
  },
  {
    id: 'carousel.dimensions',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'أبعاد الكاروسيل المستقلة',
    targetKey: 'width',
  },
  {
    id: 'carousel.appearance',
    type: 'select',
    section: 'appearance',
    label: 'التخطيط والتنقل والتشغيل التلقائي',
    targetKey: 'materialType',
  },
];

export function ensureCarouselData(state: IndependentElementState): CarouselElementData {
  if (state.carousel && Array.isArray(state.carousel.slides) && state.carousel.slides.length > 0) {
    return state.carousel;
  }
  return {
    ...DEFAULT_CAROUSEL_DATA,
    slides: DEFAULT_CAROUSEL_DATA.slides.map((s) => ({
      ...s,
      title: { ...s.title },
      description: { ...s.description },
      number: { ...s.number },
      percentage: { ...s.percentage },
      analysis: { ...s.analysis },
      actionLabel: { ...s.actionLabel },
      badge: { ...s.badge },
    })),
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

function generateCarouselHtml(input: RenderInput): string {
  const { scopeId, state } = input;
  const carousel = ensureCarouselData(state);
  const safeActiveIdx = Math.min(
    Math.max(0, carousel.activeSlideIndex),
    Math.max(0, carousel.slides.length - 1)
  );

  const slidesMarkup = carousel.slides
    .map((slide, idx) => {
      const isActive = idx === safeActiveIdx;
      const badgeHtml = slide.badge.visible
        ? `<span class="beso-carousel__badge" data-slide-field="badge">${escapeHtml(slide.badge.value)}</span>`
        : '';
      const titleHtml = slide.title.visible
        ? `<h3 class="beso-carousel__title" data-slide-field="title">${escapeHtml(slide.title.value)}</h3>`
        : '';
      const descHtml = slide.description.visible
        ? `<p class="beso-carousel__desc" data-slide-field="description">${escapeHtml(slide.description.value)}</p>`
        : '';
      const numHtml = slide.number.visible
        ? `<strong class="beso-carousel__number" data-slide-field="number">${escapeHtml(slide.number.value)}</strong>`
        : '';
      const pctHtml = slide.percentage.visible
        ? `<span class="beso-carousel__percentage" data-slide-field="percentage">${escapeHtml(slide.percentage.value)}</span>`
        : '';
      const analysisHtml = slide.analysis.visible
        ? `<p class="beso-carousel__analysis" data-slide-field="analysis">${escapeHtml(slide.analysis.value)}</p>`
        : '';
      const actionHtml = slide.actionLabel.visible
        ? `<button type="button" class="beso-carousel__cta" data-slide-field="actionLabel">${escapeHtml(slide.actionLabel.value)}</button>`
        : '';

      return [
        `    <article class="beso-carousel__slide" data-slide-id="${escapeHtml(slide.id)}" data-slide-index="${idx}" data-active="${isActive}">`,
        `      <div class="beso-carousel__media">`,
        `        <img class="beso-carousel__img" src="${escapeHtml(slide.imageUrl)}" alt="${escapeHtml(slide.imageAlt || slide.title.value)}" />`,
        `      </div>`,
        `      <div class="beso-carousel__body">`,
        badgeHtml ? `        ${badgeHtml}` : '',
        titleHtml ? `        ${titleHtml}` : '',
        descHtml ? `        ${descHtml}` : '',
        numHtml || pctHtml
          ? `        <div class="beso-carousel__metrics">${numHtml}${pctHtml}</div>`
          : '',
        analysisHtml ? `        ${analysisHtml}` : '',
        actionHtml ? `        ${actionHtml}` : '',
        `      </div>`,
        `    </article>`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const arrowsHtml =
    carousel.showArrows && carousel.slides.length > 1
      ? [
          `  <div class="beso-carousel__arrows">`,
          `    <button type="button" class="beso-carousel__arrow" data-carousel-dir="prev" aria-label="الشريحة السابقة">‹</button>`,
          `    <button type="button" class="beso-carousel__arrow" data-carousel-dir="next" aria-label="الشريحة التالية">›</button>`,
          `  </div>`,
        ].join('\n')
      : '';

  const dotsHtml =
    carousel.showDots && carousel.slides.length > 1
      ? [
          `  <div class="beso-carousel__dots" role="tablist" aria-label="نقاط شرائح العرض">`,
          carousel.slides
            .map(
              (s, idx) =>
                `    <button type="button" class="beso-carousel__dot" data-carousel-dot="${idx}" data-active="${idx === safeActiveIdx}" aria-label="شريحة ${idx + 1}: ${escapeHtml(s.title.value)}"></button>`
            )
            .join('\n'),
          `  </div>`,
        ].join('\n')
      : '';

  return [
    `<section class="beso-carousel" dir="${carousel.direction}" data-element-scope="${scopeId}" data-carousel-layout="${carousel.layoutMode}" data-autoplay="${carousel.autoPlay}" data-interval="${carousel.intervalMs}" data-pause-on-hover="${carousel.pauseOnHover}">`,
    `  <div class="beso-carousel__viewport">`,
    slidesMarkup,
    `  </div>`,
    arrowsHtml,
    dotsHtml,
    `</section>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function generateCarouselCss(input: RenderInput): string {
  const { scopeId, state } = input;
  const carousel = ensureCarouselData(state);
  const { surface, dimensions } = state;
  const { widthCss, heightCss } = resolveDimensionCss(dimensions);
  const S = `[data-element-scope="${scopeId}"]`;

  const perSlideStyles = carousel.slides
    .map((slide, idx) => {
      const slideSel = `${S} .beso-carousel__slide[data-slide-index="${idx}"]`;
      return `${slideSel} .beso-carousel__title {
  color: ${slide.title.color};
  font-family: ${slide.title.fontFamily};
  font-size: ${slide.title.fontSize}px;
  font-weight: ${slide.title.fontWeight};
  margin: 0;
}
${slideSel} .beso-carousel__desc {
  color: ${slide.description.color};
  font-family: ${slide.description.fontFamily};
  font-size: ${slide.description.fontSize}px;
  margin: 0;
}
${slideSel} .beso-carousel__number {
  color: ${slide.number.color};
  font-family: ${slide.number.fontFamily};
  font-size: ${slide.number.fontSize}px;
  font-weight: ${slide.number.fontWeight};
}
${slideSel} .beso-carousel__percentage {
  color: ${slide.percentage.color};
  font-family: ${slide.percentage.fontFamily};
  font-size: ${slide.percentage.fontSize}px;
  font-weight: ${slide.percentage.fontWeight};
}
${slideSel} .beso-carousel__analysis {
  color: ${slide.analysis.color};
  font-family: ${slide.analysis.fontFamily};
  font-size: ${slide.analysis.fontSize}px;
  margin: 0;
}
${slideSel} .beso-carousel__badge {
  color: ${slide.badge.color};
  font-size: ${slide.badge.fontSize}px;
  font-weight: ${slide.badge.fontWeight};
}
${slideSel} .beso-carousel__cta {
  background: ${slide.actionBackgroundColor};
  color: ${slide.actionTextColor};
  font-family: ${slide.actionLabel.fontFamily};
  font-size: ${slide.actionLabel.fontSize}px;
  font-weight: ${slide.actionLabel.fontWeight};
}`;
    })
    .join('\n\n');

  const layoutSpecificCss =
    carousel.layoutMode === 'two-columns'
      ? `${S}[data-carousel-layout="two-columns"] .beso-carousel__slide[data-active="true"] {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: center;
  gap: ${surface.gap}px;
}`
      : carousel.layoutMode === 'cards-3d'
        ? `${S}[data-carousel-layout="cards-3d"] .beso-carousel__viewport {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  perspective: 900px;
}
${S}[data-carousel-layout="cards-3d"] .beso-carousel__slide {
  display: flex !important;
  flex-direction: column;
  opacity: 0.72;
  transform: scale(0.95) rotateY(-4deg);
  transition: all 0.28s ease;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid ${surface.borderColor};
  background: rgba(255, 255, 255, 0.03);
}
${S}[data-carousel-layout="cards-3d"] .beso-carousel__slide[data-active="true"] {
  opacity: 1;
  transform: scale(1) rotateY(0deg);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
}`
        : `${S}[data-carousel-layout="single"] .beso-carousel__slide[data-active="true"] {
  display: flex;
  flex-direction: column;
  gap: ${surface.gap}px;
}`;

  return `${S}.beso-carousel {
  width: ${widthCss};
  height: ${heightCss};
  max-width: 100%;
  padding: ${surface.paddingY}px ${surface.paddingX}px;
  border-radius: ${surface.borderRadius}px;
  border: ${surface.borderWidth}px solid ${surface.borderColor};
  background: linear-gradient(${surface.gradientDirection}, ${surface.primaryColor} 0%, ${surface.secondaryColor} 100%);
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${surface.gap}px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

${S} .beso-carousel__slide {
  display: none;
  gap: 14px;
}

${layoutSpecificCss}

${S} .beso-carousel__media {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
}

${S} .beso-carousel__img {
  width: 100%;
  height: 190px;
  object-fit: cover;
  display: block;
}

${S} .beso-carousel__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

${S} .beso-carousel__badge {
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${surface.badgeBackgroundColor};
}

${S} .beso-carousel__metrics {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

${S} .beso-carousel__cta {
  align-self: flex-start;
  border: none;
  border-radius: 10px;
  padding: 9px 18px;
  cursor: pointer;
}

${S} .beso-carousel__arrows {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

${S} .beso-carousel__arrow {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${surface.borderColor};
  background: ${carousel.arrowBackgroundColor};
  color: ${carousel.arrowColor};
  font-size: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

${S} .beso-carousel__dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

${S} .beso-carousel__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: none;
  background: ${carousel.dotColor};
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

${S} .beso-carousel__dot[data-active="true"] {
  width: 26px;
  background: ${carousel.activeDotColor};
}

${perSlideStyles}`;
}

/**
 * Generates minimal vanilla JavaScript for Carousel navigation ONLY when needed.
 */
export function generateCarouselJsIfNeeded(input: RenderInput): string | undefined {
  const carousel = ensureCarouselData(input.state);
  const needsJs =
    carousel.slides.length > 1 &&
    (carousel.showArrows || carousel.showDots || carousel.autoPlay);

  if (!needsJs) {
    return undefined;
  }

  return `(function() {
  var root = document.querySelector('[data-element-scope="${input.scopeId}"]');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.beso-carousel__slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.beso-carousel__dot'));
  if (slides.length <= 1) return;
  var current = ${Math.min(Math.max(0, carousel.activeSlideIndex), carousel.slides.length - 1)};
  var paused = false;
  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function(el, i) { el.setAttribute('data-active', String(i === current)); });
    dots.forEach(function(el, i) { el.setAttribute('data-active', String(i === current)); });
  }
  var prevBtn = root.querySelector('[data-carousel-dir="prev"]');
  var nextBtn = root.querySelector('[data-carousel-dir="next"]');
  if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); });
  dots.forEach(function(dot, idx) { dot.addEventListener('click', function() { goTo(idx); }); });
  ${
    carousel.pauseOnHover
      ? `root.addEventListener('mouseenter', function() { paused = true; });
  root.addEventListener('mouseleave', function() { paused = false; });`
      : ''
  }
  ${
    carousel.autoPlay
      ? `setInterval(function() { if (!paused) goTo(current + 1); }, ${Math.max(800, carousel.intervalMs)});`
      : ''
  }
})();`;
}

function sanitizeCarouselState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(CAROUSEL_DEFAULT_STATE);
  }
  return cloneElementState({
    ...CAROUSEL_DEFAULT_STATE,
    ...(raw as Partial<IndependentElementState>),
  });
}

function validateCarouselState(state: IndependentElementState): ValidationResult {
  return validateIndependentElementState(state);
}

function renderCarouselPreview(input: RenderInput): PreviewResult {
  const html = generateCarouselHtml(input);
  const css = generateCarouselCss(input);
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

function generateCarouselExportBundle(input: RenderInput): ExportBundle {
  const html = generateCarouselHtml(input);
  const css = generateCarouselCss(input);
  const js = generateCarouselJsIfNeeded(input);
  const validation = validateCarouselState(input.state);

  return createExportBundle({
    elementId: CAROUSEL_ELEMENT_ID,
    elementType: CAROUSEL_ELEMENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    ...(js ? { js } : {}),
    stateValidationErrors: validation.errors,
  });
}

export const carouselModule: ElementModule = {
  id: CAROUSEL_ELEMENT_ID,
  type: CAROUSEL_ELEMENT_ID,
  version: 1,
  family: 'media',
  label: 'عارض الشرائح المتقدم (Carousel)',
  description:
    'عنصر شرائح إنتاجي مستقل يدعم قائمة شرائح معزولة النصوص والصور، تخطيطات (Single / Two-Columns / 3D)، الأسهم، النقاط، والتشغيل التلقائي.',
  metadata: {
    label: 'عارض الشرائح المتقدم (Carousel)',
    description:
      'عنصر شرائح إنتاجي مستقل يدعم قائمة شرائح معزولة النصوص والصور، تخطيطات (Single / Two-Columns / 3D)، الأسهم، النقاط، والتشغيل التلقائي.',
    family: 'media',
    category: 'media-showcase',
    tags: ['carousel', 'slider', 'gallery', 'image-switcher', 'شرائح', 'معرض صور'],
    originGroup: 'native',
    sortOrder: 10,
    categories: ['media-showcase', 'media'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: true,
    usesJavaScript: true,
    supportsSlots: false,
  },
  defaultState: CAROUSEL_DEFAULT_STATE,
  controlSchema: CAROUSEL_CONTROL_SCHEMA,
  sanitizeState: sanitizeCarouselState,
  validate: validateCarouselState,
  generateHtml: generateCarouselHtml,
  generateCss: generateCarouselCss,
  renderPreview: renderCarouselPreview,
  generateCode: generateCarouselExportBundle,
};

export const carouselRegistration: RegisteredElementEntry = {
  id: CAROUSEL_ELEMENT_ID,
  family: 'media',
  category: 'media-showcase',
  tags: ['carousel', 'slider', 'gallery', 'image-switcher', 'شرائح', 'معرض صور'],
  originGroup: 'native',
  sortOrder: 10,
  categories: ['media-showcase', 'media'],
  status: 'stable',
  module: carouselModule,
};
