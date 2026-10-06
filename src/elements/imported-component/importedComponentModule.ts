/**
 * Beso Studio V2 — Imported Component Element Module ('imported-component')
 *
 * Implements the Imported Component Architecture:
 * - Preserves `source.html` and `source.css` verbatim as entered by the user without mutation.
 * - Stores `overrides` (general customizations: width, height, spacing, colors, fonts, borders,
 *   shadows, border-radius) and `mapping` (Root, Title, Description, Action, Image, Icon)
 *   in a strictly independent layer.
 * - Renders live preview strictly inside an isolated `<iframe sandbox="" srcdoc="...">`
 *   so imported CSS can NEVER leak into or affect the Studio Shell, Card, Button, or PreviewStage.
 * - Disallows external/inline JavaScript execution in this phase (strips <script> & inline on* in output
 *   while keeping `source.html` untouched in state).
 * - Analyzes and exports detailed `warnings` for:
 *   1. External links (`EXTERNAL_LINK`)
 *   2. Global CSS selectors (`GLOBAL_SELECTOR`)
 *   3. `@import` rules (`CSS_AT_IMPORT`)
 *   4. `@keyframes` rules (`CSS_AT_KEYFRAMES`)
 *   5. External images (`EXTERNAL_IMAGE`)
 *   6. External fonts (`EXTERNAL_FONT`)
 *   7. External/inline JavaScript (`EXTERNAL_OR_INLINE_JS`)
 */

import { ControlDefinition } from '../../core/controls/controlTypes';
import { createExportBundle, ExportBundle, ExportWarning } from '../../core/export/exportBundle';
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
  ImportedComponentData,
  ImportedComponentOverrides,
  ImportedMappedTargetOverrides,
  ImportedSelectorMapping,
  ImportedSourceCode,
} from '../../core/state/elementStateTypes';
import {
  validateIndependentElementState,
  ValidationIssue,
  ValidationResult,
} from '../../core/validation/validator';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';

const DEFAULT_ARABIC_FONT = AVAILABLE_FONTS[0].cssValue;

export const IMPORTED_COMPONENT_ID = 'imported-component';

export type ImportedWarningCategory =
  | 'EXTERNAL_LINK'
  | 'GLOBAL_SELECTOR'
  | 'CSS_AT_IMPORT'
  | 'CSS_AT_KEYFRAMES'
  | 'EXTERNAL_IMAGE'
  | 'EXTERNAL_FONT'
  | 'EXTERNAL_OR_INLINE_JS';

export interface ImportedWarningItem extends ExportWarning {
  code: ImportedWarningCategory;
  categoryLabelAr: string;
  matchSnippet: string;
}

export const DEFAULT_IMPORTED_SOURCE_HTML = `<article class="ext-widget">
  <div class="ext-widget__header">
    <span class="ext-widget__icon">✦</span>
    <span class="ext-widget__tag">مكون خارجي مستورد</span>
  </div>
  <img
    class="ext-widget__img"
    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='140' viewBox='0 0 480 140'><rect width='480' height='140' rx='12' fill='%230d261f'/><circle cx='70' cy='70' r='36' fill='%23d4af37' fill-opacity='0.22'/><path d='M52 70 L66 84 L92 56' stroke='%23d4af37' stroke-width='4' fill='none' stroke-linecap='round'/></svg>"
    alt="صورة المكون المستورد"
  />
  <h3 class="ext-widget__title">بطاقة عنصر خارجي قابلة للتخصيص</h3>
  <p class="ext-widget__desc">
    يتم حفظ الكود الأصلي (source.html و source.css) كما أدخله المستخدم دون أي تعديل، بينما تطبق التخصيصات في طبقة overrides مستقلة داخل iframe معزول.
  </p>
  <button type="button" class="ext-widget__action">استكشاف التفاصيل</button>
</article>`;

export const DEFAULT_IMPORTED_SOURCE_CSS = `.ext-widget {
  background: linear-gradient(145deg, #102820 0%, #091713 100%);
  color: #f4f7f5;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28);
}

.ext-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ext-widget__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(212, 175, 55, 0.14);
  color: #d4af37;
  font-size: 20px;
}

.ext-widget__tag {
  font-size: 12px;
  font-weight: 700;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.12);
  padding: 4px 10px;
  border-radius: 999px;
}

.ext-widget__img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ext-widget__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
}

.ext-widget__desc {
  margin: 0;
  font-size: 14px;
  color: #b7ccc4;
  line-height: 1.65;
}

.ext-widget__action {
  align-self: flex-start;
  background: #d4af37;
  color: #091713;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}`;

export const DEFAULT_IMPORTED_MAPPED_OVERRIDES: ImportedMappedTargetOverrides = {
  titleColor: '',
  titleFontSize: null,
  titleFontWeight: null,
  descriptionColor: '',
  descriptionFontSize: null,
  descriptionLineHeight: null,
  actionBackgroundColor: '',
  actionTextColor: '',
  actionBorderRadius: null,
  actionPaddingX: null,
  actionPaddingY: null,
  imageBorderRadius: null,
  imageMaxHeight: null,
  iconColor: '',
  iconSize: null,
};

