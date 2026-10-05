/**
 * Beso Studio V2 — Validation Engine
 * Validates element state, independent fields, and generated HTML/CSS output.
 * Ensures zero `undefined`, `NaN`, or unscoped CSS leaks into exports.
 */

import {
  ContentFieldKey,
  EditableText,
  IndependentElementState,
} from '../state/elementStateTypes';

export interface ValidationIssue {
  code: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

const CONTENT_KEYS: ContentFieldKey[] = [
  'title',
  'description',
  'number',
  'percentage',
  'analysis',
  'actionLabel',
  'badge',
];

function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val) && !Number.isNaN(val);
}

function validateEditableText(key: ContentFieldKey, field: EditableText, issues: ValidationIssue[]): void {
  if (!field || typeof field !== 'object') {
    issues.push({
      code: 'MISSING_TEXT_FIELD',
      field: `content.${key}`,
      message: `حقل النص ${key} غير موجود أو غير صالح.`,
      severity: 'error',
    });
    return;
  }

  if (typeof field.value !== 'string') {
    issues.push({
      code: 'INVALID_TEXT_VALUE',
      field: `content.${key}.value`,
      message: `قيمة النص في ${key} يجب أن تكون نصية.`,
      severity: 'error',
    });
  }

  if (!isFiniteNumber(field.fontSize) || field.fontSize < 8 || field.fontSize > 120) {
    issues.push({
      code: 'INVALID_FONT_SIZE',
      field: `content.${key}.fontSize`,
      message: `حجم الخط في ${key} خارج النطاق المسموح (8px - 120px).`,
      severity: 'error',
    });
  }

  if (!isFiniteNumber(field.lineHeight) || field.lineHeight <= 0) {
    issues.push({
      code: 'INVALID_LINE_HEIGHT',
      field: `content.${key}.lineHeight`,
      message: `ارتفاع السطر في ${key} غير صالح.`,
      severity: 'error',
    });
  }

  if (!isFiniteNumber(field.letterSpacing)) {
    issues.push({
      code: 'INVALID_LETTER_SPACING',
      field: `content.${key}.letterSpacing`,
      message: `تباعد الأحرف في ${key} غير صالح.`,
      severity: 'error',
    });
  }

  if (!field.color || typeof field.color !== 'string') {
    issues.push({
      code: 'MISSING_TEXT_COLOR',
      field: `content.${key}.color`,
      message: `لون النص في ${key} غير معلن.`,
      severity: 'error',
    });
  }
}

export function validateIndependentElementState(state: IndependentElementState): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!state || typeof state !== 'object') {
    return {
      valid: false,
      errors: [
        {
          code: 'INVALID_STATE_ROOT',
          field: 'root',
          message: 'حالة العنصر غير صالحة.',
          severity: 'error',
        },
      ],
      warnings: [],
    };
  }

  // 1. Validate independent content fields
  for (const key of CONTENT_KEYS) {
    validateEditableText(key, state.content?.[key], issues);
  }

  // 2. Validate icon contract
  if (!state.icon || typeof state.icon !== 'object') {
    issues.push({
      code: 'INVALID_ICON_CONFIG',
      field: 'icon',
      message: 'إعدادات الأيقونة مفقودة.',
      severity: 'error',
    });
  } else {
    if (!isFiniteNumber(state.icon.size) || state.icon.size < 8 || state.icon.size > 200) {
      issues.push({
        code: 'INVALID_ICON_SIZE',
        field: 'icon.size',
        message: 'حجم الأيقونة يجب أن يكون رقمًا صالحًا بين 8 و 200.',
        severity: 'error',
      });
    }
    if (!isFiniteNumber(state.icon.rotate)) {
      issues.push({
        code: 'INVALID_ICON_ROTATE',
        field: 'icon.rotate',
        message: 'دوران الأيقونة يجب أن يكون رقمًا صالحًا.',
        severity: 'error',
      });
    }
  }

  // 3. Validate independent dimensions
  if (!state.dimensions || typeof state.dimensions !== 'object') {
    issues.push({
      code: 'INVALID_DIMENSIONS',
      field: 'dimensions',
      message: 'إعدادات الأبعاد مفقودة.',
      severity: 'error',
    });
  } else {
    const { width, height, minWidth, maxWidth, minHeight, maxHeight } = state.dimensions;
    if (width !== 'auto' && (!isFiniteNumber(width) || width <= 0)) {
      issues.push({
        code: 'INVALID_WIDTH',
        field: 'dimensions.width',
        message: 'قيمة العرض يجب أن تكون رقمًا موجبًا أو auto.',
        severity: 'error',
      });
    }
    if (height !== 'auto' && (!isFiniteNumber(height) || height <= 0)) {
      issues.push({
        code: 'INVALID_HEIGHT',
        field: 'dimensions.height',
        message: 'قيمة الارتفاع يجب أن تكون رقمًا موجبًا أو auto.',
        severity: 'error',
      });
    }
    if (!isFiniteNumber(minWidth) || minWidth < 0) {
      issues.push({
        code: 'INVALID_MIN_WIDTH',
        field: 'dimensions.minWidth',
        message: 'الحد الأدنى للعرض غير صالح.',
        severity: 'error',
      });
    }
    if (maxWidth !== 'none' && (!isFiniteNumber(maxWidth) || maxWidth <= 0)) {
      issues.push({
        code: 'INVALID_MAX_WIDTH',
        field: 'dimensions.maxWidth',
        message: 'الحد الأقصى للعرض غير صالح.',
        severity: 'error',
      });
    }
    if (!isFiniteNumber(minHeight) || minHeight < 0) {
      issues.push({
        code: 'INVALID_MIN_HEIGHT',
        field: 'dimensions.minHeight',
        message: 'الحد الأدنى للارتفاع غير صالح.',
        severity: 'error',
      });
    }
    if (maxHeight !== 'none' && (!isFiniteNumber(maxHeight) || maxHeight <= 0)) {
      issues.push({
        code: 'INVALID_MAX_HEIGHT',
        field: 'dimensions.maxHeight',
        message: 'الحد الأقصى للارتفاع غير صالح.',
        severity: 'error',
      });
    }
  }

  const errors = issues.filter((item) => item.severity === 'error');
  const warnings = issues.filter((item) => item.severity === 'warning');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates generated HTML and CSS strings to guarantee zero `undefined` or `NaN` tokens.
 */
export function validateGeneratedCodeOutput(
  html: string,
  css: string,
  scopeId?: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (/\bundefined\b/.test(html) || /\bNaN\b/.test(html)) {
    issues.push({
      code: 'DIRTY_HTML_OUTPUT',
      field: 'export.html',
      message: 'يحتوي كود HTML المولد على قيمة undefined أو NaN.',
      severity: 'error',
    });
  }

  if (/\bundefined\b/.test(css) || /\bNaN\b/.test(css)) {
    issues.push({
      code: 'DIRTY_CSS_OUTPUT',
      field: 'export.css',
      message: 'يحتوي كود CSS المولد على قيمة undefined أو NaN.',
      severity: 'error',
    });
  }

  if (scopeId && !css.includes(scopeId)) {
    issues.push({
      code: 'UNSCOPED_CSS',
      field: 'export.css',
      message: `كود CSS لا يستخدم النطاق المعزول (${scopeId}).`,
      severity: 'error',
    });
  }

  return issues;
}
