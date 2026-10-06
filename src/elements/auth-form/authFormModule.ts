/**
 * Beso Studio V2 — Production Auth Form Element Module ('auth-form')
 *
 * Category: 6. التنقل والنماذج ('navigation-forms')
 * Family: 'sections'
 *
 * Supports:
 * - 3 Form Modes:
 *   1. 'login' (تسجيل الدخول)
 *   2. 'register' (إنشاء حساب)
 *   3. 'recover' (استعادة كلمة المرور)
 * - Customizable Fields (`fields: AuthFormFieldItem[]`):
 *   fieldName, label, placeholder, helperText, errorMessage, icon, showIcon, iconColor
 * - Password visibility toggle (`showPasswordToggle`, `passwordRevealed`)
 * - Submit Button (`submitLabel`, `submitBackgroundColor`, `submitTextColor`, `submitBorderRadius`)
 * - Secondary Link (`secondaryLinkText`, `secondaryLinkHref`)
 * - Materials: 'glass' (زجاجية) | 'metal' (معدنية) | 'neon' (نيون)
 * - Independent Width & Height
 * - Purely presentational UI (zero backend or password storage)
 * - HTML & Accessibility validation (`<label for>`, `aria-describedby`, `aria-invalid`)
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
  AuthFormElementData,
  AuthFormFieldItem,
  cloneElementState,
  IndependentDimensions,
  IndependentElementState,
} from '../../core/state/elementStateTypes';
import {
  validateIndependentElementState,
  ValidationIssue,
  ValidationResult,
} from '../../core/validation/validator';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';

export const AUTH_FORM_ELEMENT_ID = 'auth-form';

const DEFAULT_FONT = AVAILABLE_FONTS[0].cssValue;

export const DEFAULT_AUTH_FORM_FIELDS: AuthFormFieldItem[] = [
  {
    id: 'field-name',
    fieldName: 'full_name',
    fieldType: 'text',
    label: 'الاسم الكامل',
    placeholder: 'أدخل اسمك الثلاثي',
    helperText: 'يظهر هذا الاسم في ملفك الشخصي.',
    showHelper: true,
    errorMessage: 'يرجى إدخال الاسم الكامل بشكل صحيح.',
    showError: false,
    icon: '👤',
    showIcon: true,
    iconColor: '#d4af37',
    visibleInModes: ['register'],
  },
  {
    id: 'field-email',
    fieldName: 'email',
    fieldType: 'email',
    label: 'البريد الإلكتروني',
    placeholder: 'name@domain.com',
    helperText: 'سنستخدم البريد لإرسال إشعارات الأمان فقط.',
    showHelper: true,
    errorMessage: 'صيغة البريد الإلكتروني غير صحيحة.',
    showError: false,
    icon: '✉️',
    showIcon: true,
    iconColor: '#d4af37',
    visibleInModes: ['login', 'register', 'recover'],
  },
  {
    id: 'field-password',
    fieldName: 'password',
    fieldType: 'password',
    label: 'كلمة المرور',
    placeholder: '••••••••••••',
    helperText: 'يجب ألا تقل عن 8 أحرف.',
    showHelper: true,
    errorMessage: 'كلمة المرور غير مطابقة للمتطلبات.',
    showError: false,
    icon: '🔒',
    showIcon: true,
    iconColor: '#d4af37',
    visibleInModes: ['login', 'register'],
  },
];

export const DEFAULT_AUTH_FORM_DATA: AuthFormElementData = {
  mode: 'login',
  material: 'glass',
  fields: DEFAULT_AUTH_FORM_FIELDS.map((f) => ({
    ...f,
    visibleInModes: [...f.visibleInModes],
  })),
  showPasswordToggle: true,
  passwordRevealed: false,
  submitLabel: {
    value: 'تسجيل الدخول الآمن',
    visible: true,
    color: '#071712',
    fontFamily: DEFAULT_FONT,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: 0,
    align: 'center',
  },
  submitBackgroundColor: '#d4af37',
  submitTextColor: '#071712',
  submitBorderRadius: 12,
  secondaryLinkText: {
    value: 'نسيت كلمة المرور؟ استعادة الحساب',
    visible: true,
    color: '#d4af37',
    fontFamily: DEFAULT_FONT,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: 0,
    align: 'center',
  },
  secondaryLinkHref: '#recover',
  glowColor: '#d4af37',
  glowIntensity: 28,
  glassBlur: 16,
};

export const AUTH_FORM_DEFAULT_STATE: IndependentElementState = {
  content: {
    title: {
      value: 'تسجيل الدخول إلى مساحة العمل',
      visible: true,
      color: '#ffffff',
      fontFamily: DEFAULT_FONT,
      fontSize: 22,
      fontWeight: 700,
      lineHeight: 1.35,
      letterSpacing: 0,
      align: 'start',
    },
    description: {
      value: 'نموذج مصادقة شكلي متجاوب يدعم إمكانية الوصول وتخصيص الحقول.',
      visible: true,
      color: '#c2d8d0',
      fontFamily: DEFAULT_FONT,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: 0,
      align: 'start',
    },
    number: {
      value: '256-bit',
      visible: false,
      color: '#d4af37',
      fontFamily: DEFAULT_FONT,
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
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
      align: 'start',
    },
    analysis: {
      value: 'واجهة شكلية مستقلة قابلة للتصدير الفوري',
      visible: true,
      color: '#9ec5b8',
      fontFamily: DEFAULT_FONT,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'center',
    },
    actionLabel: {
      value: 'تسجيل الدخول الآمن',
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
      value: 'بوابة الهوية',
      visible: true,
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
    value: '🛡️',
    color: '#d4af37',
    size: 22,
    rotate: 0,
    position: 'start',
  },
  dimensions: {
    width: 440,
    height: 'auto',
    minWidth: 260,
    maxWidth: 900,
    minHeight: 260,
    maxHeight: 'none',
    widthUnit: 'px',
    heightUnit: 'auto',
    lockAspectRatio: false,
  },
  surface: {
    materialType: 'glass',
    primaryColor: '#0c261e',
    secondaryColor: '#05120e',
    gradientDirection: '135deg',
    opacity: 100,
    glassBlur: 16,
    glowIntensity: 28,
    glowColor: '#d4af37',
    shadowIntensity: 42,
    shadowColor: '#000000',
    patternType: 'dots',
    imageSourceUrl: '',
    backgroundColor: '#0c261e',
    borderColor: 'rgba(212, 175, 55, 0.42)',
    accentColor: '#d4af37',
    badgeBackgroundColor: 'rgba(212, 175, 55, 0.14)',
    actionBackgroundColor: '#d4af37',
    actionTextColor: '#071712',
    iconContainerBackground: 'rgba(212, 175, 55, 0.14)',
    borderRadius: 22,
    borderWidth: 1,
    paddingX: 28,
    paddingY: 28,
    gap: 16,
  },
  authForm: {
    ...DEFAULT_AUTH_FORM_DATA,
    fields: DEFAULT_AUTH_FORM_DATA.fields.map((f) => ({
      ...f,
      visibleInModes: [...f.visibleInModes],
    })),
    submitLabel: { ...DEFAULT_AUTH_FORM_DATA.submitLabel },
    secondaryLinkText: { ...DEFAULT_AUTH_FORM_DATA.secondaryLinkText },
  },
};

export const AUTH_FORM_CONTROL_SCHEMA: ControlDefinition[] = [
  {
    id: 'authForm.mode',
    type: 'select',
    section: 'content',
    label: 'وضع النموذج والحقول والرسائل',
    targetKey: 'title',
  },
  {
    id: 'authForm.dimensions',
    type: 'dimension-config',
    section: 'dimensions',
    label: 'العرض والارتفاع المستقلان',
    targetKey: 'width',
  },
  {
    id: 'authForm.appearance',
    type: 'select',
    section: 'appearance',
    label: 'الخامة (زجاجية / معدنية / نيون)',
    targetKey: 'materialType',
  },
];

export function ensureAuthFormData(state: IndependentElementState): AuthFormElementData {
  if (state.authForm && Array.isArray(state.authForm.fields)) {
    return state.authForm;
  }
  return {
    ...DEFAULT_AUTH_FORM_DATA,
    fields: DEFAULT_AUTH_FORM_DATA.fields.map((f) => ({
      ...f,
      visibleInModes: [...f.visibleInModes],
    })),
    submitLabel: { ...DEFAULT_AUTH_FORM_DATA.submitLabel },
    secondaryLinkText: { ...DEFAULT_AUTH_FORM_DATA.secondaryLinkText },
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

function validateAuthFormState(state: IndependentElementState): ValidationResult {
  const base = validateIndependentElementState(state);
  const extraErrors: ValidationIssue[] = [];
  const auth = ensureAuthFormData(state);

  const activeFields = auth.fields.filter((f) => f.visibleInModes.includes(auth.mode));
  for (const field of activeFields) {
    if (!field.fieldName || !field.fieldName.trim()) {
      extraErrors.push({
        code: 'MISSING_AUTH_FIELD_NAME',
        field: `authForm.fields.${field.id}.fieldName`,
        message: `اسم الحقل البرمجي (name) مطلوب للحقل "${field.id}".`,
        severity: 'error',
      });
    }
    if (!field.label || !field.label.trim()) {
      extraErrors.push({
        code: 'MISSING_AUTH_FIELD_LABEL',
        field: `authForm.fields.${field.id}.label`,
        message: `النص التوضيحي (label) مطلوب للحقل "${field.fieldName || field.id}" لضمان إمكانية الوصول.`,
        severity: 'error',
      });
    }
  }

  return {
    valid: base.errors.length === 0 && extraErrors.length === 0,
    errors: [...base.errors, ...extraErrors],
    warnings: base.warnings,
  };
}

function generateAuthFormHtml(input: RenderInput): string {
  const { scopeId, state } = input;
  const auth = ensureAuthFormData(state);
  const { content } = state;

  const activeFields = auth.fields.filter((f) => f.visibleInModes.includes(auth.mode));

  const fieldsHtml = activeFields
    .map((field) => {
      const inputId = `${scopeId}-${field.id}`;
      const helperId = `${inputId}-helper`;
      const errorId = `${inputId}-error`;
      const isPasswordField = field.fieldType === 'password';
      const resolvedInputType =
        isPasswordField && auth.passwordRevealed ? 'text' : field.fieldType;

      const describedByIds: string[] = [];
      if (field.showHelper && field.helperText) describedByIds.push(helperId);
      if (field.showError && field.errorMessage) describedByIds.push(errorId);

      const ariaDescribedBy =
        describedByIds.length > 0 ? ` aria-describedby="${describedByIds.join(' ')}"` : '';
      const ariaInvalid = field.showError ? ' aria-invalid="true"' : '';

      const iconHtml =
        field.showIcon && field.icon
          ? `<span class="beso-auth__field-icon" style="color: ${escapeHtml(field.iconColor)}" aria-hidden="true">${escapeHtml(field.icon)}</span>`
          : '';

      const passwordToggleHtml =
        isPasswordField && auth.showPasswordToggle
          ? `<button type="button" class="beso-auth__pw-toggle" aria-label="${auth.passwordRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}">${auth.passwordRevealed ? 'إخفاء' : 'إظهار'}</button>`
          : '';

      return [
        `    <div class="beso-auth__field-group" data-field-id="${escapeHtml(field.id)}">`,
        `      <label class="beso-auth__label" for="${escapeHtml(inputId)}">${escapeHtml(field.label)}</label>`,
        `      <div class="beso-auth__input-wrap" data-has-error="${field.showError}">`,
        iconHtml ? `        ${iconHtml}` : '',
        `        <input`,
        `          id="${escapeHtml(inputId)}"`,
        `          class="beso-auth__input"`,
        `          name="${escapeHtml(field.fieldName)}"`,
        `          type="${resolvedInputType}"`,
        `          placeholder="${escapeHtml(field.placeholder)}"${ariaDescribedBy}${ariaInvalid}`,
        `        />`,
        passwordToggleHtml ? `        ${passwordToggleHtml}` : '',
        `      </div>`,
        field.showHelper && field.helperText
          ? `      <span id="${escapeHtml(helperId)}" class="beso-auth__helper">${escapeHtml(field.helperText)}</span>`
          : '',
        field.showError && field.errorMessage
          ? `      <span id="${escapeHtml(errorId)}" class="beso-auth__error" role="alert">${escapeHtml(field.errorMessage)}</span>`
          : '',
        `    </div>`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const submitHtml = auth.submitLabel.visible
    ? `    <button type="submit" class="beso-auth__submit">${escapeHtml(auth.submitLabel.value)}</button>`
    : '';

  const secondaryLinkHtml = auth.secondaryLinkText.visible
    ? `    <a class="beso-auth__secondary-link" href="${escapeHtml(auth.secondaryLinkHref)}">${escapeHtml(auth.secondaryLinkText.value)}</a>`
    : '';

  return [
    `<section class="beso-auth" data-element-scope="${scopeId}" data-auth-mode="${auth.mode}" data-auth-material="${auth.material}">`,
    `  <header class="beso-auth__header">`,
    content.badge.visible
      ? `    <span class="beso-auth__badge">${escapeHtml(content.badge.value)}</span>`
      : '',
    content.title.visible
      ? `    <h2 class="beso-auth__title">${escapeHtml(content.title.value)}</h2>`
      : '',
    content.description.visible
      ? `    <p class="beso-auth__desc">${escapeHtml(content.description.value)}</p>`
      : '',
    `  </header>`,
    `  <form class="beso-auth__form" action="#" method="post" novalidate="novalidate" onsubmit="return false;">`,
    fieldsHtml,
    submitHtml,
    secondaryLinkHtml,
    `  </form>`,
    `</section>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function generateAuthFormCss(input: RenderInput): string {
  const { scopeId, state } = input;
  const auth = ensureAuthFormData(state);
  const { content, surface, dimensions } = state;
  const { widthCss, heightCss } = resolveDimensionCss(dimensions);
  const S = `[data-element-scope="${scopeId}"]`;

  let materialCss = `background: linear-gradient(${surface.gradientDirection}, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%), ${surface.primaryColor};
  backdrop-filter: blur(${auth.glassBlur}px);
  -webkit-backdrop-filter: blur(${auth.glassBlur}px);`;

  if (auth.material === 'metal') {
    materialCss = `background: linear-gradient(140deg, #1b2a25 0%, #2b3d37 50%, #101b17 100%);`;
  } else if (auth.material === 'neon') {
    materialCss = `background: radial-gradient(circle at top, ${auth.glowColor}22 0%, ${surface.primaryColor} 70%);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.45), 0 0 ${Math.max(12, auth.glowIntensity)}px ${auth.glowColor}55;`;
  }

  return `${S}.beso-auth {
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
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  ${materialCss}
}

${S} .beso-auth__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

${S} .beso-auth__badge {
  align-self: flex-start;
  color: ${content.badge.color};
  font-size: ${content.badge.fontSize}px;
  font-weight: ${content.badge.fontWeight};
  background: ${surface.badgeBackgroundColor};
  padding: 4px 10px;
  border-radius: 999px;
}

${S} .beso-auth__title {
  margin: 0;
  color: ${content.title.color};
  font-family: ${content.title.fontFamily};
  font-size: ${content.title.fontSize}px;
  font-weight: ${content.title.fontWeight};
}

${S} .beso-auth__desc {
  margin: 0;
  color: ${content.description.color};
  font-family: ${content.description.fontFamily};
  font-size: ${content.description.fontSize}px;
  line-height: ${content.description.lineHeight};
}

${S} .beso-auth__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

${S} .beso-auth__field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

${S} .beso-auth__label {
  font-family: ${content.title.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${content.title.color};
}

${S} .beso-auth__input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid ${surface.borderColor};
}

${S} .beso-auth__input-wrap[data-has-error="true"] {
  border-color: #f87171;
}

${S} .beso-auth__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${content.title.color};
  font-family: ${content.description.fontFamily};
  font-size: 14px;
}

${S} .beso-auth__pw-toggle {
  background: rgba(255, 255, 255, 0.08);
  color: ${content.description.color};
  border: none;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}

${S} .beso-auth__helper {
  font-size: 11px;
  color: ${content.description.color};
}

${S} .beso-auth__error {
  font-size: 12px;
  font-weight: 600;
  color: #f87171;
}

${S} .beso-auth__submit {
  background: ${auth.submitBackgroundColor};
  color: ${auth.submitTextColor};
  border: none;
  border-radius: ${auth.submitBorderRadius}px;
  padding: 12px 18px;
  font-family: ${auth.submitLabel.fontFamily};
  font-size: ${auth.submitLabel.fontSize}px;
  font-weight: ${auth.submitLabel.fontWeight};
  cursor: pointer;
}

${S} .beso-auth__secondary-link {
  text-align: center;
  color: ${auth.secondaryLinkText.color};
  font-family: ${auth.secondaryLinkText.fontFamily};
  font-size: ${auth.secondaryLinkText.fontSize}px;
  font-weight: ${auth.secondaryLinkText.fontWeight};
  text-decoration: none;
}`;
}

function sanitizeAuthFormState(raw: unknown): IndependentElementState {
  if (!raw || typeof raw !== 'object') {
    return cloneElementState(AUTH_FORM_DEFAULT_STATE);
  }
  return cloneElementState({
    ...AUTH_FORM_DEFAULT_STATE,
    ...(raw as Partial<IndependentElementState>),
  });
}

function renderAuthFormPreview(input: RenderInput): PreviewResult {
  const html = generateAuthFormHtml(input);
  const css = generateAuthFormCss(input);
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

function generateAuthFormExportBundle(input: RenderInput): ExportBundle {
  const html = generateAuthFormHtml(input);
  const css = generateAuthFormCss(input);
  const validation = validateAuthFormState(input.state);

  return createExportBundle({
    elementId: AUTH_FORM_ELEMENT_ID,
    elementType: AUTH_FORM_ELEMENT_ID,
    version: 1,
    instanceId: input.instanceId,
    scopeSelector: `[data-element-scope="${input.scopeId}"]`,
    html,
    css,
    stateValidationErrors: validation.errors,
  });
}

export const authFormModule: ElementModule = {
  id: AUTH_FORM_ELEMENT_ID,
  type: AUTH_FORM_ELEMENT_ID,
  version: 1,
  family: 'sections',
  label: 'نموذج المصادقة والدخول (Auth Form)',
  description:
    'نموذج واجهة شكلية متكامل يدعم (تسجيل الدخول، إنشاء حساب، استعادة كلمة المرور)، تخصيص الحقول والرسائل، إظهار/إخفاء كلمة المرور، وخامات (Glass / Metal / Neon).',
  metadata: {
    label: 'نموذج المصادقة والدخول (Auth Form)',
    description:
      'نموذج واجهة شكلية متكامل يدعم (تسجيل الدخول، إنشاء حساب، استعادة كلمة المرور)، تخصيص الحقول والرسائل، إظهار/إخفاء كلمة المرور، وخامات (Glass / Metal / Neon).',
    family: 'sections',
    category: 'navigation-forms',
    tags: ['auth-form', 'login', 'register', 'recover', 'contact-form', 'نماذج', 'تسجيل الدخول'],
    originGroup: 'native',
    sortOrder: 10,
    categories: ['navigation-forms', 'forms'],
    status: 'stable',
    isProductionReady: true,
  },
  capabilities: {
    responsive: true,
    usesImages: false,
    usesJavaScript: false,
    supportsSlots: false,
  },
  defaultState: AUTH_FORM_DEFAULT_STATE,
  controlSchema: AUTH_FORM_CONTROL_SCHEMA,
  sanitizeState: sanitizeAuthFormState,
  validate: validateAuthFormState,
  generateHtml: generateAuthFormHtml,
  generateCss: generateAuthFormCss,
  renderPreview: renderAuthFormPreview,
  generateCode: generateAuthFormExportBundle,
};

export const authFormRegistration: RegisteredElementEntry = {
  id: AUTH_FORM_ELEMENT_ID,
  family: 'sections',
  category: 'navigation-forms',
  tags: ['auth-form', 'login', 'register', 'recover', 'contact-form', 'نماذج', 'تسجيل الدخول'],
  originGroup: 'native',
  sortOrder: 10,
  categories: ['navigation-forms', 'forms'],
  status: 'stable',
  module: authFormModule,
};