export const DEFAULT_IMPORTED_OVERRIDES: ImportedComponentOverrides = {
  width: 480,
  widthUnit: 'px',
  height: 'auto',
  heightUnit: 'auto',
  paddingX: null,
  paddingY: null,
  margin: null,
  gap: null,
  backgroundColor: '',
  textColor: '',
  accentColor: '',
  fontFamily: '',
  fontSize: null,
  fontWeight: null,
  lineHeight: null,
  textAlign: '',
  borderWidth: null,
  borderStyle: '',
  borderColor: '',
  boxShadow: '',
  borderRadius: null,
  mapped: { ...DEFAULT_IMPORTED_MAPPED_OVERRIDES },
};

export const DEFAULT_IMPORTED_MAPPING: ImportedSelectorMapping = {
  root: '.ext-widget',
  title: '.ext-widget__title',
  description: '.ext-widget__desc',
  action: '.ext-widget__action',
  image: '.ext-widget__img',
  icon: '.ext-widget__icon',
};

export function createDefaultImportedComponentData(): ImportedComponentData {
  return {
    source: {
      html: DEFAULT_IMPORTED_SOURCE_HTML,
      css: DEFAULT_IMPORTED_SOURCE_CSS,
    },
    initialSource: {
      html: DEFAULT_IMPORTED_SOURCE_HTML,
      css: DEFAULT_IMPORTED_SOURCE_CSS,
    },
    overrides: {
      ...DEFAULT_IMPORTED_OVERRIDES,
      mapped: { ...DEFAULT_IMPORTED_MAPPED_OVERRIDES },
    },
    mapping: {
      ...DEFAULT_IMPORTED_MAPPING,
    },
  };
}

export const IMPORTED_COMPONENT_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'بطاقة عنصر خارجي قابلة للتخصيص',
      visible: true,
      color: '#ffffff',
      fontFamily: DEFAULT_ARABIC_FONT,
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'start',
    },
    description: {
      value: 'مكون خارجي مستورد بمعاينة iframe معزولة.',
      visible: true,
      color: '#b7ccc4',
      fontFamily: DEFAULT_ARABIC_FONT,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.65,
      letterSpacing: 0,
      align: 'start',
    },
    number: {
      value: '100%',
      visible: false,
      color: '#d4af37',
      fontFamily: DEFAULT_ARABIC_FONT,
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
    },
    percentage: {
      value: '0%',
      visible: false,
      color: '#34d399',
      fontFamily: DEFAULT_ARABIC_FONT,
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 0,
      align: 'start',
    },
    analysis: {
      value: 'طبقة overrides مستقلة',
      visible: false,
      color: '#9ec5b8',
      fontFamily: DEFAULT_ARABIC_FONT,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
      align: 'start',
    },
    actionLabel: {
      value: 'استكشاف التفاصيل',
      visible: true,
      color: '#091713',
      fontFamily: DEFAULT_ARABIC_FONT,
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
    },
    badge: {
      value: 'مكون خارجي مستورد',
      visible: true,
      color: '#d4af37',
      fontFamily: DEFAULT_ARABIC_FONT,
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
    value: '✦',
    color: '#d4af37',
    size: 20,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 480,
    height: 'auto',
    minWidth: 220,
    maxWidth: 1200,
    minHeight: 120,
    maxHeight: 'none',
    widthUnit: 'px',
    heightUnit: 'auto',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'gradient',
    primaryColor: '#102820',
    secondaryColor: '#091713',
    gradientDirection: '135deg',
    opacity: 100,
    glassBlur: 14,
    glowIntensity: 0,
    glowColor: '#d4af37',
    shadowIntensity: 35,
    shadowColor: '#000000',
    patternType: 'dots',
    imageSourceUrl: '',
    backgroundColor: '#102820',
    borderColor: '#d4af37',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.12)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#091713',
    iconContainerBackground: 'rgba(212, 175, 55, 0.14)',
    borderRadius: 18,
    borderWidth: 1,
    paddingX: 22,
    paddingY: 22,
    gap: 14,
  },
  imported: createDefaultImportedComponentData(),
};

export const IMPORTED_COMPONENT_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'imported.source.html',
    type: 'text',
    section: 'content',
    label: 'محرر كود HTML المستورد (source.html)',
    description: 'يحفظ كود HTML كما أدخله المستخدم دون أي تعديل.',
    targetKey: 'title',
  },
  {
    id: 'imported.source.css',
    type: 'text',
    section: 'content',
    label: 'محرر كود CSS المستورد (source.css)',
    description: 'يحفظ كود CSS الأصلي كما أدخله المستخدم دون أي تعديل.',
    targetKey: 'description',
  },
  {
    id: 'imported.overrides',
    type: 'dimension-config',
    section: 'appearance',
    label: 'طبقة التخصيصات المستقلة (Overrides Layer)',
    description: 'العرض، الارتفاع، المسافات، الألوان، الخطوط، الحدود، الظلال، والاستدارة.',
    targetKey: 'width',
  },
  {
    id: 'imported.mapping',
    type: 'icon-config',
    section: 'icon',
    label: 'ربط المحددات الاختياري (Manual Selector Mapping)',
    description: 'ربط اختياري يدوي للمحددات: Root, Title, Description, Action, Image, Icon.',
    targetKey: 'value',
  },
];

/**
 * Strips any <script> tags, inline on* event handlers, and javascript: URIs
 * when rendering inside the isolated iframe or exporting HTML.
 * Note: Never mutates `state.imported.source.html`.
 */
export function stripJavaScriptFromHtml(rawHtml: string): string {
  if (!rawHtml) {
    return '';
  }

  return rawHtml
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src|action)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitizes a user-supplied CSS selector for safe rule generation in the overrides layer.
 */
export function sanitizeManualSelector(rawSelector: string): string {
  if (!rawSelector || typeof rawSelector !== 'string') {
    return '';
  }
  const cleaned = rawSelector.replace(/[{};<>]/g, '').trim();
  return cleaned;
}

/**
 * Static analyzer that inspects `source.html` and `source.css` without executing user code
 * and returns warnings for:
 * 1. External links (`EXTERNAL_LINK`)
 * 2. Global selectors (`GLOBAL_SELECTOR`)
 * 3. `@import` rules (`CSS_AT_IMPORT`)
 * 4. `@keyframes` rules (`CSS_AT_KEYFRAMES`)
 * 5. External images (`EXTERNAL_IMAGE`)
 * 6. External fonts (`EXTERNAL_FONT`)
 * 7. External/inline JavaScript (`EXTERNAL_OR_INLINE_JS`)
 */
export function analyzeImportedComponentWarnings(
  sourceHtml: string,
  sourceCss: string
): ImportedWarningItem[] {
  const warnings: ImportedWarningItem[] = [];
  const html = sourceHtml || '';
  const css = sourceCss || '';

  // 1. External Links in HTML (<a href="http...">, <link href="http...">, etc.)
  const externalLinkRegex = /<(?:a|link|area|form)\b[^>]*?\b(?:href|action)\s*=\s*["']((?:https?:)?\/\/[^"']+)["'][^>]*>/gi;
  let linkMatch: RegExpExecArray | null = externalLinkRegex.exec(html);
  while (linkMatch !== null) {
    const url = linkMatch[1];
    const isFontUrl =
      /fonts\.googleapis\.com|fonts\.gstatic\.com|\.(?:woff2?|ttf|otf)(?:\?|$)/i.test(url);
    if (isFontUrl) {
      warnings.push({
        code: 'EXTERNAL_FONT',
        categoryLabelAr: 'خط خارجي',
        matchSnippet: url,
        message: `تم رصد رابط خط خارجي في HTML (${url}). قد يتأثر التحميل أو الخصوصية عند التصدير.`,
      });
    } else {
      warnings.push({
        code: 'EXTERNAL_LINK',
        categoryLabelAr: 'رابط خارجي',
        matchSnippet: url,
        message: `تم رصد رابط خارجي (${url}) داخل كود HTML المستورد.`,
      });
    }
    linkMatch = externalLinkRegex.exec(html);
  }

  // 2. External Images in HTML (<img src="http..."> or srcset="http...")
  const externalImgRegex = /<(?:img|source)\b[^>]*?\b(?:src|srcset)\s*=\s*["']([^"']*(?:https?:)?\/\/[^"']+)["'][^>]*>/gi;
  let imgMatch: RegExpExecArray | null = externalImgRegex.exec(html);
  while (imgMatch !== null) {
    const url = imgMatch[1].trim();
    warnings.push({
      code: 'EXTERNAL_IMAGE',
      categoryLabelAr: 'صورة خارجية',
      matchSnippet: url,
      message: `تم رصد صورة خارجية في HTML (${url}). يفضل استخدام أصول محلية أو Data URI لضمان الثبات.`,
    });
    imgMatch = externalImgRegex.exec(html);
  }

  // 3. External or Inline JavaScript in HTML
  if (
    /<script\b/i.test(html) ||
    /\son[a-z]+\s*=/i.test(html) ||
    /javascript:/i.test(html)
  ) {
    warnings.push({
      code: 'EXTERNAL_OR_INLINE_JS',
      categoryLabelAr: 'كود JavaScript غير مدعوم',
      matchSnippet: '<script> / on*=',
      message:
        'تم رصد كود JavaScript داخل HTML المستورد. لا يُدعم تشغيل JavaScript الخارجي في هذه المرحلة ويتم تعطيله في المعاينة والتصدير.',
    });
  }

  // Strip comments from CSS before analyzing rules
  const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // 4. @import in CSS
  const importRegex = /@import\s+(?:url\()?['"]?([^'");\s]+)['"]?\)?[^;]*;?/gi;
  let importMatch: RegExpExecArray | null = importRegex.exec(cssWithoutComments);
  while (importMatch !== null) {
    const target = importMatch[1] || importMatch[0].trim();
    warnings.push({
      code: 'CSS_AT_IMPORT',
      categoryLabelAr: 'قاعدة @import',
      matchSnippet: importMatch[0].trim(),
      message: `تم رصد قاعدة @import في CSS (${target}). قد تبطئ التحميل أو تستدعي ملفات خارجية.`,
    });
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com|font/i.test(target)) {
      warnings.push({
        code: 'EXTERNAL_FONT',
        categoryLabelAr: 'خط خارجي',
        matchSnippet: target,
        message: `تم رصد استيراد خط خارجي عبر @import (${target}).`,
      });
    }
    importMatch = importRegex.exec(cssWithoutComments);
  }

  // 5. @keyframes in CSS
  const keyframesRegex = /@(?:-webkit-)?keyframes\s+([a-zA-Z0-9_-]+)/gi;
  let kfMatch: RegExpExecArray | null = keyframesRegex.exec(cssWithoutComments);
  while (kfMatch !== null) {
    const kfName = kfMatch[1];
    warnings.push({
      code: 'CSS_AT_KEYFRAMES',
      categoryLabelAr: 'حركة @keyframes',
      matchSnippet: `@keyframes ${kfName}`,
      message: `تم رصد تعريف حركة عامة (@keyframes ${kfName}). أسماء @keyframes تكون مشتركة في نطاق الصفحة عند التصدير.`,
    });
    kfMatch = keyframesRegex.exec(cssWithoutComments);
  }

  // 6. External URLs in CSS (images or fonts via url("http..."))
  const cssUrlRegex = /url\(\s*['"]?((?:https?:)?\/\/[^'")\s]+)['"]?\s*\)/gi;
  let urlMatch: RegExpExecArray | null = cssUrlRegex.exec(cssWithoutComments);
  while (urlMatch !== null) {
    const url = urlMatch[1];
    const isFontAsset = /\.(?:woff2?|ttf|otf|eot)(?:\?|$|#)|fonts\.gstatic\.com|fonts\.googleapis\.com/i.test(
      url
    );
    if (isFontAsset) {
      warnings.push({
        code: 'EXTERNAL_FONT',
        categoryLabelAr: 'خط خارجي',
        matchSnippet: url,
        message: `تم رصد ملف خط خارجي داخل CSS (${url}).`,
      });
    } else {
      warnings.push({
        code: 'EXTERNAL_IMAGE',
        categoryLabelAr: 'صورة خارجية',
        matchSnippet: url,
        message: `تم رصد رابط صورة أو مورد خارجي داخل CSS (${url}).`,
      });
    }
    urlMatch = cssUrlRegex.exec(cssWithoutComments);
  }

  // 7. Global CSS selectors (html, body, :root, *, or bare HTML element selectors)
  const cssWithoutAtBlocks = cssWithoutComments
    .replace(/@import[^;]+;/gi, '')
    .replace(/@(?:-webkit-)?keyframes\s+[a-zA-Z0-9_-]+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gi, '');

  const ruleHeaderRegex = /([^{}]+)\{/g;
  const globalTags = new Set([
    'html',
    'body',
    ':root',
    '*',
    'div',
    'span',
    'p',
    'a',
    'button',
    'input',
    'textarea',
    'select',
    'img',
    'svg',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'section',
    'article',
    'header',
    'footer',
    'main',
    'nav',
    'aside',
    'table',
    'tr',
    'td',
    'th',
    'form',
    'label',
  ]);

  const reportedGlobalSelectors = new Set<string>();
  let ruleMatch: RegExpExecArray | null = ruleHeaderRegex.exec(cssWithoutAtBlocks);
  while (ruleMatch !== null) {
    const rawPrelude = ruleMatch[1].trim();
    if (rawPrelude && !rawPrelude.startsWith('@')) {
      const selectorParts = rawPrelude.split(',').map((s) => s.trim()).filter(Boolean);
      for (const sel of selectorParts) {
        const normalized = sel.replace(/::?[a-zA-Z-]+(?:\([^)]*\))?/g, '').trim().toLowerCase();
        const isUniversalOrRoot =
          sel === '*' ||
          sel.startsWith('* ') ||
          normalized === 'html' ||
          normalized === 'body' ||
          normalized === ':root' ||
          sel.toLowerCase().includes(':root');
        const isBareTagSelector = globalTags.has(normalized);

        if ((isUniversalOrRoot || isBareTagSelector) && !reportedGlobalSelectors.has(sel)) {
          reportedGlobalSelectors.add(sel);
          warnings.push({
            code: 'GLOBAL_SELECTOR',
            categoryLabelAr: 'محدد CSS عام (Global Selector)',
            matchSnippet: sel,
            message: `تم رصد محدد CSS عام غير مخصص بفئة (${sel}). قد يؤثر على عناصر أخرى خارج المكون عند التصدير المباشر.`,
          });
        }
      }
    }
    ruleMatch = ruleHeaderRegex.exec(cssWithoutAtBlocks);
  }

  return warnings;
}

export function resolveDimensionValueCss(
  value: number | 'auto',
  unit: 'px' | '%' | 'vw' | 'vh' | 'auto'
): string {
  if (value === 'auto' || unit === 'auto') {
    return 'auto';
  }
  return `${value}${unit}`;
}

/**
 * Scopes raw user CSS under `[data-element-scope="<scopeId>"]` for safe export,
 * while keeping `@keyframes` and `@import` valid.
 */
export function scopeImportedSourceCss(scopeSelector: string, rawCss: string): string {
  if (!rawCss || !rawCss.trim()) {
    return `${scopeSelector} {\n  box-sizing: border-box;\n}`;
  }

  // Prefix standard CSS selector blocks with scopeSelector
  const scoped = rawCss.replace(
    /(^|\}|\n)\s*([^@{}\n][^{}]*?)\s*\{/g,
    (fullMatch, prefix: string, selectorGroup: string) => {
      const trimmedGroup = selectorGroup.trim();
      if (!trimmedGroup || trimmedGroup.startsWith('/*') || /^(from|to|\d+%)$/i.test(trimmedGroup)) {
        return fullMatch;
      }
      const mappedSelectors = trimmedGroup
        .split(',')
        .map((sel) => {
          const s = sel.trim();
          if (!s) return '';
          if (s === ':root' || s === 'html' || s === 'body') {
            return scopeSelector;
          }
          if (s.startsWith(scopeSelector)) {
            return s;
          }
          return `${scopeSelector} ${s}`;
        })
        .filter(Boolean)
        .join(', ');

      return `${prefix}\n${mappedSelectors} {`;
    }
  );

  return `${scopeSelector} {\n  box-sizing: border-box;\n}\n${scoped}`;
}

/**
 * Generates the independent CSS overrides layer from `state.imported.overrides` and `state.imported.mapping`.
 * Never alters `source.html` or `source.css`.
 */
export function generateImportedOverridesCss(
  scopeSelector: string,
  imported: ImportedComponentData
): string {
  const { overrides, mapping } = imported;
  const rules: string[] = [];

  const rootSel = sanitizeManualSelector(mapping.root);
  const rootTarget = rootSel
    ? `${scopeSelector} ${rootSel}, ${scopeSelector} .beso-imported-root > ${rootSel}`
    : `${scopeSelector} .beso-imported-root > *:first-child, ${scopeSelector} .beso-imported-root`;

  const generalProps: string[] = [];

  if (overrides.width !== 'auto' && overrides.widthUnit !== 'auto') {
    generalProps.push(`  width: ${overrides.width}${overrides.widthUnit} !important;`);
    generalProps.push(`  max-width: 100%;`);
  }
  if (overrides.height !== 'auto' && overrides.heightUnit !== 'auto') {
    generalProps.push(`  height: ${overrides.height}${overrides.heightUnit} !important;`);
  }
  if (typeof overrides.paddingX === 'number' || typeof overrides.paddingY === 'number') {
    const py = typeof overrides.paddingY === 'number' ? `${overrides.paddingY}px` : 'initial';
    const px = typeof overrides.paddingX === 'number' ? `${overrides.paddingX}px` : 'initial';
    if (typeof overrides.paddingX === 'number' && typeof overrides.paddingY === 'number') {
      generalProps.push(`  padding: ${py} ${px} !important;`);
    } else if (typeof overrides.paddingX === 'number') {
      generalProps.push(`  padding-inline: ${px} !important;`);
    } else if (typeof overrides.paddingY === 'number') {
      generalProps.push(`  padding-block: ${py} !important;`);
    }
  }
  if (typeof overrides.margin === 'number') {
    generalProps.push(`  margin: ${overrides.margin}px !important;`);
  }
  if (typeof overrides.gap === 'number') {
    generalProps.push(`  gap: ${overrides.gap}px !important;`);
  }
  if (overrides.backgroundColor) {
    generalProps.push(`  background: ${overrides.backgroundColor} !important;`);
  }
  if (overrides.textColor) {
    generalProps.push(`  color: ${overrides.textColor} !important;`);
  }
  if (overrides.accentColor) {
    generalProps.push(`  --imported-accent-color: ${overrides.accentColor};`);
  }
  if (overrides.fontFamily) {
    generalProps.push(`  font-family: ${overrides.fontFamily} !important;`);
  }
  if (typeof overrides.fontSize === 'number') {
    generalProps.push(`  font-size: ${overrides.fontSize}px !important;`);
  }
  if (typeof overrides.fontWeight === 'number') {
    generalProps.push(`  font-weight: ${overrides.fontWeight} !important;`);
  }
  if (typeof overrides.lineHeight === 'number') {
    generalProps.push(`  line-height: ${overrides.lineHeight} !important;`);
  }
  if (overrides.textAlign) {
    generalProps.push(`  text-align: ${overrides.textAlign} !important;`);
  }
  if (
    typeof overrides.borderWidth === 'number' ||
    overrides.borderStyle ||
    overrides.borderColor
  ) {
    if (overrides.borderStyle === 'none') {
      generalProps.push(`  border: none !important;`);
    } else {
      const bw = typeof overrides.borderWidth === 'number' ? `${overrides.borderWidth}px` : '1px';
      const bs = overrides.borderStyle || 'solid';
      const bc = overrides.borderColor || 'currentColor';
      generalProps.push(`  border: ${bw} ${bs} ${bc} !important;`);
    }
  }
  if (overrides.boxShadow) {
    generalProps.push(`  box-shadow: ${overrides.boxShadow} !important;`);
  }
  if (typeof overrides.borderRadius === 'number') {
    generalProps.push(`  border-radius: ${overrides.borderRadius}px !important;`);
  }

  if (generalProps.length > 0) {
    rules.push(`${rootTarget} {\n${generalProps.join('\n')}\n}`);
  }

  // Optional Mapped Selectors Overrides (Title, Description, Action, Image, Icon)
  const { mapped } = overrides;

  const titleSel = sanitizeManualSelector(mapping.title);
  if (titleSel) {
    const titleProps: string[] = [];
    if (mapped.titleColor) {
      titleProps.push(`  color: ${mapped.titleColor} !important;`);
    }
    if (typeof mapped.titleFontSize === 'number') {
      titleProps.push(`  font-size: ${mapped.titleFontSize}px !important;`);
    }
    if (typeof mapped.titleFontWeight === 'number') {
      titleProps.push(`  font-weight: ${mapped.titleFontWeight} !important;`);
    }
    if (titleProps.length > 0) {
      rules.push(`${scopeSelector} ${titleSel} {\n${titleProps.join('\n')}\n}`);
    }
  }

  const descSel = sanitizeManualSelector(mapping.description);
  if (descSel) {
    const descProps: string[] = [];
    if (mapped.descriptionColor) {
      descProps.push(`  color: ${mapped.descriptionColor} !important;`);
    }
    if (typeof mapped.descriptionFontSize === 'number') {
      descProps.push(`  font-size: ${mapped.descriptionFontSize}px !important;`);
    }
    if (typeof mapped.descriptionLineHeight === 'number') {
      descProps.push(`  line-height: ${mapped.descriptionLineHeight} !important;`);
    }
    if (descProps.length > 0) {
      rules.push(`${scopeSelector} ${descSel} {\n${descProps.join('\n')}\n}`);
    }
  }

  const actionSel = sanitizeManualSelector(mapping.action);
  if (actionSel) {
    const actionProps: string[] = [];
    if (mapped.actionBackgroundColor) {
      actionProps.push(`  background: ${mapped.actionBackgroundColor} !important;`);
    } else if (overrides.accentColor) {
      actionProps.push(`  background: ${overrides.accentColor} !important;`);
    }
    if (mapped.actionTextColor) {
      actionProps.push(`  color: ${mapped.actionTextColor} !important;`);
    }
    if (typeof mapped.actionBorderRadius === 'number') {
      actionProps.push(`  border-radius: ${mapped.actionBorderRadius}px !important;`);
    }
    if (typeof mapped.actionPaddingX === 'number') {
      actionProps.push(`  padding-inline: ${mapped.actionPaddingX}px !important;`);
    }
    if (typeof mapped.actionPaddingY === 'number') {
      actionProps.push(`  padding-block: ${mapped.actionPaddingY}px !important;`);
    }
    if (actionProps.length > 0) {
      rules.push(`${scopeSelector} ${actionSel} {\n${actionProps.join('\n')}\n}`);
    }
  }

  const imageSel = sanitizeManualSelector(mapping.image);
  if (imageSel) {
    const imgProps: string[] = [];
    if (typeof mapped.imageBorderRadius === 'number') {
      imgProps.push(`  border-radius: ${mapped.imageBorderRadius}px !important;`);
    }
    if (typeof mapped.imageMaxHeight === 'number') {
      imgProps.push(`  max-height: ${mapped.imageMaxHeight}px !important;`);
    }
    if (imgProps.length > 0) {
      rules.push(`${scopeSelector} ${imageSel} {\n${imgProps.join('\n')}\n}`);
    }
  }

  const iconSel = sanitizeManualSelector(mapping.icon);
  if (iconSel) {
    const iconProps: string[] = [];
    if (mapped.iconColor) {
      iconProps.push(`  color: ${mapped.iconColor} !important;`);
    } else if (overrides.accentColor) {
      iconProps.push(`  color: ${overrides.accentColor} !important;`);
    }
    if (typeof mapped.iconSize === 'number') {
      iconProps.push(`  font-size: ${mapped.iconSize}px !important;`);
    }
    if (iconProps.length > 0) {
      rules.push(`${scopeSelector} ${iconSel} {\n${iconProps.join('\n')}\n}`);
    }
  }

  return rules.join('\n\n');
}

export function ensureImportedData(state: IndependentElementState): ImportedComponentData {
  if (state.imported) {
    return state.imported;
  }
  return createDefaultImportedComponentData();
}

/**
 * Builds the isolated HTML5 document injected into `<iframe sandbox="" srcdoc="...">`.
 * Enforces `script-src 'none'` CSP and strips all `<script>` tags and inline JS handlers.
 */
export function buildImportedIframeSrcDoc(input: RenderInput): string {
  const { scopeId, state } = input;
  const imported = ensureImportedData(state);
  const scopeSelector = `[data-element-scope="${scopeId}"]`;
  const cleanHtml = stripJavaScriptFromHtml(imported.source.html);
  const overridesCss = generateImportedOverridesCss(scopeSelector, imported);

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none';" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 12px;
      min-height: 100%;
      background: transparent;
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .beso-imported-component {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .beso-imported-root {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    /* === [1] Source CSS (المصدر الأصلي داخل البيئة المعزولة) === */
${imported.source.css}

    /* === [2] Independent Overrides Layer (طبقة التخصيصات المستقلة) === */
${overridesCss}
  </style>
</head>
<body>
  <div class="beso-imported-component" data-element-scope="${scopeId}" data-imported-component="true">
    <div class="beso-imported-root">
${cleanHtml}
    </div>
  </div>
</body>
</html>`;
}

function sanitizeImportedState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(IMPORTED_COMPONENT_DEFAULT_STATE);
  }
  const candidate = raw as Partial<IndependentElementState>;
  const fallback = cloneElementState(IMPORTED_COMPONENT_DEFAULT_STATE);
  const fallbackImported = createDefaultImportedComponentData();

  const rawImported = candidate.imported;
  const sanitizedImported: ImportedComponentData = rawImported
    ? {
        source: {
          html:
            typeof rawImported.source?.html === 'string'
              ? rawImported.source.html
              : fallbackImported.source.html,
          css:
            typeof rawImported.source?.css === 'string'
              ? rawImported.source.css
              : fallbackImported.source.css,
        },
        initialSource: {
          html:
            typeof rawImported.initialSource?.html === 'string'
              ? rawImported.initialSource.html
              : fallbackImported.initialSource.html,
          css:
            typeof rawImported.initialSource?.css === 'string'
              ? rawImported.initialSource.css
              : fallbackImported.initialSource.css,
        },
        overrides: {
          ...fallbackImported.overrides,
          ...(rawImported.overrides || {}),
          mapped: {
            ...fallbackImported.overrides.mapped,
            ...(rawImported.overrides?.mapped || {}),
          },
        },
        mapping: {
          ...fallbackImported.mapping,
          ...(rawImported.mapping || {}),
        },
      }
    : fallbackImported;

  return {
    content: {
      title: { ...fallback.content.title, ...(candidate.content?.title || {}) },
      description: { ...fallback.content.description, ...(candidate.content?.description || {}) },
      number: { ...fallback.content.number, ...(candidate.content?.number || {}) },
      percentage: { ...fallback.content.percentage, ...(candidate.content?.percentage || {}) },
      analysis: { ...fallback.content.analysis, ...(candidate.content?.analysis || {}) },
      actionLabel: { ...fallback.content.actionLabel, ...(candidate.content?.actionLabel || {}) },
      badge: { ...fallback.content.badge, ...(candidate.content?.badge || {}) },
    },
    icon: { ...fallback.icon, ...(candidate.icon || {}) },
    dimensions: { ...fallback.dimensions, ...(candidate.dimensions || {}) },
    surface: { ...fallback.surface, ...(candidate.surface || {}) },
    imported: sanitizedImported,
  };
}

function validateImportedState(state: IndependentElementState): ValidationResult {
  const baseResult = validateIndependentElementState(state);
  const extraErrors: ValidationIssue[] = [];
  const extraWarnings: ValidationIssue[] = [];

  const imported = state.imported;
  if (!imported || typeof imported.source?.html !== 'string' || typeof imported.source?.css !== 'string') {
    extraErrors.push({
      code: 'INVALID_IMPORTED_SOURCE',
      field: 'imported.source',
      message: 'يجب أن يحتوي العنصر المستورد على source.html و source.css بنوع نصي صالح.',
      severity: 'error',
    });
  } else {
    const warnings = analyzeImportedComponentWarnings(imported.source.html, imported.source.css);
    for (const w of warnings) {
      extraWarnings.push({
        code: w.code,
        field: 'imported.source',
        message: w.message,
        severity: 'warning',
      });
    }
  }

  const allErrors = [...baseResult.errors, ...extraErrors];
  const allWarnings = [...baseResult.warnings, ...extraWarnings];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

function generateImportedHtml(input: RenderInput): string {
  const { scopeId, state } = input;
  const imported = ensureImportedData(state);
  const cleanHtml = stripJavaScriptFromHtml(imported.source.html);

  return [
    `<div class="beso-imported-component" data-element-scope="${scopeId}" data-imported-component="true">`,
    `  <div class="beso-imported-root">`,
    cleanHtml,
    `  </div>`,
    `</div>`,
  ].join('\n');
}

function generateImportedCss(input: RenderInput): string {
  const { scopeId, state } = input;
  const imported = ensureImportedData(state);
  const scopeSelector = `[data-element-scope="${scopeId}"]`;

  const scopedSourceCss = scopeImportedSourceCss(scopeSelector, imported.source.css);
  const overridesCss = generateImportedOverridesCss(scopeSelector, imported);

  return [
    `/* === [1] Source CSS (المصدر الأصلي المعزول ضمن ${scopeSelector}) === */`,
    scopedSourceCss,
    ``,
    `/* === [2] Independent Overrides Layer (طبقة التخصيصات المستقلة) === */`,
    overridesCss || `/* لا توجد تخصيصات إضافية مفعلة في طبقة overrides */`,
  ].join('\n');
}

/**
 * Renders the Imported Component inside an isolated `<iframe sandbox="" srcdoc="...">`
 * so `PreviewStage` does NOT need any modification and imported CSS NEVER affects Studio Shell!
 */
function renderImportedPreview(input: RenderInput): PreviewResult {
  const { instanceId, scopeId, state } = input;
  const imported = ensureImportedData(state);
  const srcDoc = buildImportedIframeSrcDoc(input);
  const escapedSrcDoc = escapeHtmlAttribute(srcDoc);

  const widthCss = resolveDimensionValueCss(
    imported.overrides.width,
    imported.overrides.widthUnit
  );
  const heightCss = resolveDimensionValueCss(
    imported.overrides.height,
    imported.overrides.heightUnit
  );

  const iframeHeightPx =
    typeof imported.overrides.height === 'number' && imported.overrides.heightUnit === 'px'
      ? Math.max(220, imported.overrides.height + 36)
      : 340;

  const previewHtml = [
    `<div class="beso-imported-stage-host" data-element-scope="${scopeId}" data-imported-iframe-container="true">`,
    `  <iframe`,
    `    class="beso-imported-sandbox-iframe"`,
    `    sandbox=""`,
    `    referrerpolicy="no-referrer"`,
    `    title="معاينة معزولة للعنصر المستورد (${scopeId})"`,
    `    srcdoc="${escapedSrcDoc}"`,
    `  ></iframe>`,
    `</div>`,
  ].join('\n');

  // Notice: previewCss injected into Studio DOM ONLY styles the iframe container host,
  // NEVER the user's raw `source.css`, guaranteeing 100% Studio Shell CSS protection!
  const previewCss = `[data-element-scope="${scopeId}"].beso-imported-stage-host {
  width: ${widthCss === 'auto' ? '100%' : widthCss};
  max-width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

[data-element-scope="${scopeId}"] .beso-imported-sandbox-iframe {
  width: 100%;
  min-height: ${iframeHeightPx}px;
  height: ${heightCss === 'auto' ? `${iframeHeightPx}px` : heightCss};
  border: 1px dashed rgba(212, 175, 55, 0.35);
  border-radius: 14px;
  background: transparent;
  display: block;
}`;

  return {
    instanceId,
    scopeId,
    html: previewHtml,
    css: previewCss,
    dimensionsSummary: {
      widthCss,
      heightCss,
    },
  };
}

function generateImportedExportBundle(input: RenderInput): ExportBundle {
  const html = generateImportedHtml(input);
  const css = generateImportedCss(input);
  const imported = ensureImportedData(input.state);
  const validation = validateImportedState(input.state);
  const warnings = analyzeImportedComponentWarnings(
    imported.source.html,
    imported.source.css
  ).map((w) => ({
    code: w.code,
    message: w.message,
  }));

  return createExportBundle({
    elementId: IMPORTED_COMPONENT_ID,
    elementType: IMPORTED_COMPONENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: validation.errors,
    warnings,
  });
}

export const importedComponentModule: ElementModule = {
  id: IMPORTED_COMPONENT_ID,
  type: IMPORTED_COMPONENT_ID,
  version: 1,
  family: 'imported',
  label: 'استيراد عنصر خارجي (Imported Component)',
  description:
    'استيراد كود HTML/CSS خارجي وعرضه داخل iframe معزول مع حفظ المصدر الأصلي وطبقة overrides مستقلة.',
  metadata: {
    label: 'استيراد عنصر خارجي (Imported Component)',
    description:
      'استيراد كود HTML/CSS خارجي وعرضه داخل iframe معزول مع حفظ المصدر الأصلي وطبقة overrides مستقلة.',
    family: 'imported',
    categories: ['imported', 'custom', 'external'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: true,
    usesJavaScript: false,
    supportsSlots: false,
  },
  defaultState: IMPORTED_COMPONENT_DEFAULT_STATE,
  controlSchema: IMPORTED_COMPONENT_CONTROL_SCHEMA,
  sanitizeState: sanitizeImportedState,
  validate: validateImportedState,
  generateHtml: generateImportedHtml,
  generateCss: generateImportedCss,
  renderPreview: renderImportedPreview,
  generateCode: generateImportedExportBundle,
};

export const importedComponentRegistration: RegisteredElementEntry = {
  id: IMPORTED_COMPONENT_ID,
  family: 'imported',
  categories: ['imported', 'custom', 'external'],
  status: 'stable',
  module: importedComponentModule,
};
